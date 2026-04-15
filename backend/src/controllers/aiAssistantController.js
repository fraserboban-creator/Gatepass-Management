'use strict';

const { db } = require('../config/database');
const aiCommandParserService = require('../services/aiCommandParserService');
const AiCommandValidatorService = require('../services/aiCommandValidatorService');
const aiCommandExecutorService = require('../services/aiCommandExecutorService');
const AuditLoggerService = require('../services/auditLoggerService');

const DESTRUCTIVE_ACTIONS = ['delete_user', 'deactivate_user'];

class AiAssistantController {
  /**
   * Parse, validate, and execute (or queue for confirmation) an AI command.
   */
  static async executeCommand(req, res, next) {
    try {
      // 1. Log access attempt (non-fatal)
      try {
        AuditLoggerService.logEvent({
          adminId: req.user.id,
          eventType: 'access_attempt',
          status: 'success',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { path: req.path }
        });
      } catch (auditErr) {
        console.warn('[aiAssistantController] Audit log failed (non-fatal):', auditErr.message);
      }

      // 2. Validate input
      const { command } = req.body;
      if (!command || typeof command !== 'string' || command.trim().length === 0 || command.length > 500) {
        return res.status(400).json({
          success: false,
          error: 'invalid_input',
          message: 'Command must be a non-empty string of at most 500 characters.'
        });
      }

      // 3. Parse command
      let parsed;
      try {
        parsed = await aiCommandParserService.parseCommand(command);
      } catch (aiError) {
        console.error('[aiAssistantController] AI service error:', aiError.message);
        return res.status(503).json({
          success: false,
          error: 'ai_service_error',
          message: 'The AI service is temporarily unavailable. Please try again in a moment.'
        });
      }

      // 3b. If AI didn't extract a user identifier, try to extract name/email from raw command text
      if (!parsed.user_id && !parsed.name && !parsed.email) {
        const emailMatch = command.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/);
        if (emailMatch) {
          parsed.email = emailMatch[0];
        } else {
          // Try patterns like "delete user John Doe", "delete John Doe", "remove user John Doe"
          const nameMatch = command.match(
            /(?:delete|remove|deactivate|activate|update)\s+(?:user\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
          );
          if (nameMatch) {
            parsed.name = nameMatch[1].trim();
          }
        }
      }

      // 4. Low confidence check
      if (parsed.confidence < 70) {
        return res.status(200).json({
          success: false,
          error: 'unclear_command',
          message: 'I could not understand your command clearly. Please rephrase it.',
          data: { parsed }
        });
      }

      // 5. Validate parsed command
      const { valid, errors } = await AiCommandValidatorService.validate(parsed, req.user.id);
      if (!valid) {
        return res.status(400).json({
          success: false,
          error: 'validation_failed',
          details: errors
        });
      }

      // 7. Destructive actions require confirmation — insert pending row and return early
      if (DESTRUCTIVE_ACTIONS.includes(parsed.action)) {
        let pendingCommandId = null;
        try {
          const insert = db.prepare(`
            INSERT INTO ai_command_history
              (admin_id, command_text, parsed_data, action, confidence_score, execution_status, requires_confirmation)
            VALUES (?, ?, ?, ?, ?, 'pending_confirmation', 1)
          `);
          const result = insert.run(
            req.user.id,
            command,
            JSON.stringify(parsed),
            parsed.action,
            parsed.confidence
          );
          pendingCommandId = Number(result.lastInsertRowid);
        } catch (histErr) {
          console.warn('[aiAssistantController] History insert failed (non-fatal):', histErr.message);
        }

        return res.status(200).json({
          success: false,
          requiresConfirmation: true,
          commandId: pendingCommandId,
          data: { parsed }
        });
      }

      // 8. Execute command
      const execResult = await aiCommandExecutorService.execute(parsed, req.user.id);

      // 9. Insert history row (non-fatal)
      let commandId = null;
      try {
        const insert = db.prepare(`
          INSERT INTO ai_command_history
            (admin_id, command_text, parsed_data, action, confidence_score,
             execution_status, execution_result, error_message, executed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        const historyRow = insert.run(
          req.user.id,
          command,
          JSON.stringify(parsed),
          parsed.action,
          parsed.confidence,
          execResult.success ? 'success' : 'failed',
          execResult.data ? JSON.stringify(execResult.data) : null,
          execResult.success ? null : (execResult.error || 'Execution failed')
        );
        commandId = Number(historyRow.lastInsertRowid);
      } catch (histErr) {
        console.warn('[aiAssistantController] History insert failed (non-fatal):', histErr.message);
      }

      // 10. Log command_execution event (non-fatal)
      try {
        AuditLoggerService.logEvent({
          adminId: req.user.id,
          commandHistoryId: commandId,
          eventType: 'command_execution',
          status: execResult.success ? 'success' : 'failure',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { action: parsed.action }
        });
      } catch (auditErr) {
        console.warn('[aiAssistantController] Audit log failed (non-fatal):', auditErr.message);
      }

      // 11. Return result
      if (!execResult.success) {
        return res.status(400).json({
          success: false,
          error: 'execution_failed',
          message: execResult.error || 'Failed to execute command.'
        });
      }

      return res.status(200).json({
        success: true,
        message: `User ${parsed.action === 'create_user' ? 'created' : parsed.action.replace('_user', 'd')} successfully.`,
        data: {
          commandId,
          action: parsed.action,
          result: execResult.data,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm and execute a previously queued destructive command.
   */
  static async confirmCommand(req, res, next) {
    try {
      const { commandId } = req.body;

      if (!commandId) {
        return res.status(400).json({
          success: false,
          error: 'invalid_input',
          message: 'commandId is required.'
        });
      }

      // Look up pending row belonging to this admin
      const row = db.prepare(`
        SELECT * FROM ai_command_history
        WHERE id = ? AND admin_id = ?
      `).get(commandId, req.user.id);

      if (!row || row.execution_status !== 'pending_confirmation') {
        return res.status(400).json({
          success: false,
          error: 'not_found_or_already_confirmed',
          message: 'Command not found or already confirmed.'
        });
      }

      const parsed = JSON.parse(row.parsed_data);

      // Execute the destructive action
      const execResult = await aiCommandExecutorService.execute(parsed, req.user.id);

      // Update history row
      db.prepare(`
        UPDATE ai_command_history
        SET confirmation_given = 1,
            confirmed_at = CURRENT_TIMESTAMP,
            execution_status = ?,
            execution_result = ?,
            executed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        execResult.success ? 'success' : 'failed',
        JSON.stringify(execResult.data ?? null),
        commandId
      );

      // Log confirmation (non-fatal)
      try {
        AuditLoggerService.logEvent({
          adminId: req.user.id,
          commandHistoryId: commandId,
          eventType: 'command_execution',
          status: execResult.success ? 'success' : 'failure',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { action: parsed.action, confirmed: true }
        });
      } catch (auditErr) {
        console.warn('[aiAssistantController] Audit log failed (non-fatal):', auditErr.message);
      }

      return res.status(200).json({
        success: true,
        data: { result: execResult.data }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Return the last 20 command history rows for the requesting admin,
   * with optional ?action= and ?date= filters.
   */
  static getHistory(req, res, next) {
    try {
      const { action, date } = req.query;

      let query = `
        SELECT * FROM ai_command_history
        WHERE admin_id = ?
      `;
      const params = [req.user.id];

      if (action) {
        query += ' AND action = ?';
        params.push(action);
      }

      if (date) {
        query += ' AND DATE(created_at) = DATE(?)';
        params.push(date);
      }

      query += ' ORDER BY created_at DESC LIMIT 20';

      let history = [];
      try {
        history = db.prepare(query).all(...params);
      } catch (dbErr) {
        // Table may not exist yet — return empty history gracefully
        console.warn('[aiAssistantController] History query failed (non-fatal):', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        data: { history }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AiAssistantController;

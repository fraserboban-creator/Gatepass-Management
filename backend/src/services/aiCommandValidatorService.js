const UserModel = require('../models/userModel');

const VALID_ROLES = ['student', 'coordinator', 'warden', 'security', 'admin'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROOM_REGEX = /^[A-Z]-\d{3}$/;

class AiCommandValidatorService {
  /**
   * Validate a parsed AI command before execution.
   * @param {Object} parsedCommand - The parsed command object from aiCommandParserService
   * @param {number|string} requestingAdminId - The ID of the admin issuing the command
   * @returns {{ valid: boolean, errors: Array<{ field: string, message: string }> }}
   */
  static async validate(parsedCommand, requestingAdminId) {
    const errors = [];
    const { action } = parsedCommand;

    if (!action) {
      errors.push({ field: 'action', message: 'Action is required' });
      return { valid: false, errors };
    }

    switch (action) {
      case 'create_user':
        AiCommandValidatorService._validateCreateUser(parsedCommand, errors);
        break;
      case 'update_user':
        AiCommandValidatorService._validateUpdateUser(parsedCommand, errors);
        break;
      case 'delete_user':
      case 'deactivate_user':
      case 'activate_user':
        AiCommandValidatorService._validateUserIdRequired(parsedCommand, errors);
        break;
      default:
        errors.push({ field: 'action', message: `Unknown action: ${action}` });
        return { valid: false, errors };
    }

    // If format errors exist, skip DB checks
    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Database constraint checks (also resolves user_id from email/name)
    await AiCommandValidatorService._validateDatabaseConstraints(parsedCommand, errors);

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Self-protection: cannot delete or deactivate own account
    if (action === 'delete_user' || action === 'deactivate_user') {
      if (String(parsedCommand.user_id) === String(requestingAdminId)) {
        errors.push({ field: 'user_id', message: 'You cannot delete or deactivate your own account' });
        return { valid: false, errors };
      }
    }

    return { valid: true, errors };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  static _validateCreateUser(cmd, errors) {
    if (!cmd.name || String(cmd.name).trim() === '') {
      errors.push({ field: 'name', message: 'Name is required for create_user' });
    }

    if (!cmd.email || String(cmd.email).trim() === '') {
      errors.push({ field: 'email', message: 'Email is required for create_user' });
    } else if (!EMAIL_REGEX.test(cmd.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (!cmd.role || String(cmd.role).trim() === '') {
      errors.push({ field: 'role', message: 'Role is required for create_user' });
    } else if (!VALID_ROLES.includes(cmd.role)) {
      errors.push({ field: 'role', message: `Role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    if (cmd.room_number != null && cmd.room_number !== '') {
      if (!ROOM_REGEX.test(cmd.room_number)) {
        errors.push({ field: 'room_number', message: 'Room number must match format A-101 (letter, dash, three digits)' });
      }
    }
  }

  static _validateUpdateUser(cmd, errors) {
    // user_id OR email OR name must identify the target
    if (!cmd.user_id && !cmd.email && !cmd.name) {
      errors.push({ field: 'user_id', message: 'user_id, email, or name is required to identify the user for update_user' });
    }

    const updatableFields = ['name', 'email', 'role', 'room_number'];
    const hasAtLeastOne = updatableFields.some(f => cmd[f] != null && cmd[f] !== '');
    if (!hasAtLeastOne) {
      errors.push({ field: 'fields', message: 'At least one of name, email, role, or room_number must be provided for update_user' });
    }

    if (cmd.email != null && cmd.email !== '' && !EMAIL_REGEX.test(cmd.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (cmd.role != null && cmd.role !== '' && !VALID_ROLES.includes(cmd.role)) {
      errors.push({ field: 'role', message: `Role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    if (cmd.room_number != null && cmd.room_number !== '' && !ROOM_REGEX.test(cmd.room_number)) {
      errors.push({ field: 'room_number', message: 'Room number must match format A-101 (letter, dash, three digits)' });
    }
  }

  static _validateUserIdRequired(cmd, errors) {
    // Accept user_id, email, or name as the user identifier
    if (!cmd.user_id && !cmd.email && !cmd.name) {
      errors.push({ field: 'user_id', message: `user_id, email, or name is required for ${cmd.action}` });
    }
  }

  static async _validateDatabaseConstraints(cmd, errors) {
    const { action } = cmd;

    if (action === 'create_user') {
      const existing = UserModel.findByEmail(cmd.email);
      if (existing) {
        errors.push({ field: 'email', message: 'A user with this email already exists' });
      }
      return;
    }

    // For update/delete/deactivate/activate: resolve user by id → email → name
    let user = null;
    if (cmd.user_id) {
      user = UserModel.findById(cmd.user_id);
    } else if (cmd.email) {
      user = UserModel.findByEmail(cmd.email);
    } else if (cmd.name) {
      user = UserModel.findByName(cmd.name);
    }

    if (!user) {
      const identifier = cmd.user_id
        ? `id ${cmd.user_id}`
        : cmd.email
        ? `email ${cmd.email}`
        : `name "${cmd.name}"`;
      errors.push({ field: 'user_id', message: `User with ${identifier} not found` });
      return;
    }

    // Resolve user_id so the executor always has it
    cmd.user_id = user.id;
  }
}

module.exports = AiCommandValidatorService;

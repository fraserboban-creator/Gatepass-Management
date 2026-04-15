'use strict';

const UserModel = require('../models/userModel');
const AuthService = require('./authService');
const { sanitizeUser } = require('../utils/helpers');

/**
 * Map a UserModel row to the standard result shape.
 */
function toUserResult(user) {
  return {
    userId: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    room_number: user.room_number ?? null,
  };
}

/**
 * Execute a parsed AI command against the appropriate UserModel / AuthService method.
 *
 * @param {object} parsedCommand - Output from aiCommandParserService / aiCommandValidatorService
 * @param {number} adminId       - ID of the admin issuing the command (unused here but available for future audit use)
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
async function execute(parsedCommand, adminId) {
  const { action, name, email, role, room_number, user_id } = parsedCommand;

  try {
    switch (action) {
      case 'create_user': {
        // Generate a temporary password — admin can reset via normal flows
        const tempPassword = `Temp@${Math.random().toString(36).slice(2, 10)}`;
        const bcrypt = require('bcryptjs');
        const password_hash = await bcrypt.hash(tempPassword, 10);

        // Check duplicate email first
        const existing = UserModel.findByEmail(email);
        if (existing) {
          return { success: false, error: 'A user with that email already exists.' };
        }

        const newUserId = UserModel.create({
          full_name: name,
          email,
          role,
          room_number: room_number ?? null,
          password_hash,
        });

        const created = UserModel.findById(newUserId);
        return {
          success: true,
          data: {
            userId: created?.id ?? newUserId,
            name: created?.full_name ?? name,
            email: created?.email ?? email,
            role: created?.role ?? role,
            room_number: created?.room_number ?? room_number ?? null,
          },
        };
      }

      case 'update_user': {
        const updates = {};
        if (name !== undefined && name !== null) updates.full_name = name;
        if (email !== undefined && email !== null) updates.email = email;
        if (role !== undefined && role !== null) updates.role = role;
        if (room_number !== undefined && room_number !== null) updates.room_number = room_number;

        UserModel.update(user_id, updates);
        const updated = UserModel.findById(user_id);
        return {
          success: true,
          data: toUserResult(updated),
        };
      }

      case 'delete_user': {
        const target = UserModel.findById(user_id);
        UserModel.delete(user_id);
        return {
          success: true,
          data: {
            userId: user_id,
            name: target?.full_name ?? null,
            email: target?.email ?? null,
            role: target?.role ?? null,
            room_number: target?.room_number ?? null,
          },
        };
      }

      case 'deactivate_user': {
        UserModel.deactivate(user_id);
        const deactivated = UserModel.findById(user_id);
        return {
          success: true,
          data: toUserResult(deactivated),
        };
      }

      case 'activate_user': {
        UserModel.activate(user_id);
        const activated = UserModel.findById(user_id);
        return {
          success: true,
          data: toUserResult(activated),
        };
      }

      default:
        return {
          success: false,
          error: `Unknown action: ${action}`,
        };
    }
  } catch (err) {
    console.error(`[aiCommandExecutorService] action=${action} failed:`, err.message, err.stack);
    return {
      success: false,
      error: getUserFriendlyError(action, err),
    };
  }
}

/**
 * Convert a raw error into a user-friendly message without exposing internals.
 */
function getUserFriendlyError(action, err) {
  const msg = err?.message ?? '';

  if (msg.includes('already exists') || msg.includes('UNIQUE constraint')) {
    return 'A user with that email already exists.';
  }
  if (msg.includes('not found') || msg.includes('no such')) {
    return 'The specified user could not be found.';
  }

  switch (action) {
    case 'create_user':
      return 'Failed to create user. Please check the provided details and try again.';
    case 'update_user':
      return 'Failed to update user. Please check the provided details and try again.';
    case 'delete_user':
      return 'Failed to delete user. Please try again.';
    case 'deactivate_user':
      return 'Failed to deactivate user. Please try again.';
    case 'activate_user':
      return 'Failed to activate user. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

module.exports = { execute };

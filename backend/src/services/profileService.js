const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { sanitizeUser } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

class ProfileService {
  /**
   * Get user profile
   */
  static getProfile(userId) {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  static updateProfile(userId, updates) {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Only allow updating specific fields
    const allowedUpdates = {
      full_name: updates.full_name,
      phone: updates.phone,
      room_number: updates.room_number,
      parent_name: updates.parent_name,
      parent_email: updates.parent_email,
      parent_phone: updates.parent_phone,
      parent_notification_enabled: updates.parent_notification_enabled !== undefined
        ? (updates.parent_notification_enabled ? 1 : 0)
        : undefined
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    UserModel.update(userId, allowedUpdates);
    const updatedUser = UserModel.findById(userId);
    return sanitizeUser(updatedUser);
  }

  /**
   * Check password strength
   */
  static checkPasswordStrength(password) {
    const feedback = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    else feedback.push('at least 8 characters');

    if (password.length >= 12) score++;

    // Uppercase check
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('uppercase letters');

    // Lowercase check
    if (/[a-z]/.test(password)) score++;
    else feedback.push('lowercase letters');

    // Number check
    if (/\d/.test(password)) score++;
    else feedback.push('numbers');

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    else feedback.push('special characters');

    return {
      score,
      isStrong: score >= 4,
      feedback
    };
  }

  /**
   * Change password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    UserModel.update(userId, {
      password_hash: newPasswordHash
    });

    return true;
  }

  /**
   * Upload profile picture
   */
  static uploadProfilePicture(userId, file) {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}-${timestamp}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    // Update user profile picture URL
    const profilePictureUrl = `/uploads/profiles/${filename}`;
    UserModel.update(userId, {
      profile_picture: profilePictureUrl
    });

    const updatedUser = UserModel.findById(userId);
    return sanitizeUser(updatedUser);
  }

  /**
   * Get account information
   */
  static getAccountInfo(userId) {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      phone: user.phone,
      student_id: user.student_id,
      room_number: user.room_number,
      hostel_block: user.hostel_block,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      account_status: user.is_active ? 'Active' : 'Inactive',
      account_age: this.calculateAccountAge(user.created_at)
    };
  }

  /**
   * Calculate account age
   */
  static calculateAccountAge(createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}

module.exports = ProfileService;

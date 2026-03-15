const ProfileService = require('../services/profileService');

class ProfileController {
  /**
   * Get user profile
   */
  static getProfile(req, res, next) {
    try {
      const profile = ProfileService.getProfile(req.user.id);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      res.json({
        success: true,
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static updateProfile(req, res, next) {
    try {
      const { full_name, phone, room_number, parent_name, parent_email, parent_phone, parent_notification_enabled } = req.body;

      // Validate input
      if (!full_name || full_name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Full name is required'
        });
      }

      const profile = ProfileService.updateProfile(req.user.id, {
        full_name: full_name.trim(),
        phone: phone || null,
        room_number: room_number || null,
        parent_name: parent_name || null,
        parent_email: parent_email || null,
        parent_phone: parent_phone || null,
        parent_notification_enabled
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update parent notification toggle only
   */
  static updateParentNotification(req, res, next) {
    try {
      const { enabled } = req.body;
      ProfileService.updateProfile(req.user.id, { parent_notification_enabled: enabled });
      res.json({
        success: true,
        message: enabled ? 'Parent notifications enabled successfully.' : 'Parent notifications disabled.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(req, res, next) {
    try {
      const { current_password, new_password, confirm_password } = req.body;

      // Validate input
      if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'All password fields are required'
        });
      }

      if (new_password !== confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'New passwords do not match'
        });
      }

      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }

      // Check password strength
      const passwordStrength = ProfileService.checkPasswordStrength(new_password);
      if (!passwordStrength.isStrong) {
        return res.status(400).json({
          success: false,
          message: `Password is too weak. ${passwordStrength.feedback.join(', ')}`
        });
      }

      await ProfileService.changePassword(req.user.id, current_password, new_password);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Upload profile picture
   */
  static uploadProfilePicture(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed (JPEG, PNG, GIF, WebP)'
        });
      }

      // Validate file size (max 5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size must not exceed 5MB'
        });
      }

      const profile = ProfileService.uploadProfilePicture(req.user.id, req.file);

      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get account information
   */
  static getAccountInfo(req, res, next) {
    try {
      const accountInfo = ProfileService.getAccountInfo(req.user.id);

      res.json({
        success: true,
        data: { accountInfo }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;

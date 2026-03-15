const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All profile routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/', ProfileController.getProfile);

// Update user profile
router.put('/', ProfileController.updateProfile);

// Change password
router.put('/password', ProfileController.changePassword);

// Upload profile picture
router.post('/picture', upload.single('profile_picture'), ProfileController.uploadProfilePicture);

// Update parent notification toggle
router.put('/parent-notification', ProfileController.updateParentNotification);

// Get account information
router.get('/account-info', ProfileController.getAccountInfo);

module.exports = router;

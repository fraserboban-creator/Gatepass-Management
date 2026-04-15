const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const gatepassRoutes = require('./gatepassRoutes');
const qrRoutes = require('./qrRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const searchRoutes = require('./searchRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const studentRoutes = require('./studentRoutes');
const overdueRoutes = require('./overdueRoutes');
const visitorPassRoutes = require('./visitorPassRoutes');
const profileRoutes = require('./profileRoutes');
const aiAssistantRoutes = require('./aiAssistantRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/gatepass', gatepassRoutes);
router.use('/qr', qrRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/search', searchRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/student', studentRoutes);
router.use('/overdue', overdueRoutes);
router.use('/visitor-pass', visitorPassRoutes);
router.use('/admin', aiAssistantRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

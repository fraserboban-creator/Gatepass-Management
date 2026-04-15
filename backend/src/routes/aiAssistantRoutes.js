'use strict';

const express = require('express');
const router = express.Router();
const AiAssistantController = require('../controllers/aiAssistantController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');
const { aiRateLimiter } = require('../middleware/aiRateLimitMiddleware');

const guard = [authenticateToken, authorize(ROLES.ADMIN), aiRateLimiter];

router.post('/ai-command', ...guard, AiAssistantController.executeCommand);
router.post('/ai-command/confirm', ...guard, AiAssistantController.confirmCommand);
router.get('/ai-command/history', ...guard, AiAssistantController.getHistory);

module.exports = router;

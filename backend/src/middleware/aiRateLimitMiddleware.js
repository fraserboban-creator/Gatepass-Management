const rateLimit = require('express-rate-limit');
const AuditLoggerService = require('../services/auditLoggerService');

/**
 * Rate limiter for AI admin assistant commands.
 * Limit: 60 commands per hour per admin user ID.
 * Super admins are exempt from the limit.
 */
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,

  // Key by admin user ID
  keyGenerator: (req) => req.user?.id?.toString(),

  // Skip limit for super_admin role
  skip: (req) => req.user?.role === 'super_admin',

  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);

    // Log the rate limit violation
    try {
      AuditLoggerService.logEvent({
        adminId: req.user?.id,
        commandHistoryId: null,
        eventType: 'rate_limit_violation',
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { path: req.path, method: req.method }
      });
    } catch (err) {
      // Non-fatal: don't block the response if audit logging fails
    }

    res.set('Retry-After', retryAfter);
    res.status(429).json({
      success: false,
      message: `Rate limit exceeded. You can retry after ${retryAfter} seconds.`
    });
  }
});

module.exports = { aiRateLimiter };

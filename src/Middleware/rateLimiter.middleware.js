import { redisClient } from "../DB/redis.connection.js";
import logger from "../Utils/logger.utils.js";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from "../../config/config.service.js";

/**
 * Rate limiter middleware using Redis
 * @param {Object} options - Rate limiter configuration
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.keyGenerator - Custom key generator function
 * @param {string} options.message - Custom error message
 * @returns {Function} Express middleware
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = RATE_LIMIT_WINDOW_MS,
    max = RATE_LIMIT_MAX_REQUESTS,
    keyGenerator = (req) => {
      // Use IP address as default key, fallback to user ID if authenticated
      const userId = req.user?.id;
      return userId ? `user:${userId}` : `ip:${req.ip || req.connection.remoteAddress}`;
    },
    message = "Too many requests, please try again later."
  } = options;

  return async (req, res, next) => {
    try {
      const key = `rate_limit:${keyGenerator(req)}`;
      const current = await redisClient.incr(key);
      
      // Set expiration on first request
      if (current === 1) {
        await redisClient.expire(key, Math.ceil(windowMs / 1000));
      }

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': Math.max(0, max - current),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      if (current > max) {
        logger.warning(`Rate limit exceeded for key: ${key}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          current,
          max
        });
        
        return res.status(429).json({
          success: false,
          message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // Fail open - allow request if Redis is down
      next();
    }
  };
};

/**
 * Strict rate limiter for sensitive endpoints (e.g., login, password reset)
 */
export const strictRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many attempts, please try again after 15 minutes."
});

/**
 * API rate limiter for general API endpoints
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "API rate limit exceeded, please try again later."
});

/**
 * Auth rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per window
  message: "Too many authentication attempts, please try again later."
});

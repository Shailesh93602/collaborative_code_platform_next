import { getDictionary } from '@/get-dictionaries';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

const applyMiddleware = (middleware) => (request, response) =>
  new Promise((resolve, reject) => {
    middleware(request, response, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
    );
  });

const getIP = (request) =>
  request.ip ||
  request.headers['x-forwarded-for'] ||
  request.headers['x-real-ip'] ||
  request.connection.remoteAddress;

export const rateLimiter = rateLimit({
  keyGenerator: getIP,
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: async (req, res) => {
    const dictionary = await getDictionary(req.query.lang as 'en' | 'hi' | 'gu');
    return dictionary?.rateLimit?.tooManyRequests;
  },
});

export const speedLimiter = slowDown({
  keyGenerator: getIP,
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500,
});

export const applyRateLimit = applyMiddleware(rateLimiter);
export const applySpeedLimit = applyMiddleware(speedLimiter);

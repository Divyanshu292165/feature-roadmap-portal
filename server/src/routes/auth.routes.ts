import { Router } from 'express';
import { register, login, refresh, logout, verifyEmail, forgotPassword, resetPassword, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', authRateLimiter, asyncHandler(register));
router.post('/login', authRateLimiter, asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.post('/verify-email', asyncHandler(verifyEmail));
router.get('/verify-email/:token', asyncHandler(verifyEmail));
router.post('/forgot-password', authRateLimiter, asyncHandler(forgotPassword));
router.post('/reset-password', authRateLimiter, asyncHandler(resetPassword));
router.post('/reset-password/:token', authRateLimiter, asyncHandler(resetPassword));
router.get('/me', requireAuth, asyncHandler(getMe));

export default router;

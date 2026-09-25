import { Router } from 'express';
import { getRoadmap } from '../controllers/roadmap.controller';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', optionalAuth, asyncHandler(getRoadmap));

export default router;

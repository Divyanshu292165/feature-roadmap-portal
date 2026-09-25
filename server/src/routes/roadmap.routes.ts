import { Router } from 'express';
import { getRoadmap } from '../controllers/roadmap.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', requireAuth, asyncHandler(getRoadmap));

export default router;

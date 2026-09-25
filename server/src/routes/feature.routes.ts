import { Router } from 'express';
import { getFeatures, getFeature, createFeature, updateFeature, deleteFeature } from '../controllers/feature.controller';
import { addVote, removeVote } from '../controllers/vote.controller';
import { getComments, createComment } from '../controllers/comment.controller';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public reads (optionalAuth so hasVoted/ownership can be resolved when logged in)
router.get('/', optionalAuth, asyncHandler(getFeatures));
router.get('/:id', optionalAuth, asyncHandler(getFeature));

// Authenticated writes
router.post('/', requireAuth, asyncHandler(createFeature));
router.patch('/:id', requireAuth, asyncHandler(updateFeature));
router.delete('/:id', requireAdmin, asyncHandler(deleteFeature));

router.post('/:id/vote', requireAuth, asyncHandler(addVote));
router.delete('/:id/vote', requireAuth, asyncHandler(removeVote));

// Public comment reads, authenticated comment writes
router.get('/:id/comments', optionalAuth, asyncHandler(getComments));
router.post('/:id/comments', requireAuth, asyncHandler(createComment));

export default router;

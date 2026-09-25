import { Router } from 'express';
import { getFeatures, getFeature, createFeature, updateFeature, deleteFeature } from '../controllers/feature.controller';
import { addVote, removeVote } from '../controllers/vote.controller';
import { getComments, createComment } from '../controllers/comment.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', requireAuth, asyncHandler(getFeatures));
router.post('/', requireAuth, asyncHandler(createFeature));
router.get('/:id', requireAuth, asyncHandler(getFeature));
router.patch('/:id', requireAuth, asyncHandler(updateFeature));
router.delete('/:id', requireAdmin, asyncHandler(deleteFeature));

router.post('/:id/vote', requireAuth, asyncHandler(addVote));
router.delete('/:id/vote', requireAuth, asyncHandler(removeVote));

router.get('/:id/comments', requireAuth, asyncHandler(getComments));
router.post('/:id/comments', requireAuth, asyncHandler(createComment));

export default router;

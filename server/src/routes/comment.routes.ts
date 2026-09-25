import { Router } from 'express';
import { updateComment, deleteComment } from '../controllers/comment.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.patch('/:id', requireAuth, asyncHandler(updateComment));
router.delete('/:id', requireAuth, asyncHandler(deleteComment));

export default router;

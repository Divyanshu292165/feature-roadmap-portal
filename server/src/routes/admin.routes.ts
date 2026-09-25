import { Router } from 'express';
import { getStats, getAdminFeatures, updateFeatureStatus, deleteFeature, getAdminComments, deleteAdminComment } from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAdmin);

router.get('/stats', asyncHandler(getStats));
router.get('/feature-requests', asyncHandler(getAdminFeatures));
router.patch('/feature-requests/:id/status', asyncHandler(updateFeatureStatus));
router.delete('/feature-requests/:id', asyncHandler(deleteFeature));
router.get('/comments', asyncHandler(getAdminComments));
router.delete('/comments/:id', asyncHandler(deleteAdminComment));

export default router;

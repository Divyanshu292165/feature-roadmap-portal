import { Request, Response } from 'express';
import { FeatureRequest } from '../models/FeatureRequest';
import { successResponse } from '../utils/apiResponse';

export const getRoadmap = async (req: Request, res: Response) => {
  const features = await FeatureRequest.find({
    status: { $in: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'] }
  }).sort({ voteCount: -1 }).populate('author', 'name email');

  const roadmap = {
    PLANNED: features.filter(f => f.status === 'PLANNED'),
    IN_PROGRESS: features.filter(f => f.status === 'IN_PROGRESS'),
    COMPLETED: features.filter(f => f.status === 'COMPLETED')
  };

  res.json(successResponse(roadmap));
};

import { Request, Response } from 'express';
import { Vote } from '../models/Vote';
import { FeatureRequest } from '../models/FeatureRequest';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const addVote = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json(errorResponse('Unauthorized', 'UNAUTHORIZED', 401));

  const featureRequestId = req.params.id;

  const feature = await FeatureRequest.findById(featureRequestId);
  if (!feature) {
    return res.status(404).json(errorResponse('Feature request not found', 'NOT_FOUND', 404));
  }

  try {
    const vote = new Vote({
      user: req.user.id,
      featureRequest: featureRequestId
    });
    
    await vote.save();

    const updated = await FeatureRequest.findByIdAndUpdate(
      featureRequestId,
      { $inc: { voteCount: 1 } },
      { new: true }
    );
    
    res.json(successResponse({ voteCount: updated?.voteCount ?? feature.voteCount + 1, hasVoted: true }, 'Vote added'));
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json(errorResponse('Already voted on this feature request', 'CONFLICT', 409));
    }
    throw error;
  }
};

export const removeVote = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json(errorResponse('Unauthorized', 'UNAUTHORIZED', 401));

  const featureRequestId = req.params.id;

  const feature = await FeatureRequest.findById(featureRequestId);
  if (!feature) {
    return res.status(404).json(errorResponse('Feature request not found', 'NOT_FOUND', 404));
  }

  const vote = await Vote.findOneAndDelete({
    user: req.user.id,
    featureRequest: featureRequestId
  });

  if (vote) {
    const updated = await FeatureRequest.findOneAndUpdate(
      { _id: featureRequestId, voteCount: { $gt: 0 } },
      { $inc: { voteCount: -1 } },
      { new: true }
    );
    return res.json(successResponse({ voteCount: updated?.voteCount ?? 0, hasVoted: false }, 'Vote removed'));
  }

  res.json(successResponse({ voteCount: feature.voteCount, hasVoted: false }, 'No vote to remove'));
};

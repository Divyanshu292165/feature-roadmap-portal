import { Request, Response } from 'express';
import { User } from '../models/User';
import { FeatureRequest } from '../models/FeatureRequest';
import { Vote } from '../models/Vote';
import { Comment } from '../models/Comment';
import { successResponse, listResponse, errorResponse } from '../utils/apiResponse';
import { updateStatusSchema } from '../validators/feature.validators';

export const getStats = async (req: Request, res: Response) => {
  const [users, features, votes, comments, statuses] = await Promise.all([
    User.countDocuments(),
    FeatureRequest.countDocuments(),
    Vote.countDocuments(),
    Comment.countDocuments(),
    FeatureRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const requestsByStatus = (statuses as Array<{ _id: string; count: number }>).reduce(
    (acc: Record<string, number>, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    },
    { UNDER_REVIEW: 0, PLANNED: 0, IN_PROGRESS: 0, COMPLETED: 0 }
  );

  res.json(successResponse({
    totalUsers: users,
    totalFeatureRequests: features,
    totalVotes: votes,
    totalComments: comments,
    byStatus: requestsByStatus,
    users,
    features,
    votes,
    comments,
    requestsByStatus
  }));
};

export const getAdminFeatures = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const features = await FeatureRequest.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name email');

  const total = await FeatureRequest.countDocuments();

  res.json(listResponse(features, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }));
};

export const updateFeatureStatus = async (req: Request, res: Response) => {
  const { status } = updateStatusSchema.parse(req).body;
  const feature = await FeatureRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!feature) {
    return res.status(404).json(errorResponse('Feature not found', 'NOT_FOUND', 404));
  }

  res.json(successResponse(feature, 'Status updated'));
};

export const deleteFeature = async (req: Request, res: Response) => {
  const feature = await FeatureRequest.findByIdAndDelete(req.params.id);
  if (!feature) {
    return res.status(404).json(errorResponse('Feature not found', 'NOT_FOUND', 404));
  }

  await Vote.deleteMany({ featureRequest: req.params.id });
  await Comment.deleteMany({ featureRequest: req.params.id });

  res.json(successResponse(null, 'Feature completely deleted'));
};

export const getAdminComments = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const comments = await Comment.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name email')
    .populate('featureRequest', 'title');

  const total = await Comment.countDocuments();

  res.json(listResponse(comments, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }));
};

export const deleteAdminComment = async (req: Request, res: Response) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) return res.status(404).json(errorResponse('Comment not found', 'NOT_FOUND', 404));

  const replies = await Comment.deleteMany({ parentComment: comment._id });
  const totalDeleted = 1 + (replies.deletedCount || 0);

  await FeatureRequest.findByIdAndUpdate(comment.featureRequest, {
    $inc: { commentCount: -totalDeleted }
  });
  res.json(successResponse(null, 'Comment deleted'));
};

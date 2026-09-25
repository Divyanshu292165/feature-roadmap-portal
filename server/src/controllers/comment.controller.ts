import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { FeatureRequest } from '../models/FeatureRequest';
import { successResponse, listResponse, errorResponse } from '../utils/apiResponse';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validators';

export const getComments = async (req: Request, res: Response) => {
  const featureRequestId = req.params.id;
  
  const comments = await Comment.find({ featureRequest: featureRequestId })
    .populate('author', 'name email')
    .sort({ createdAt: 1 });

  // Group top level and replies
  const topLevel = comments.filter(c => !c.parentComment);
  const replies = comments.filter(c => c.parentComment);
  
  const formatted = topLevel.map(c => {
    const cObj = c.toJSON();
    (cObj as any).replies = replies.filter(r => r.parentComment?.toString() === c._id.toString());
    return cObj;
  });

  res.json(listResponse(formatted, { total: comments.length }));
};

export const createComment = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json(errorResponse('Unauthorized', 'UNAUTHORIZED', 401));

  const featureRequestId = req.params.id;
  const { content, parentComment } = createCommentSchema.parse(req).body;

  const feature = await FeatureRequest.findById(featureRequestId);
  if (!feature) {
    return res.status(404).json(errorResponse('Feature request not found', 'NOT_FOUND', 404));
  }

  let finalParentId = null;
  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent || parent.featureRequest.toString() !== featureRequestId) {
      return res.status(400).json(errorResponse('Invalid parent comment', 'INVALID_PARENT', 400));
    }
    // Limit to 1 level of nesting: if the parent is already a reply, use its parent
    finalParentId = parent.parentComment ? parent.parentComment : parent._id;
  }

  const comment = await Comment.create({
    featureRequest: featureRequestId,
    author: req.user.id,
    content,
    parentComment: finalParentId
  });

  await FeatureRequest.findByIdAndUpdate(featureRequestId, { $inc: { commentCount: 1 } });

  const populated = await comment.populate('author', 'name email');
  res.status(201).json(successResponse(populated, 'Comment created'));
};

export const updateComment = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json(errorResponse('Unauthorized'));

  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json(errorResponse('Comment not found', 'NOT_FOUND', 404));

  if (comment.author.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Forbidden', 'FORBIDDEN', 403));
  }

  const { content } = updateCommentSchema.parse(req).body;
  comment.content = content;
  await comment.save();

  res.json(successResponse(comment, 'Comment updated'));
};

export const deleteComment = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json(errorResponse('Unauthorized'));

  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json(errorResponse('Comment not found', 'NOT_FOUND', 404));

  if (comment.author.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Forbidden', 'FORBIDDEN', 403));
  }

  await comment.deleteOne();
  
  // also delete replies
  const replies = await Comment.deleteMany({ parentComment: comment._id });
  
  const totalDeleted = 1 + (replies.deletedCount || 0);
  
  await FeatureRequest.findByIdAndUpdate(comment.featureRequest, { 
    $inc: { commentCount: -totalDeleted } 
  });

  res.json(successResponse(null, 'Comment deleted'));
};

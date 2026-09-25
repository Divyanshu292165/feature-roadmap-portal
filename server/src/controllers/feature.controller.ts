import { Request, Response } from 'express';
import { FeatureRequest } from '../models/FeatureRequest';
import { Vote } from '../models/Vote';
import { successResponse, listResponse, errorResponse } from '../utils/apiResponse';
import { createFeatureSchema, updateFeatureSchema } from '../validators/feature.validators';

export const getFeatures = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = (req.query.sort as string) || 'newest';
  const category = req.query.category as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const query: any = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  let sortObj: any = { createdAt: -1 };
  if (sort === 'upvotes') sortObj = { voteCount: -1, createdAt: -1 };
  else if (sort === 'discussed') sortObj = { commentCount: -1, createdAt: -1 };
  else if (sort === 'trending') {
    sortObj = { voteCount: -1, commentCount: -1, createdAt: -1 };
  } else if (sort === 'newest') {
    sortObj = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const features = await FeatureRequest.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .populate('author', 'name email');

  const total = await FeatureRequest.countDocuments(query);

  let userVotedIds = new Set<string>();
  if (req.user) {
    const featureIds = features.map(f => f._id);
    const userVotes = await Vote.find({
      user: req.user.id,
      featureRequest: { $in: featureIds }
    }).select('featureRequest');
    userVotedIds = new Set(userVotes.map(v => v.featureRequest.toString()));
  }

  const formattedFeatures = features.map(f => ({
    ...f.toJSON(),
    hasVoted: userVotedIds.has(f._id.toString())
  }));

  res.json(listResponse(formattedFeatures, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }));
};

export const createFeature = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json(errorResponse('Unauthorized'));
  
  const { title, description, category } = createFeatureSchema.parse(req).body;

  const feature = await FeatureRequest.create({
    title,
    description,
    category,
    status: 'UNDER_REVIEW',
    author: req.user.id
  });

  res.status(201).json(successResponse(feature, 'Feature request created successfully'));
};

export const getFeature = async (req: Request, res: Response) => {
  const feature = await FeatureRequest.findById(req.params.id).populate('author', 'name email');
  if (!feature) {
    return res.status(404).json(errorResponse('Feature not found', 'NOT_FOUND', 404));
  }

  let hasVoted = false;
  if (req.user) {
    const vote = await Vote.findOne({ user: req.user.id, featureRequest: feature._id });
    hasVoted = !!vote;
  }

  res.json(successResponse({ ...feature.toJSON(), hasVoted }));
};

export const updateFeature = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json(errorResponse('Unauthorized'));

  const feature = await FeatureRequest.findById(req.params.id);
  if (!feature) {
    return res.status(404).json(errorResponse('Feature not found', 'NOT_FOUND', 404));
  }

  if (feature.author.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Forbidden', 'FORBIDDEN', 403));
  }

  const updates = updateFeatureSchema.parse(req).body;
  Object.assign(feature, updates);
  await feature.save();

  res.json(successResponse(feature, 'Feature updated successfully'));
};

export const deleteFeature = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Forbidden', 'FORBIDDEN', 403));
  }

  const feature = await FeatureRequest.findByIdAndDelete(req.params.id);
  if (!feature) {
    return res.status(404).json(errorResponse('Feature not found', 'NOT_FOUND', 404));
  }

  res.json(successResponse(null, 'Feature deleted successfully'));
};

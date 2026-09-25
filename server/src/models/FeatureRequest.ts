import mongoose, { Document } from 'mongoose';

export interface IFeatureRequest extends Document {
  title: string;
  description: string;
  category: 'UI_UX' | 'INTEGRATIONS' | 'PERFORMANCE' | 'GENERAL';
  status: 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  author: mongoose.Types.ObjectId;
  voteCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const featureRequestSchema = new mongoose.Schema<IFeatureRequest>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['UI_UX', 'INTEGRATIONS', 'PERFORMANCE', 'GENERAL'],
    required: true 
  },
  status: {
    type: String,
    enum: ['UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'UNDER_REVIEW'
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  voteCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

featureRequestSchema.index({ title: 'text', description: 'text' });
featureRequestSchema.index({ status: 1 });
featureRequestSchema.index({ category: 1 });
featureRequestSchema.index({ createdAt: -1 });
featureRequestSchema.index({ voteCount: -1 });

export const FeatureRequest = mongoose.model<IFeatureRequest>('FeatureRequest', featureRequestSchema);

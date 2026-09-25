import mongoose, { Document } from 'mongoose';

export interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  featureRequest: mongoose.Types.ObjectId;
  createdAt: Date;
}

const voteSchema = new mongoose.Schema<IVote>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  featureRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'FeatureRequest', required: true }
}, {
  timestamps: { updatedAt: false }
});

voteSchema.index({ user: 1, featureRequest: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);

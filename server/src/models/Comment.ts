import mongoose, { Document } from 'mongoose';

export interface IComment extends Document {
  featureRequest: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>({
  featureRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'FeatureRequest', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }
}, {
  timestamps: true
});

export const Comment = mongoose.model<IComment>('Comment', commentSchema);

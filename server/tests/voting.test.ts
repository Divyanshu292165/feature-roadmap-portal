import request from 'supertest';
import app from '../src/server';
import { User } from '../src/models/User';
import { FeatureRequest } from '../src/models/FeatureRequest';
import { Vote } from '../src/models/Vote';
import { Comment } from '../src/models/Comment';
import bcrypt from 'bcryptjs';

// mongoose connection and cleanup is handled by tests/setup.ts

let tokenA: string;
let tokenB: string;
let featureId: string;
let userAId: string;

beforeEach(async () => {
  const pw = await bcrypt.hash('password123', 10);
  const userA = await User.create({ name: 'User A', email: 'a@test.com', passwordHash: pw, isEmailVerified: true });
  const userB = await User.create({ name: 'User B', email: 'b@test.com', passwordHash: pw, isEmailVerified: true });
  userAId = userA._id.toString();

  const loginA = await request(app).post('/api/auth/login').send({ email: 'a@test.com', password: 'password123' });
  tokenA = loginA.body.data.accessToken;

  const loginB = await request(app).post('/api/auth/login').send({ email: 'b@test.com', password: 'password123' });
  tokenB = loginB.body.data.accessToken;

  const f = await FeatureRequest.create({
    title: 'Votable Feature',
    description: 'A feature request that users can vote on',
    category: 'UI_UX',
    author: userA._id,
  });
  featureId = f._id.toString();
});

describe('Voting API', () => {
  it('should allow user A to vote on a feature', async () => {
    const res = await request(app)
      .post(`/api/feature-requests/${featureId}/vote`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.voteCount).toBe(1);
    expect(res.body.data.hasVoted).toBe(true);

    const f = await FeatureRequest.findById(featureId);
    expect(f?.voteCount).toBe(1);
  });

  it('should prevent double voting and return 409', async () => {
    await request(app)
      .post(`/api/feature-requests/${featureId}/vote`)
      .set('Authorization', `Bearer ${tokenA}`);

    const res = await request(app)
      .post(`/api/feature-requests/${featureId}/vote`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(409);

    const f = await FeatureRequest.findById(featureId);
    expect(f?.voteCount).toBe(1);
  });

  it('should allow user A to remove their vote', async () => {
    await request(app)
      .post(`/api/feature-requests/${featureId}/vote`)
      .set('Authorization', `Bearer ${tokenA}`);

    const res = await request(app)
      .delete(`/api/feature-requests/${featureId}/vote`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.voteCount).toBe(0);
    expect(res.body.data.hasVoted).toBe(false);

    const f = await FeatureRequest.findById(featureId);
    expect(f?.voteCount).toBe(0);
  });

  it('should return 200 with hasVoted:false when removing a non-existent vote', async () => {
    const res = await request(app)
      .delete(`/api/feature-requests/${featureId}/vote`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.hasVoted).toBe(false);
  });

  it('should allow multiple users to vote independently', async () => {
    await request(app)
      .post(`/api/feature-requests/${featureId}/vote`)
      .set('Authorization', `Bearer ${tokenA}`);

    await request(app)
      .post(`/api/feature-requests/${featureId}/vote`)
      .set('Authorization', `Bearer ${tokenB}`);

    const f = await FeatureRequest.findById(featureId);
    expect(f?.voteCount).toBe(2);

    const voteCount = await Vote.countDocuments({ featureRequest: featureId });
    expect(voteCount).toBe(2);
  });

  it('should require authentication to vote', async () => {
    const res = await request(app)
      .post(`/api/feature-requests/${featureId}/vote`);

    expect(res.status).toBe(401);
  });
});

describe('Comments API', () => {
  it('should increment commentCount on feature when comment is created', async () => {
    await request(app)
      .post(`/api/feature-requests/${featureId}/comments`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'This is a great feature idea!' });

    const f = await FeatureRequest.findById(featureId);
    expect(f?.commentCount).toBe(1);
  });

  it('should allow creating a reply to a comment', async () => {
    const commentRes = await request(app)
      .post(`/api/feature-requests/${featureId}/comments`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Parent comment content here' });

    expect(commentRes.status).toBe(201);
    const parentId = commentRes.body.data._id;

    const replyRes = await request(app)
      .post(`/api/feature-requests/${featureId}/comments`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ content: 'Reply to the parent comment', parentComment: parentId });

    expect(replyRes.status).toBe(201);
    expect(replyRes.body.data.parentComment).toBe(parentId);
  });

  it('should allow the author to delete their comment', async () => {
    const commentRes = await request(app)
      .post(`/api/feature-requests/${featureId}/comments`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Comment to be deleted' });

    const commentId = commentRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(deleteRes.status).toBe(200);

    const f = await FeatureRequest.findById(featureId);
    expect(f?.commentCount).toBe(0);
  });

  it('should deny comment deletion by non-author', async () => {
    const commentRes = await request(app)
      .post(`/api/feature-requests/${featureId}/comments`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Comment only userA can delete' });

    const commentId = commentRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(deleteRes.status).toBe(403);
  });
});

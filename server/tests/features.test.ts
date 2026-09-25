import request from 'supertest';
import app from '../src/server';
import { User } from '../src/models/User';
import { FeatureRequest } from '../src/models/FeatureRequest';
import bcrypt from 'bcryptjs';

// mongoose connection and cleanup is handled by tests/setup.ts

let token: string;
let adminToken: string;
let userId: string;

beforeEach(async () => {
  const pw = await bcrypt.hash('password123', 10);
  const user = await User.create({ name: 'User', email: 'user@test.com', passwordHash: pw, isEmailVerified: true });
  userId = user._id.toString();

  await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: pw, role: 'ADMIN', isEmailVerified: true });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@test.com', password: 'password123' });
  token = loginRes.body.data.accessToken;

  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' });
  adminToken = adminLoginRes.body.data.accessToken;
});

describe('Features API', () => {
  it('should create a feature when authenticated', async () => {
    const res = await request(app)
      .post('/api/feature-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Feature', description: 'A great feature idea with detail', category: 'UI_UX' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('New Feature');
    expect(res.body.data.author).toBeDefined();
  });

  it('should reject feature creation if unauthenticated', async () => {
    const res = await request(app)
      .post('/api/feature-requests')
      .send({ title: 'New Feature', description: 'A great feature idea', category: 'UI_UX' });

    expect(res.status).toBe(401);
  });

  it('should list features with pagination', async () => {
    await FeatureRequest.create([
      { title: 'Feature Alpha', description: 'First feature description here', category: 'UI_UX', author: userId },
      { title: 'Feature Beta', description: 'Second feature description here', category: 'GENERAL', author: userId },
    ]);

    const res = await request(app).get('/api/feature-requests?page=1&limit=1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should reject listing features if unauthenticated', async () => {
    const res = await request(app).get('/api/feature-requests');
    expect(res.status).toBe(401);
  });

  it('should filter features by category and status', async () => {
    await FeatureRequest.create([
      { title: 'Feature Alpha', description: 'First feature description here', category: 'UI_UX', status: 'PLANNED', author: userId },
      { title: 'Feature Beta', description: 'Second feature description here', category: 'GENERAL', status: 'COMPLETED', author: userId },
    ]);

    const res = await request(app).get('/api/feature-requests?category=UI_UX&status=PLANNED').set('Authorization', `Bearer ${token}`);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Feature Alpha');
  });

  it('should search features by title', async () => {
    await FeatureRequest.create([
      { title: 'Dark mode support', description: 'Please add dark mode theme to the application', category: 'UI_UX', author: userId },
      { title: 'Export to CSV', description: 'Allow users to export data as CSV files', category: 'GENERAL', author: userId },
    ]);

    const res = await request(app).get('/api/feature-requests?search=dark').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Dark mode support');
  });

  it('should fetch a single feature by id', async () => {
    const f = await FeatureRequest.create({ title: 'Single Feature', description: 'Some detailed description text', category: 'UI_UX', author: userId });

    const res = await request(app).get(`/api/feature-requests/${f._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Single Feature');
  });

  it('should return 404 for non-existent feature', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/feature-requests/${fakeId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('should allow admin to delete feature', async () => {
    const f = await FeatureRequest.create({ title: 'To Delete', description: 'Feature to be deleted by admin', category: 'UI_UX', author: userId });

    const res = await request(app)
      .delete(`/api/admin/feature-requests/${f._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const deleted = await FeatureRequest.findById(f._id);
    expect(deleted).toBeNull();
  });

  it('should deny non-admin from changing status via admin routes', async () => {
    const f = await FeatureRequest.create({ title: 'Status Test', description: 'Feature for status change test', category: 'UI_UX', author: userId });

    const res = await request(app)
      .patch(`/api/admin/feature-requests/${f._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(403);
  });

  it('should allow admin to change status', async () => {
    const f = await FeatureRequest.create({ title: 'Status Feature', description: 'Feature for status admin change', category: 'UI_UX', author: userId });

    const res = await request(app)
      .patch(`/api/admin/feature-requests/${f._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
});

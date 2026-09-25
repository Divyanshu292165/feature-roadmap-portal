/**
 * tests/setup.ts — per-test-suite setup (runs for each test file).
 *
 * The MongoMemoryServer is started ONCE in tests/jest.globalSetup.ts.
 * Its URI is stored in process.env.__MONGO_URI__.
 * This file just connects/disconnects mongoose per test suite,
 * and clears all collections after each individual test.
 */

import mongoose from 'mongoose';

beforeAll(async () => {
  const uri = process.env.__MONGO_URI__;
  if (!uri) {
    throw new Error('__MONGO_URI__ env var not set. Ensure jest.globalSetup.ts ran successfully.');
  }
  // Connect if not already connected (first test file), or reconnect after previous close
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  // Clear all data after this test suite, but keep the connection open
  // (the next test file's beforeAll will reuse the existing connection)
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterEach(async () => {
  // Clear all collections after every individual test for clean isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

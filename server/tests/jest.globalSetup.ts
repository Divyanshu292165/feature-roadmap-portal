/**
 * jest.globalSetup.ts
 *
 * Runs once before ALL test suites. Starts MongoMemoryServer and writes
 * the URI to a temp file so individual test suites can connect to it.
 * This avoids downloading/starting MongoDB multiple times.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Store the instance so globalTeardown can stop it
  (global as any).__MONGOD__ = mongod;

  // Write URI to a temp file for test suites to read
  const tmpFile = path.join(os.tmpdir(), 'jest-mms-uri.txt');
  fs.writeFileSync(tmpFile, uri, 'utf-8');

  // Also set as env var (available to same process)
  process.env.__MONGO_URI__ = uri;

  console.log(`\n[globalSetup] MongoMemoryServer started at: ${uri}`);
};

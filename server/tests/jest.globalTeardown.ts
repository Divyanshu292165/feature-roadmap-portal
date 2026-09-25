/**
 * jest.globalTeardown.ts
 *
 * Runs once after ALL test suites. Stops the MongoMemoryServer.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

module.exports = async () => {
  const mongod = (global as any).__MONGOD__;
  if (mongod) {
    await mongod.stop();
    console.log('\n[globalTeardown] MongoMemoryServer stopped.');
  }
  // Clean up the temp file
  try {
    fs.unlinkSync(path.join(os.tmpdir(), 'jest-mms-uri.txt'));
  } catch {
    // ignore
  }
};

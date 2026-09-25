/**
 * dev-with-db.ts
 *
 * Starts the Express server using MongoMemoryServer for local development
 * when no real MongoDB instance is available.
 *
 * Usage: npm run dev:local
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

async function main() {
  console.log('🚀 Starting local dev server with in-memory MongoDB...');

  // MUST set these BEFORE any imports that read process.env
  process.env.DEV_LOCAL = 'true';
  process.env.NODE_ENV = 'development';

  // Spin up MongoMemoryServer (uses cached binary)
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log(`✅ MongoMemoryServer started at: ${uri}`);

  // Override MONGODB_URI so env.ts and connectDB use the in-memory instance
  process.env.MONGODB_URI = uri;

  // Connect mongoose
  await mongoose.connect(uri);
  console.log('✅ Mongoose connected to in-memory MongoDB');

  // Seed the database
  console.log('🌱 Seeding database...');
  try {
    const { seed } = await import('./seed');
    await seed(true); // skipConnect=true — already connected above
    console.log('✅ Database seeded successfully');
  } catch (err) {
    console.warn('⚠️  Seed failed:', (err as Error).message);
  }

  // Import Express app — DEV_LOCAL=true prevents double-listen
  const app = (await import('../src/server')).default;

  const PORT = parseInt(process.env.PORT || '5000', 10);
  const server = app.listen(PORT, () => {
    console.log(`\n✅ Server running at http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   Frontend: http://localhost:5173 (run 'npm run dev' in client/)`);
    console.log('\n📋 Demo credentials:');
    console.log('   Admin:    admin@example.com / Admin@123!');
    console.log('   User:     user@example.com  / User@123!');
    console.log('\n⚠️  Note: Data is in-memory only — it will be lost when the server stops.');
    console.log('   Press Ctrl+C to stop.\n');
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use. Kill the existing process or use a different port.`);
      process.exit(1);
    }
    throw err;
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down...');
    server.close();
    await mongoose.connection.close();
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});

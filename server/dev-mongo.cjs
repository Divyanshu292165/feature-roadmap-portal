// Dev-only helper: starts an ephemeral MongoDB (via mongodb-memory-server) on a
// fixed port so the app can run locally without a system MongoDB install.
// Uses the cached 5.0.19 binary. Ctrl+C to stop.
const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const server = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'feature-roadmap' },
    binary: { version: '5.0.19' },
  });
  console.log('[dev-mongo] MongoDB ready at', server.getUri());
  const shutdown = async () => {
    console.log('\n[dev-mongo] stopping...');
    await server.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[dev-mongo] failed to start:', err);
  process.exit(1);
});

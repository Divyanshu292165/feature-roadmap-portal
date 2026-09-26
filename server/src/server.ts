import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import featureRoutes from './routes/feature.routes';
import commentRoutes from './routes/comment.routes';
import roadmapRoutes from './routes/roadmap.routes';
import adminRoutes from './routes/admin.routes';
import healthRoutes from './routes/health.routes';

const app = express();

// Behind a hosting proxy (Render/Railway/etc.) so Express treats the
// forwarded connection as HTTPS — required for Secure cookies to be set.
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/feature-requests', featureRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

const PORT = env.PORT;

/**
 * startServer — connects to DB and starts listening.
 * Skipped in 'test' mode (tests manage their own connection).
 * Skipped in 'dev:local' mode (dev-with-db.ts manages the connection and listen).
 */
const startServer = async () => {
  if (process.env.NODE_ENV !== 'test' && !process.env.DEV_LOCAL) {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });
  }
};

startServer();

export default app;

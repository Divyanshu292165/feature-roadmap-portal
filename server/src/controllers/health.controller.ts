import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * getHealth — lightweight liveness/readiness probe.
 *
 * Issues a real `ping` command over the active Mongoose connection so that an
 * external uptime monitor hitting this URL keeps both the backend process and
 * the MongoDB Atlas cluster warm (Atlas M0 auto-pauses after ~30 days of zero
 * connections). No auth: uptime monitors are unauthenticated.
 */
export const getHealth = async (_req: Request, res: Response) => {
  const state = mongoose.connection.readyState; // 1 = connected

  let dbOk = false;
  try {
    if (state === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbOk = true;
    }
  } catch {
    dbOk = false;
  }

  const status = dbOk ? 200 : 503;
  return res.status(status).json({
    success: dbOk,
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const hasFirebaseConfig = fs.existsSync(
    path.resolve(process.cwd(), 'firebase-applet-config.json')
  );
  const apiKey = process.env.GEMINI_API_KEY;
  const hasGemini = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

  res.json({
    status: 'ok',
    service: 'nha-rang-lac-son-api',
    database: hasFirebaseConfig ? 'firebase-firestore' : 'local-only',
    aiConcierge: hasGemini ? 'enabled' : 'unconfigured',
    timestamp: new Date().toISOString(),
  });
});

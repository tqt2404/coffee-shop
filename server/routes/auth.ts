import { Router } from 'express';
import {
  authenticateAccount,
  extractBearerToken,
  registerAccount,
  verifySessionToken,
} from '../services/authService.ts';

export const authRouter = Router();

authRouter.post('/register', (req, res) => {
  const { username, password, displayName } = req.body ?? {};
  const result = registerAccount({
    username: String(username || ''),
    password: String(password || ''),
    displayName: String(displayName || ''),
  });

  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(201).json({
    user: result.account,
    token: result.token,
  });
});

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};
  const result = authenticateAccount({
    username: String(username || ''),
    password: String(password || ''),
  });

  if (!result.ok) {
    res.status(401).json({ error: result.error });
    return;
  }

  res.json({
    user: result.account,
    token: result.token,
  });
});

authRouter.get('/me', (req, res) => {
  const token = extractBearerToken(req.headers.authorization);
  const payload = token ? verifySessionToken(token) : null;
  if (!payload) {
    res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    return;
  }

  res.json({
    user: {
      id: payload.sub,
      username: payload.username,
      displayName: payload.displayName,
      role: payload.role,
      provider: payload.provider,
    },
  });
});

authRouter.post('/logout', (_req, res) => {
  res.json({ ok: true });
});

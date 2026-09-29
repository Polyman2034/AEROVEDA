import { Router } from 'express';

export const authRouter = Router();

// In-memory demo sessions
const activeSessions = new Map<string, { email: string; name: string; role: string }>();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  const cleanEmail = email.trim();
  const userName = cleanEmail.split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Environmental Officer';

  const user = {
    email: cleanEmail,
    name: userName,
    role: 'Regional Air Quality Controller',
    department: 'Central Pollution Intelligence Directorate',
    jurisdiction: 'Maharashtra & NCR Inter-State Grid',
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
  };

  activeSessions.set(user.sessionId, user);
  return res.json({ success: true, user });
});

authRouter.post('/signup', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const cleanEmail = email.trim();
  const userName = name?.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ') || 'Environmental Analyst';

  const user = {
    email: cleanEmail,
    name: userName,
    role: 'Regional Air Quality Controller',
    department: 'Central Pollution Intelligence Directorate',
    jurisdiction: 'Maharashtra & NCR Inter-State Grid',
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
  };

  activeSessions.set(user.sessionId, user);
  return res.json({ success: true, user });
});

authRouter.get('/session', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId && activeSessions.has(sessionId)) {
    return res.json({ authenticated: true, user: activeSessions.get(sessionId) });
  }

  // Demo fallback session so it works seamlessly out of the box
  return res.json({
    authenticated: true,
    user: {
      email: 'saiprasadkawdikar25@gmail.com',
      name: 'Saiprasad Kawdikar',
      role: 'Environmental Intelligence Officer',
      department: 'Central Pollution Intelligence Directorate',
      jurisdiction: 'Pune & National Capital Grid',
      sessionId: 'demo-officer-session',
    },
  });
});

authRouter.post('/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    activeSessions.delete(sessionId);
  }
  return res.json({ success: true });
});

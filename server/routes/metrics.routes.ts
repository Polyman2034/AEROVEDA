import { Router } from 'express';
import { db } from '../db/database';

export const metricsRouter = Router();

metricsRouter.get('/dashboard', (req, res) => {
  const metrics = db.getMetrics();
  const recentEvents = db.getAllEvents().slice(0, 5);
  const activeAlerts = db.getAllAlerts().filter((a) => a.status !== 'RESOLVED').slice(0, 4);

  return res.json({
    metrics,
    recentEvents,
    activeAlerts,
    mode: 'DEMO MODE',
    disclaimer: 'Simulated Environmental Intelligence — Prototype Model Inference',
  });
});

metricsRouter.get('/events', (req, res) => {
  const events = db.getAllEvents();
  return res.json({ events, count: events.length });
});

metricsRouter.post('/reset-data', (req, res) => {
  const result = db.reset();
  return res.json(result);
});

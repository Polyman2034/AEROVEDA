import { Router } from 'express';
import { db } from '../db/database';
import { AlertStatus } from '../db/types';

export const alertsRouter = Router();

alertsRouter.get('/', (req, res) => {
  const alerts = db.getAllAlerts();

  // Metrics summary
  const critical = alerts.filter((a) => a.risk === 'CRITICAL').length;
  const high = alerts.filter((a) => a.risk === 'HIGH').length;
  const moderate = alerts.filter((a) => a.risk === 'MODERATE').length;

  return res.json({
    alerts,
    counts: {
      critical: critical.toString().padStart(2, '0'),
      high: high.toString().padStart(2, '0'),
      moderate: moderate.toString().padStart(2, '0'),
      total: alerts.length,
    },
  });
});

alertsRouter.get('/:id', (req, res) => {
  const alert = db.getAlertById(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  return res.json({ alert });
});

alertsRouter.post('/', (req, res) => {
  const {
    title,
    hotspotId,
    locationName,
    city,
    coordinates,
    currentAqi,
    predictedAqi,
    expectedDurationHours,
    risk,
    suggestedResponse,
    assignedAuthority,
  } = req.body;

  if (!title || !locationName) {
    return res.status(400).json({ error: 'Title and locationName are required.' });
  }

  const created = db.createAlert({
    title,
    hotspotId,
    locationName,
    city: city || 'Pune',
    coordinates,
    currentAqi: Number(currentAqi) || 287,
    predictedAqi: Number(predictedAqi) || 312,
    expectedDurationHours: expectedDurationHours || '4–7 hours',
    risk: risk || 'HIGH',
    suggestedResponse: suggestedResponse || 'Environmental field inspection',
    assignedAuthority,
  });

  return res.status(201).json({ success: true, alert: created });
});

alertsRouter.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, note, actor } = req.body;

  const validStatuses: AlertStatus[] = [
    'DETECTED',
    'VALIDATED',
    'ALERT_SENT',
    'ACKNOWLEDGED',
    'INVESTIGATING',
    'RESOLVED',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const updated = db.updateAlertStatus(id, status as AlertStatus, note, actor);

  if (!updated) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  return res.json({ success: true, alert: updated });
});

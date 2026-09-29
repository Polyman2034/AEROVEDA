import { Router } from 'express';
import { db } from '../db/database';

export const hotspotsRouter = Router();

hotspotsRouter.get('/', (req, res) => {
  const city = req.query.city as string;
  let hotspots = db.getAllHotspots();

  if (city) {
    hotspots = hotspots.filter((h) => h.city.toLowerCase() === city.toLowerCase());
  }

  return res.json({ hotspots, count: hotspots.length });
});

hotspotsRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const hotspot = db.getHotspotById(id);

  if (!hotspot) {
    // If not found by ID, try finding Pune corridor as default fallback
    const fallback = db.getHotspotById('hotspot-pune-corridor');
    if (fallback) return res.json({ hotspot: fallback });
    return res.status(404).json({ error: `Hotspot '${id}' not found` });
  }

  return res.json({ hotspot });
});

hotspotsRouter.get('/meta/sensors', (req, res) => {
  const sensors = db.getAllSensors();
  return res.json({ sensors, count: sensors.length });
});

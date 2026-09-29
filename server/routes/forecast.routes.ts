import { Router } from 'express';
import { db } from '../db/database';
import { ForecastService } from '../services/forecast.service';

export const forecastRouter = Router();

forecastRouter.get('/', (req, res) => {
  const cities = db.getAllForecastCities();
  return res.json({ availableCities: cities });
});

forecastRouter.get('/:cityId', (req, res) => {
  const { cityId } = req.params;
  const sensitivity = req.query.sensitivity ? parseFloat(req.query.sensitivity as string) : 1.0;

  const forecast = ForecastService.generateForecast({
    cityId,
    sensitivityMultiplier: isNaN(sensitivity) ? 1.0 : sensitivity,
  });

  return res.json({
    forecast,
    disclaimer: 'Demo prediction — not live environmental data.',
    modelEngine: 'Spatio-Temporal Graph Neural Network (GNN + LSTM) with localized meteorological boundary layer weights',
  });
});

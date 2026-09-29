import { Router } from 'express';
import { authRouter } from './routes/auth.routes';
import { metricsRouter } from './routes/metrics.routes';
import { hotspotsRouter } from './routes/hotspots.routes';
import { forecastRouter } from './routes/forecast.routes';
import { citizenReportsRouter } from './routes/citizen-reports.routes';
import { alertsRouter } from './routes/alerts.routes';
import { federatedRouter } from './routes/federated.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/metrics', metricsRouter);
apiRouter.use('/hotspots', hotspotsRouter);
apiRouter.use('/forecasts', forecastRouter);
apiRouter.use('/citizen-reports', citizenReportsRouter);
apiRouter.use('/alerts', alertsRouter);
apiRouter.use('/federated', federatedRouter);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AEROVEDA Environmental Intelligence Backend',
    mode: 'DEMO MODE',
    timestamp: new Date().toISOString(),
  });
});

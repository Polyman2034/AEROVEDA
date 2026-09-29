import { Router } from 'express';
import { FederatedAggregationService } from '../services/federated-aggregation.service';

export const federatedRouter = Router();

federatedRouter.get('/network', (req, res) => {
  const data = FederatedAggregationService.getNetworkOverview();
  return res.json(data);
});

federatedRouter.post('/aggregate', (req, res) => {
  const result = FederatedAggregationService.runAggregationRound();
  return res.json(result);
});

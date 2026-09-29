import { Router } from 'express';
import { db } from '../db/database';
import { EnvironmentalImageAnalysisService } from '../services/environmental-image-analysis.service';
import { ObservationType, CitizenReport } from '../db/types';

export const citizenReportsRouter = Router();

citizenReportsRouter.get('/', (req, res) => {
  const reports = db.getAllCitizenReports();
  return res.json({ reports, count: reports.length });
});

citizenReportsRouter.post('/', (req, res) => {
  const {
    locationName,
    city,
    coordinates,
    observationType,
    reportedBy,
    imageUrl,
  } = req.body;

  if (!observationType) {
    return res.status(400).json({ error: 'Observation type is required.' });
  }

  const locName = locationName?.trim() || 'Pune Industrial Sector';
  const cityName = city?.trim() || 'Pune';
  const obsType: ObservationType = observationType as ObservationType;

  // Run AI analysis
  const aiAnalysis = EnvironmentalImageAnalysisService.analyzeObservation(
    obsType,
    locName,
    imageUrl
  );

  const newReport: CitizenReport = {
    id: `report-${Date.now().toString(36)}`,
    imageUrl:
      imageUrl ||
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23f1f5f9"/><circle cx="200" cy="150" r="60" fill="%23cbd5e1"/><text x="50%" y="240" font-family="sans-serif" font-size="14" fill="%23475569" text-anchor="middle">Field Photographic Evidence</text></svg>',
    locationName: locName,
    coordinates: coordinates || { lat: 18.6279, lng: 73.8009 },
    city: cityName,
    observationType: obsType,
    reportedBy: reportedBy || 'Citizen Observer',
    timestamp: new Date().toISOString(),
    status: 'VERIFIED',
    aiAnalysis,
  };

  const storedReport = db.addCitizenReport(newReport);

  return res.status(201).json({
    success: true,
    report: storedReport,
    analysis: aiAnalysis,
  });
});

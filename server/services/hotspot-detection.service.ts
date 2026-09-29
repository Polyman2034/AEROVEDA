import { Hotspot, RiskLevel, ExplainabilityFactor } from '../db/types';

export interface HotspotDetectionInput {
  sensorGradient: number; // µg/m³ jump
  satelliteAod: number; // Aerosol Optical Depth
  stagnationIndexPct: number; // 0 - 100
  citizenReportsCount: number;
}

export class HotspotDetectionService {
  /**
   * Deterministic fusion of sensor, satellite, weather and citizen observations
   * Simulated multi-modal anomaly detector.
   */
  public static evaluateAnomaly(input: HotspotDetectionInput): {
    isHotspot: boolean;
    risk: RiskLevel;
    confidence: number;
    explainability: ExplainabilityFactor[];
  } {
    const rawScore =
      input.sensorGradient * 0.35 +
      input.satelliteAod * 100 * 0.25 +
      input.stagnationIndexPct * 0.25 +
      input.citizenReportsCount * 5 * 0.15;

    let risk: RiskLevel = 'LOW';
    if (rawScore > 75) risk = 'CRITICAL';
    else if (rawScore > 50) risk = 'HIGH';
    else if (rawScore > 30) risk = 'MODERATE';

    const confidence = Math.min(98, Math.max(70, Math.round(75 + rawScore * 0.2)));

    // Explainability decomposition
    const totalWeight =
      input.sensorGradient * 0.35 +
      input.satelliteAod * 100 * 0.25 +
      input.stagnationIndexPct * 0.25 +
      input.citizenReportsCount * 5 * 0.15;

    const explainability: ExplainabilityFactor[] = [
      {
        factor: 'Industrial activity',
        percentage: 42,
        description: 'Coordinated thermal stack releases in fabrication & metallurgy clusters.',
      },
      {
        factor: 'Wind stagnation',
        percentage: 27,
        description: 'Micro-valley thermal trapping preventing planetary dispersion.',
      },
      {
        factor: 'Sensor anomaly',
        percentage: 18,
        description: 'Corroborated sudden gradient deviations across neighboring IoT nodes.',
      },
      {
        factor: 'Satellite signal',
        percentage: 9,
        description: 'Correlated tropospheric column NO2 concentration patch.',
      },
      {
        factor: 'Historical pattern',
        percentage: 4,
        description: 'Seasonal post-monsoon diurnal thermal inversion recurrence.',
      },
    ];

    return {
      isHotspot: rawScore > 30,
      risk,
      confidence,
      explainability,
    };
  }
}

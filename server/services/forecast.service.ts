import { CityForecast, PredictionPoint } from '../db/types';
import { db } from '../db/database';

export interface ForecastRequestOptions {
  cityId: string;
  horizonHours?: number;
  sensitivityMultiplier?: number;
}

export class ForecastService {
  /**
   * Deterministic Spatio-Temporal forecast generator (simulates GNN + LSTM inference)
   * Designed to be replaced with live ONNX/TensorFlow Graph Convolutional Network.
   */
  public static generateForecast(options: ForecastRequestOptions): CityForecast {
    const baseForecast = db.getForecast(options.cityId);
    const sensitivity = options.sensitivityMultiplier ?? 1.0;

    // Recalculate projections if sensitivity changed
    const hourlyProjections: PredictionPoint[] = baseForecast.hourlyProjections.map((pt) => {
      if (pt.hoursAhead === 0) return pt;
      const delta = (pt.aqi - baseForecast.currentAqi) * sensitivity;
      const adjustedAqi = Math.round(baseForecast.currentAqi + delta);
      return {
        ...pt,
        aqi: adjustedAqi,
        confidenceInterval: [Math.round(adjustedAqi * 0.95), Math.round(adjustedAqi * 1.06)],
      };
    });

    const sixHourPoint = hourlyProjections.find((p) => p.hoursAhead === 6) || hourlyProjections[3];
    const spikePct = Math.round(
      ((sixHourPoint.aqi - baseForecast.currentAqi) / baseForecast.currentAqi) * 100
    );

    return {
      ...baseForecast,
      spikeForecastPercentage: spikePct,
      hourlyProjections,
      lastCalculated: new Date().toISOString(),
    };
  }
}

import { RiskLevel } from '../db/types';

export interface RiskInput {
  aqi: number;
  rateOfChangePct: number;
  stagnationPct: number;
  populationDensityCategory: 'METRO' | 'URBAN' | 'SEMI_URBAN' | 'RURAL';
}

export class RiskAssessmentService {
  /**
   * Deterministic Composite Environmental Hazard Index (CEHI)
   */
  public static calculateRiskLevel(input: RiskInput): {
    risk: RiskLevel;
    hazardIndex: number;
    recommendedResponse: string;
  } {
    let score = input.aqi * 0.5 + input.rateOfChangePct * 0.8 + input.stagnationPct * 0.3;

    if (input.populationDensityCategory === 'METRO') score *= 1.2;
    if (input.populationDensityCategory === 'URBAN') score *= 1.1;

    let risk: RiskLevel = 'LOW';
    let recommendedResponse = 'Routine automated monitoring';

    if (score > 280) {
      risk = 'CRITICAL';
      recommendedResponse = 'Immediate anti-smog mist deployment & heavy vehicle transit halt';
    } else if (score > 200) {
      risk = 'HIGH';
      recommendedResponse = 'Environmental field inspection & targeted stack emission audit';
    } else if (score > 130) {
      risk = 'MODERATE';
      recommendedResponse = 'Advisory to local ward officers and perimeter water misting';
    }

    return {
      risk,
      hazardIndex: Math.round(score),
      recommendedResponse,
    };
  }
}

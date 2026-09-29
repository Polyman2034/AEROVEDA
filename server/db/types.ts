export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AlertStatus =
  | 'DETECTED'
  | 'VALIDATED'
  | 'ALERT_SENT'
  | 'ACKNOWLEDGED'
  | 'INVESTIGATING'
  | 'RESOLVED';

export type ObservationType =
  | 'Smoke'
  | 'Agricultural burning'
  | 'Industrial emission'
  | 'Dust'
  | 'Waste burning'
  | 'Unknown';

export interface SignalSource {
  id: string;
  type: 'Sensor' | 'Sensor anomaly' | 'Citizen observation' | 'Satellite signal' | 'Meteorological condition';
  label: string;
  value: string;
  timestamp: string;
  status: 'nominal' | 'elevated' | 'severe';
}

export interface ExplainabilityFactor {
  factor: string;
  percentage: number;
  description: string;
}

export interface PredictionPoint {
  timeLabel: string;
  hoursAhead: number;
  aqi: number;
  confidenceInterval: [number, number];
}

export interface Hotspot {
  id: string;
  name: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  aqi: number;
  risk: RiskLevel;
  confidence: number; // e.g. 91
  detectedAgo: string; // e.g. "14 min ago"
  detectedTimestamp: string;
  primaryPollutant: 'PM2.5' | 'PM10' | 'NO2' | 'SO2';
  signals: SignalSource[];
  explainability: ExplainabilityFactor[];
  recommendedAction: string;
  affectedRadiusKm: number;
  corridorName?: string;
  predictionChart: PredictionPoint[];
}

export interface SensorObservation {
  id: string;
  stationName: string;
  city: string;
  coordinates: { lat: number; lng: number };
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  aqi: number;
  temperatureC: number;
  humidityPct: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  status: 'active' | 'calibrating' | 'anomaly';
  lastUpdated: string;
}

export interface CitizenReport {
  id: string;
  imageUrl: string;
  imageThumbnail?: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  city: string;
  observationType: ObservationType;
  reportedBy: string;
  timestamp: string;
  status: 'ANALYZING' | 'VERIFIED' | 'DISMISSED';
  aiAnalysis?: {
    identifiedType: string;
    confidence: number;
    risk: RiskLevel;
    affectedAreaKm: number;
    extractedKeyFeatures: string[];
    summary: string;
  };
}

export interface EnvironmentalAlert {
  id: string;
  title: string;
  hotspotId?: string;
  locationName: string;
  city: string;
  coordinates: { lat: number; lng: number };
  currentAqi: number;
  predictedAqi: number;
  expectedDurationHours: string; // e.g. "4–7 hours"
  risk: RiskLevel;
  suggestedResponse: string;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
  assignedAuthority: string;
  actionLog: {
    status: AlertStatus;
    updatedAt: string;
    actor: string;
    note: string;
  }[];
}

export interface CityForecast {
  cityId: string;
  cityName: string;
  currentAqi: number;
  spikeForecastPercentage: number; // e.g. +38
  forecastPeriod: string; // e.g. "next 6 hours"
  dominantFactor: string;
  predictionDrivers: {
    name: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    trend: 'increasing' | 'stagnant' | 'decreasing';
    detail: string;
  }[];
  hourlyProjections: PredictionPoint[];
  advisoryNote: string;
  lastCalculated: string;
}

export interface FederatedCityNode {
  id: string;
  name: string;
  state: string;
  coordinates: { lat: number; lng: number };
  status: 'ACTIVE' | 'TRAINING' | 'SYNCED' | 'STANDBY';
  localSamplesCount: number;
  lastModelUpdate: string;
  localAqiMean: number;
  privacyEpsilon: number; // differential privacy metric
  modelVersion: string;
  accuracy: number;
}

export interface FederatedModelUpdate {
  id: string;
  roundNumber: number;
  participatingCity: string;
  gradientNorm: number;
  lossReduction: number;
  weightsDelta: string;
  timestamp: string;
  status: 'AGGREGATED' | 'VERIFIED';
}

export interface EnvironmentalEvent {
  id: string;
  type: 'SPIKE' | 'ANOMALY' | 'INVERSION' | 'STAGNATION' | 'REPORT';
  title: string;
  location: string;
  city: string;
  severity: RiskLevel;
  timestamp: string;
  description: string;
}

export interface DashboardMetrics {
  airQuality: number; // 287
  activeHotspots: number; // 27
  predictiveAlerts: number; // 8
  connectedCities: number; // 12
  overallHealthStatus: 'POOR' | 'VERY POOR' | 'SEVERE';
  nationalAverageAqi: number;
  activeSensors: number;
  pendingReports: number;
  totalModelUpdates: number;
}

import {
  initialMetrics,
  initialHotspots,
  initialAlerts,
  initialCityForecasts,
  initialCitizenReports,
  initialSensors,
  initialFederatedCities,
  initialModelUpdates,
  initialEvents,
} from './seed-data';
import {
  DashboardMetrics,
  Hotspot,
  EnvironmentalAlert,
  CityForecast,
  CitizenReport,
  SensorObservation,
  FederatedCityNode,
  FederatedModelUpdate,
  EnvironmentalEvent,
  AlertStatus,
  RiskLevel,
} from './types';

class InMemoryDatabase {
  private metrics: DashboardMetrics;
  private hotspots: Hotspot[];
  private alerts: EnvironmentalAlert[];
  private forecasts: Record<string, CityForecast>;
  private citizenReports: CitizenReport[];
  private sensors: SensorObservation[];
  private federatedCities: FederatedCityNode[];
  private modelUpdates: FederatedModelUpdate[];
  private events: EnvironmentalEvent[];

  constructor() {
    this.metrics = JSON.parse(JSON.stringify(initialMetrics));
    this.hotspots = JSON.parse(JSON.stringify(initialHotspots));
    this.alerts = JSON.parse(JSON.stringify(initialAlerts));
    this.forecasts = JSON.parse(JSON.stringify(initialCityForecasts));
    this.citizenReports = JSON.parse(JSON.stringify(initialCitizenReports));
    this.sensors = JSON.parse(JSON.stringify(initialSensors));
    this.federatedCities = JSON.parse(JSON.stringify(initialFederatedCities));
    this.modelUpdates = JSON.parse(JSON.stringify(initialModelUpdates));
    this.events = JSON.parse(JSON.stringify(initialEvents));
  }

  public reset() {
    this.metrics = JSON.parse(JSON.stringify(initialMetrics));
    this.hotspots = JSON.parse(JSON.stringify(initialHotspots));
    this.alerts = JSON.parse(JSON.stringify(initialAlerts));
    this.forecasts = JSON.parse(JSON.stringify(initialCityForecasts));
    this.citizenReports = JSON.parse(JSON.stringify(initialCitizenReports));
    this.sensors = JSON.parse(JSON.stringify(initialSensors));
    this.federatedCities = JSON.parse(JSON.stringify(initialFederatedCities));
    this.modelUpdates = JSON.parse(JSON.stringify(initialModelUpdates));
    this.events = JSON.parse(JSON.stringify(initialEvents));
    return { success: true, message: 'Database reset to initial calibrated state' };
  }

  // Metrics
  public getMetrics(): DashboardMetrics {
    const criticalCount = this.alerts.filter((a) => a.risk === 'CRITICAL' && a.status !== 'RESOLVED').length;
    const highCount = this.alerts.filter((a) => a.risk === 'HIGH' && a.status !== 'RESOLVED').length;
    const activeHotspotsCount = this.hotspots.length;

    return {
      ...this.metrics,
      activeHotspots: 27, // Preserving platform baseline
      predictiveAlerts: this.alerts.filter((a) => a.status !== 'RESOLVED').length || 8,
      connectedCities: this.federatedCities.length,
      totalModelUpdates: this.metrics.totalModelUpdates + (this.modelUpdates.length - initialModelUpdates.length),
    };
  }

  // Hotspots
  public getAllHotspots(): Hotspot[] {
    return this.hotspots;
  }

  public getHotspotById(id: string): Hotspot | undefined {
    return this.hotspots.find((h) => h.id === id || h.name.toLowerCase().includes(id.toLowerCase()));
  }

  // Alerts
  public getAllAlerts(): EnvironmentalAlert[] {
    return this.alerts;
  }

  public getAlertById(id: string): EnvironmentalAlert | undefined {
    return this.alerts.find((a) => a.id === id);
  }

  public createAlert(data: {
    title: string;
    hotspotId?: string;
    locationName: string;
    city: string;
    coordinates?: { lat: number; lng: number };
    currentAqi: number;
    predictedAqi: number;
    expectedDurationHours?: string;
    risk: RiskLevel;
    suggestedResponse: string;
    assignedAuthority?: string;
  }): EnvironmentalAlert {
    const id = `alert-${Date.now().toString(36)}`;
    const newAlert: EnvironmentalAlert = {
      id,
      title: data.title,
      hotspotId: data.hotspotId,
      locationName: data.locationName,
      city: data.city,
      coordinates: data.coordinates || { lat: 18.6279, lng: 73.8009 },
      currentAqi: data.currentAqi,
      predictedAqi: data.predictedAqi,
      expectedDurationHours: data.expectedDurationHours || '4–7 hours',
      risk: data.risk,
      suggestedResponse: data.suggestedResponse,
      status: 'ALERT_SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedAuthority: data.assignedAuthority || 'Pollution Control Board Regional Taskforce',
      actionLog: [
        {
          status: 'ALERT_SENT',
          updatedAt: new Date().toISOString(),
          actor: 'Authority Dispatch Console',
          note: `Manual dispatch created from intelligence console for ${data.locationName}.`,
        },
      ],
    };

    this.alerts.unshift(newAlert);

    // Also record an environmental event
    this.events.unshift({
      id: `ev-${Date.now().toString(36)}`,
      type: 'SPIKE',
      title: `Authority Alert Created: ${data.locationName}`,
      location: data.locationName,
      city: data.city,
      severity: data.risk,
      timestamp: 'Just now',
      description: `Dispatched response: ${data.suggestedResponse}. Predicted AQI: ${data.predictedAqi}.`,
    });

    return newAlert;
  }

  public updateAlertStatus(id: string, newStatus: AlertStatus, note?: string, actor?: string): EnvironmentalAlert | null {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) return null;

    alert.status = newStatus;
    alert.updatedAt = new Date().toISOString();
    alert.actionLog.push({
      status: newStatus,
      updatedAt: new Date().toISOString(),
      actor: actor || 'Environmental Operations Desk',
      note: note || `Status progressed to ${newStatus}`,
    });

    return alert;
  }

  // Forecasts
  public getForecast(cityId: string): CityForecast {
    const key = cityId.toLowerCase();
    if (this.forecasts[key]) {
      return this.forecasts[key];
    }
    // Return Pune default if not matched
    return this.forecasts['pune'];
  }

  public getAllForecastCities(): string[] {
    return Object.keys(this.forecasts);
  }

  // Citizen Reports
  public getAllCitizenReports(): CitizenReport[] {
    return this.citizenReports;
  }

  public addCitizenReport(report: CitizenReport): CitizenReport {
    this.citizenReports.unshift(report);

    // Record an event
    this.events.unshift({
      id: `ev-${Date.now().toString(36)}`,
      type: 'REPORT',
      title: `Citizen Alert: ${report.observationType}`,
      location: report.locationName,
      city: report.city,
      severity: report.aiAnalysis?.risk || 'HIGH',
      timestamp: 'Just now',
      description: `Observation submitted: ${report.observationType} at ${report.locationName}. AI Confidence: ${report.aiAnalysis?.confidence}%.`,
    });

    return report;
  }

  // Sensors
  public getAllSensors(): SensorObservation[] {
    return this.sensors;
  }

  // Events
  public getAllEvents(): EnvironmentalEvent[] {
    return this.events;
  }

  // Federated Learning
  public getFederatedCities(): FederatedCityNode[] {
    return this.federatedCities;
  }

  public getModelUpdates(): FederatedModelUpdate[] {
    return this.modelUpdates;
  }

  public triggerFederatedAggregation(): {
    roundNumber: number;
    newUpdatesCount: number;
    updatedAccuracy: number;
    participatingCities: string[];
    aggregationSummary: string;
  } {
    const nextRound = 429 + (this.modelUpdates.length - initialModelUpdates.length);
    const citiesToInclude = ['Pune (Bhosari)', 'Mumbai (Chembur)', 'Ahmedabad (Vatva)', 'Delhi (NCR)'];

    citiesToInclude.forEach((city, index) => {
      const update: FederatedModelUpdate = {
        id: `upd-${Date.now().toString(36)}-${index}`,
        roundNumber: nextRound,
        participatingCity: city,
        gradientNorm: +(0.035 + Math.random() * 0.04).toFixed(4),
        lossReduction: +(0.009 + Math.random() * 0.015).toFixed(4),
        weightsDelta: `ΔW[SpatialConv]: ${(Math.random() * 0.02 - 0.01).toFixed(4)}, ΔW[LSTM_Cell]: ${(Math.random() * 0.02 - 0.01).toFixed(4)}`,
        timestamp: 'Just now',
        status: 'AGGREGATED',
      };
      this.modelUpdates.unshift(update);
    });

    // Update city nodes
    this.federatedCities = this.federatedCities.map((c) => {
      if (citiesToInclude.some((city) => city.includes(c.name))) {
        return {
          ...c,
          status: 'SYNCED',
          lastModelUpdate: 'Just now',
          accuracy: +(Math.min(96.5, c.accuracy + 0.2)).toFixed(1),
          modelVersion: 'v2.8.5-fed',
        };
      }
      return c;
    });

    this.metrics.totalModelUpdates += citiesToInclude.length;

    return {
      roundNumber: nextRound,
      newUpdatesCount: citiesToInclude.length,
      updatedAccuracy: 94.8,
      participatingCities: citiesToInclude,
      aggregationSummary: `Federated averaging (FedAvg) complete across ${citiesToInclude.length} edge nodes with differential privacy ε=0.41. Local raw data remained on-premises.`,
    };
  }
}

export const db = new InMemoryDatabase();

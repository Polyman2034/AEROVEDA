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
  UserSession,
} from '../types';

const BASE_URL = '/api';

export async function fetchDashboardData(): Promise<{
  metrics: DashboardMetrics;
  recentEvents: EnvironmentalEvent[];
  activeAlerts: EnvironmentalAlert[];
  mode: string;
}> {
  const res = await fetch(`${BASE_URL}/metrics/dashboard`);
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}

export async function fetchHotspots(city?: string): Promise<{ hotspots: Hotspot[]; count: number }> {
  const url = city ? `${BASE_URL}/hotspots?city=${encodeURIComponent(city)}` : `${BASE_URL}/hotspots`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load hotspots');
  return res.json();
}

export async function fetchHotspotById(id: string): Promise<{ hotspot: Hotspot }> {
  const res = await fetch(`${BASE_URL}/hotspots/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to load hotspot ${id}`);
  return res.json();
}

export async function fetchSensors(): Promise<{ sensors: SensorObservation[]; count: number }> {
  const res = await fetch(`${BASE_URL}/hotspots/meta/sensors`);
  if (!res.ok) throw new Error('Failed to load sensors');
  return res.json();
}

export async function fetchForecast(cityId: string, sensitivity?: number): Promise<{
  forecast: CityForecast;
  disclaimer: string;
  modelEngine: string;
}> {
  const url = sensitivity
    ? `${BASE_URL}/forecasts/${encodeURIComponent(cityId)}?sensitivity=${sensitivity}`
    : `${BASE_URL}/forecasts/${encodeURIComponent(cityId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load forecast for ${cityId}`);
  return res.json();
}

export async function fetchForecastCities(): Promise<{ availableCities: string[] }> {
  const res = await fetch(`${BASE_URL}/forecasts`);
  if (!res.ok) throw new Error('Failed to load forecast cities');
  return res.json();
}

export async function fetchCitizenReports(): Promise<{ reports: CitizenReport[]; count: number }> {
  const res = await fetch(`${BASE_URL}/citizen-reports`);
  if (!res.ok) throw new Error('Failed to load citizen reports');
  return res.json();
}

export async function submitCitizenReport(data: {
  locationName: string;
  city: string;
  coordinates: { lat: number; lng: number };
  observationType: string;
  reportedBy: string;
  imageUrl?: string;
}): Promise<{
  success: boolean;
  report: CitizenReport;
  analysis: any;
}> {
  const res = await fetch(`${BASE_URL}/citizen-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit citizen report');
  return res.json();
}

export async function fetchAlerts(): Promise<{
  alerts: EnvironmentalAlert[];
  counts: { critical: string; high: string; moderate: string; total: number };
}> {
  const res = await fetch(`${BASE_URL}/alerts`);
  if (!res.ok) throw new Error('Failed to load alerts');
  return res.json();
}

export async function createAlert(payload: {
  title: string;
  hotspotId?: string;
  locationName: string;
  city: string;
  currentAqi: number;
  predictedAqi: number;
  expectedDurationHours?: string;
  risk: string;
  suggestedResponse: string;
  assignedAuthority?: string;
}): Promise<{ success: boolean; alert: EnvironmentalAlert }> {
  const res = await fetch(`${BASE_URL}/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create alert');
  return res.json();
}

export async function updateAlertStatus(
  id: string,
  status: AlertStatus,
  note?: string,
  actor?: string
): Promise<{ success: boolean; alert: EnvironmentalAlert }> {
  const res = await fetch(`${BASE_URL}/alerts/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note, actor }),
  });
  if (!res.ok) throw new Error('Failed to update alert status');
  return res.json();
}

export async function fetchFederatedNetwork(): Promise<{
  connectedCitiesCount: number;
  sharedModelsCount: number;
  totalModelUpdates: number;
  privacyGuarantee: string;
  algorithm: string;
  coreTenet: string;
  cities: FederatedCityNode[];
  recentUpdates: FederatedModelUpdate[];
}> {
  const res = await fetch(`${BASE_URL}/federated/network`);
  if (!res.ok) throw new Error('Failed to load federated network status');
  return res.json();
}

export async function triggerFederatedRound(): Promise<{
  roundNumber: number;
  newUpdatesCount: number;
  updatedAccuracy: number;
  participatingCities: string[];
  aggregationSummary: string;
}> {
  const res = await fetch(`${BASE_URL}/federated/aggregate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger federated aggregation');
  return res.json();
}

export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/metrics/reset-data`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user: UserSession }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to authenticate');
  }
  return res.json();
}

export async function signupUser(email: string, password: string, name?: string): Promise<{ success: boolean; user: UserSession }> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create demo account');
  }
  return res.json();
}

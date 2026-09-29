import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchHotspotById, fetchHotspots, createAlert } from '../services/api';
import { Hotspot } from '../types';
import { PredictionChart } from '../components/charts/PredictionChart';
import {
  CheckCircle2,
  ArrowRight,
  Send,
  Radio,
  Satellite,
  Wind,
  Camera,
} from 'lucide-react';

export const HotspotIntelligencePage: React.FC = () => {
  const { selectedHotspotId, setSelectedHotspotId, setActiveTab } = useAuth();
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [allHotspots, setAllHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertCreating, setIsAlertCreating] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [hotspotsRes, targetRes] = await Promise.all([
          fetchHotspots(),
          fetchHotspotById(selectedHotspotId || 'hotspot-pune-corridor'),
        ]);

        setAllHotspots(hotspotsRes.hotspots);
        setHotspot(targetRes.hotspot);
      } catch (err) {
        console.error('Failed to load hotspot details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedHotspotId]);

  const handleCreateAlert = async () => {
    if (!hotspot) return;
    try {
      setIsAlertCreating(true);
      const res = await createAlert({
        title: `${displayName} Alert`,
        hotspotId: hotspot.id,
        locationName: displayName,
        city: hotspot.city,
        currentAqi: hotspot.aqi,
        predictedAqi: hotspot.predictionChart?.[3]?.aqi || Math.round(hotspot.aqi * 1.2),
        expectedDurationHours: '4–7 hours',
        risk: hotspot.risk,
        suggestedResponse: 'Field inspection',
        assignedAuthority: 'Pollution Control Taskforce',
      });

      setAlertSuccess(
        `Alert #${res.alert.id.toUpperCase()} created successfully.`
      );
    } catch (err: any) {
      alert('Error creating alert: ' + (err.message || 'Unknown error'));
    } finally {
      setIsAlertCreating(false);
    }
  };

  if (isLoading && !hotspot) {
    return (
      <div className="p-12 text-center text-xs text-zinc-400 font-mono">
        Loading area details...
      </div>
    );
  }

  if (!hotspot) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        Hotspot not found.
      </div>
    );
  }

  const displayName = hotspot.name === 'Pune Industrial Corridor'
    ? 'Pune Industrial Area'
    : hotspot.name;

  // Simple explainability factors as requested
  const simpleFactors = [
    { factor: 'Industrial Activity', percentage: 42, description: 'Factory emissions and boiler shifts' },
    { factor: 'Low Wind', percentage: 27, description: 'Calm air trapping smoke near the ground' },
    { factor: 'Sensor Reading', percentage: 18, description: 'Spike recorded by nearby ground sensors' },
    { factor: 'Satellite Data', percentage: 9, description: 'Smoke plume detected from space' },
    { factor: 'Past Trends', percentage: 4, description: 'Normal patterns for this weekday and season' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Selector & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded tracking-wide ${
                hotspot.risk === 'CRITICAL'
                  ? 'bg-rose-50 text-rose-800'
                  : 'bg-amber-50 text-amber-900'
              }`}
            >
              Risk: {hotspot.risk === 'CRITICAL' ? 'Critical' : hotspot.risk === 'HIGH' ? 'High' : 'Moderate'}
            </span>
            <span className="text-zinc-300">·</span>
            <span className="text-[11px] font-mono text-zinc-400">
              Detected: 14 minutes ago
            </span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-1">
            {displayName}
          </h2>
          <p className="text-xs text-zinc-500 font-normal">
            {hotspot.city}, {hotspot.state}
          </p>
        </div>

        {/* Hotspot Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs text-zinc-400">Choose Area:</label>
          <select
            value={hotspot.id}
            onChange={(e) => setSelectedHotspotId(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-zinc-200/80 rounded-md text-xs font-medium text-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
          >
            {allHotspots.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name === 'Pune Industrial Corridor' ? 'Pune Industrial Area' : h.name} ({h.aqi} AQI)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert Dispatch Confirmation */}
      {alertSuccess && (
        <div className="p-3.5 bg-zinc-900 text-white rounded-lg flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{alertSuccess}</span>
          </div>
          <button
            onClick={() => setActiveTab('action-center')}
            className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 font-medium transition-colors ml-4"
          >
            <span>View in Action Center</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Stats: AQI 287 · 91% confidence */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-2">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Air Quality (AQI)
          </div>
          <div className="text-3xl font-semibold font-mono text-zinc-900 mt-1 tabular-nums">
            {hotspot.aqi}
          </div>
          <div className="text-[11px] text-zinc-400 font-normal mt-0.5">
            Main pollutant: {hotspot.primaryPollutant}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Confidence
          </div>
          <div className="text-3xl font-semibold font-mono text-zinc-900 mt-1 tabular-nums">
            {hotspot.confidence}%
          </div>
          <div className="text-[11px] text-zinc-400 font-normal mt-0.5">
            Verified across data sources
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Affected Area
          </div>
          <div className="text-3xl font-semibold font-mono text-zinc-900 mt-1 tabular-nums">
            {hotspot.affectedRadiusKm} km
          </div>
          <div className="text-[11px] text-zinc-400 font-normal mt-0.5">
            Around the source
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Time Detected
          </div>
          <div className="text-3xl font-semibold font-mono text-zinc-900 mt-1 tabular-nums">
            14m
          </div>
          <div className="text-[11px] text-zinc-400 font-normal mt-0.5">
            14 minutes ago
          </div>
        </div>
      </div>

      {/* Why is this area at risk? */}
      <section className="space-y-4">
        <div className="border-b border-zinc-200/80 pb-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Why is this area at risk?
          </h3>
        </div>

        <div className="space-y-3">
          {simpleFactors.map((item) => (
            <div key={item.factor} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-800 font-medium">{item.factor}</span>
                <span className="font-mono text-zinc-900 font-medium tabular-nums">
                  {item.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-800 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-zinc-400 font-normal leading-normal">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="space-y-3">
        <div className="border-b border-zinc-200/80 pb-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Data Sources
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hotspot.signals.map((sig) => {
            let Icon = Radio;
            let labelText = 'Sensors';
            if (sig.type === 'Satellite signal') {
              Icon = Satellite;
              labelText = 'Satellite';
            }
            if (sig.type === 'Meteorological condition') {
              Icon = Wind;
              labelText = 'Weather';
            }
            if (sig.type === 'Citizen observation') {
              Icon = Camera;
              labelText = 'Citizen Report';
            }

            return (
              <div key={sig.id} className="p-3 bg-zinc-50 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase tracking-wider">
                  <span className="flex items-center gap-1 font-medium text-zinc-700">
                    <Icon className="w-3 h-3 text-zinc-500" />
                    {labelText}
                  </span>
                  <span className="font-mono">{sig.timestamp}</span>
                </div>
                <div className="font-medium text-zinc-800 text-[11px] leading-snug">
                  {sig.label}
                </div>
                <div className="text-[11px] font-mono text-zinc-600 pt-0.5">{sig.value}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AQI Prediction Chart */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Expected Air Quality
            </h3>
            <p className="text-[11px] text-zinc-400 font-normal">
              Forecast for the next 24 hours if weather stays calm
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">AI Forecast</span>
        </div>

        <div className="py-2">
          <PredictionChart
            data={hotspot.predictionChart}
            currentAqi={hotspot.aqi}
            height={180}
          />
        </div>
      </section>

      {/* Action Footer: Recommended Protocol & Single Primary Action "Create Alert" */}
      <section className="p-5 bg-zinc-50 border border-zinc-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Recommended Action
          </div>
          <div className="text-sm font-semibold text-zinc-900 mt-0.5">
            Environmental field inspection
          </div>
          <div className="text-xs text-zinc-500 mt-0.5 font-normal">
            Send an inspection team to check factory chimneys and use water misting if needed.
          </div>
        </div>

        <button
          onClick={handleCreateAlert}
          disabled={isAlertCreating}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-2xs shrink-0 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isAlertCreating ? 'Creating Alert...' : 'Create Alert'}</span>
        </button>
      </section>
    </div>
  );
};

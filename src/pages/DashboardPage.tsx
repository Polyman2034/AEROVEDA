import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardData, fetchHotspots, fetchSensors } from '../services/api';
import { InteractiveIndiaMap } from '../components/map/InteractiveIndiaMap';
import {
  DashboardMetrics,
  Hotspot,
  SensorObservation,
  EnvironmentalEvent,
  EnvironmentalAlert,
} from '../types';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { setActiveTab, setSelectedHotspotId } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [sensors, setSensors] = useState<SensorObservation[]>([]);
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<EnvironmentalAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [dashData, hotspotsData, sensorsData] = await Promise.all([
          fetchDashboardData(),
          fetchHotspots(),
          fetchSensors(),
        ]);

        setMetrics(dashData.metrics);
        setEvents(dashData.recentEvents);
        setActiveAlerts(dashData.activeAlerts);
        setHotspots(hotspotsData.hotspots);
        setSensors(sensorsData.sensors);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSelectHotspot = (hotspot: Hotspot) => {
    setSelectedHotspotId(hotspot.id);
  };

  const handleViewIntelligence = (hotspotId: string) => {
    setSelectedHotspotId(hotspotId);
    setActiveTab('hotspot-intelligence');
  };

  if (isLoading && !metrics) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[400px]">
        <div className="text-xs text-zinc-400 font-mono">
          Loading air quality data...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Primary Information Summary in Simple Words */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-200/80 pb-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
              Air Quality Overview
            </h2>
            <p className="text-xs text-zinc-500 font-normal">
              Air quality is currently poor in several industrial areas due to low wind.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Updated 2 min ago
          </span>
        </div>

        {/* 4 Simple Metrics: Air Quality, Active Hotspots, Early Alerts, Connected Cities */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-1">
          {/* Air Quality */}
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Air Quality
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold font-mono tracking-tight text-zinc-900 tabular-nums">
                {metrics?.airQuality ?? 287}
              </span>
              <span className="text-xs font-medium text-amber-700">
                AQI · Poor
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Pollution is high in the Pune area
            </p>
          </div>

          {/* Active Hotspots */}
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Active Hotspots
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold font-mono tracking-tight text-zinc-900 tabular-nums">
                {metrics?.activeHotspots ?? 27}
              </span>
              <span className="text-xs font-medium text-zinc-600">
                Areas
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              3 high-priority areas detected
            </p>
          </div>

          {/* Early Alerts */}
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Early Alerts
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold font-mono tracking-tight text-zinc-900 tabular-nums">
                0{metrics?.predictiveAlerts ?? 8}
              </span>
              <span className="text-xs font-medium text-zinc-600">
                Alerts
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Inspection teams notified
            </p>
          </div>

          {/* Connected Cities */}
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Connected Cities
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold font-mono tracking-tight text-zinc-900 tabular-nums">
                {metrics?.connectedCities ?? 12}
              </span>
              <span className="text-xs font-medium text-zinc-600">
                Cities
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Sharing AI models safely
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Visual: Pollution Map */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Pollution Map
          </h3>
          <button
            onClick={() => setActiveTab('intelligence-map')}
            className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Open Full Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="h-[500px]">
          <InteractiveIndiaMap
            hotspots={hotspots}
            sensors={sensors}
            selectedHotspotId="hotspot-pune-corridor"
            onSelectHotspot={handleSelectHotspot}
            onViewIntelligence={handleViewIntelligence}
          />
        </div>
      </section>

      {/* 3. Secondary Lists: Recent Events and Active Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        {/* Recent Events List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Recent Events
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">Live Feed</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {events.map((ev) => (
              <div key={ev.id} className="py-3 first:pt-1 last:pb-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-medium text-zinc-900 truncate">
                    {ev.title}
                  </div>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded shrink-0 ${
                      ev.severity === 'CRITICAL'
                        ? 'text-rose-700 bg-rose-50'
                        : ev.severity === 'HIGH'
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-zinc-600 bg-zinc-100'
                    }`}
                  >
                    {ev.severity === 'CRITICAL' ? 'Critical' : ev.severity === 'HIGH' ? 'High' : 'Moderate'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                  {ev.description}
                </p>
                <div className="text-[10px] text-zinc-400 font-mono pt-0.5">
                  {ev.location} · {ev.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Early Alerts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Active Alerts
            </h3>
            <button
              onClick={() => setActiveTab('action-center')}
              className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Action Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setActiveTab('action-center')}
                className="p-3.5 rounded-lg border border-zinc-200/80 bg-white hover:bg-zinc-50/70 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-zinc-900">
                      {alert.locationName}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 font-normal">
                      Recommended action: {alert.suggestedResponse}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0">
                    {alert.status === 'ALERT_SENT' ? 'Alert Sent' : alert.status === 'INVESTIGATING' ? 'Under Review' : alert.status === 'ACKNOWLEDGED' ? 'Accepted' : 'Detected'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1 border-t border-zinc-100">
                  <span>Current: <strong className="text-zinc-700 font-normal">{alert.currentAqi} AQI</strong></span>
                  <span>Expected peak: <strong className="text-zinc-900 font-medium">{alert.predictedAqi} AQI</strong></span>
                  <span>Duration: {alert.expectedDurationHours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

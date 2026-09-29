import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchHotspots,
  fetchHotspotById,
  fetchSensors,
  fetchCitizenReports,
} from '../services/api';
import { InteractiveIndiaMap } from '../components/map/InteractiveIndiaMap';
import { Hotspot, SensorObservation, CitizenReport } from '../types';
import { ChevronRight, Radio } from 'lucide-react';

export const IntelligenceMapPage: React.FC = () => {
  const { selectedHotspotId, setSelectedHotspotId, setActiveTab } = useAuth();
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [currentHotspot, setCurrentHotspot] = useState<Hotspot | null>(null);
  const [sensors, setSensors] = useState<SensorObservation[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [hotspotsRes, sensorsRes, reportsRes] = await Promise.all([
          fetchHotspots(),
          fetchSensors(),
          fetchCitizenReports(),
        ]);

        setHotspots(hotspotsRes.hotspots);
        setSensors(sensorsRes.sensors);
        setCitizenReports(reportsRes.reports);

        const targetId = selectedHotspotId || 'hotspot-pune-corridor';
        loadSelectedHotspot(targetId);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const loadSelectedHotspot = async (id: string) => {
    try {
      const res = await fetchHotspotById(id);
      setCurrentHotspot(res.hotspot);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectHotspot = (hotspot: Hotspot) => {
    setSelectedHotspotId(hotspot.id);
    loadSelectedHotspot(hotspot.id);
  };

  const handleViewIntelligence = (hotspotId: string) => {
    setSelectedHotspotId(hotspotId);
    setActiveTab('hotspot-intelligence');
  };

  const displayName = currentHotspot?.name === 'Pune Industrial Corridor'
    ? 'Pune Industrial Area'
    : currentHotspot?.name;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Grid: 8 Cols Map + 4 Cols Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Map Viewport */}
        <div className="lg:col-span-8 h-[680px] min-h-0">
          <InteractiveIndiaMap
            hotspots={hotspots}
            sensors={sensors}
            citizenReports={citizenReports}
            selectedHotspotId={currentHotspot?.id || selectedHotspotId}
            onSelectHotspot={handleSelectHotspot}
            onViewIntelligence={handleViewIntelligence}
          />
        </div>

        {/* Right Details Panel with Simple English */}
        <div className="lg:col-span-4 space-y-6">
          {currentHotspot ? (
            <div className="bg-white border border-zinc-200/80 rounded-xl p-6 space-y-6 shadow-2xs">
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      currentHotspot.risk === 'CRITICAL'
                        ? 'text-rose-700 bg-rose-50'
                        : 'text-amber-800 bg-amber-50'
                    }`}
                  >
                    Risk: {currentHotspot.risk === 'CRITICAL' ? 'Critical' : currentHotspot.risk === 'HIGH' ? 'High' : 'Moderate'}
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Detected: {currentHotspot.detectedAgo}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
                  {displayName}
                </h2>
                <p className="text-xs text-zinc-400 font-normal">
                  {currentHotspot.city}, {currentHotspot.state}
                </p>
              </div>

              {/* Primary Stats */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-100">
                <div>
                  <div className="text-[11px] text-zinc-400 font-medium">Air Quality (AQI)</div>
                  <div className="text-2xl font-semibold font-mono text-zinc-900 mt-0.5 tabular-nums">
                    {currentHotspot.aqi}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400 font-medium">Confidence</div>
                  <div className="text-2xl font-semibold font-mono text-zinc-900 mt-0.5 tabular-nums">
                    {currentHotspot.confidence}%
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              <div className="space-y-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Data Sources
                </div>

                <div className="space-y-2">
                  {currentHotspot.signals.map((sig) => {
                    const simpleType = sig.type === 'Sensor anomaly' ? 'Sensors' :
                      sig.type === 'Satellite signal' ? 'Satellite' :
                      sig.type === 'Meteorological condition' ? 'Weather' :
                      'Citizen Report';

                    return (
                      <div
                        key={sig.id}
                        className="p-3 bg-zinc-50 rounded-lg text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-zinc-800 font-medium">
                          <span>{simpleType}</span>
                          <span className="text-[10px] font-mono text-zinc-400 font-normal">
                            {sig.timestamp}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-normal">{sig.label}</div>
                        <div className="text-[11px] font-mono text-zinc-700 pt-0.5">{sig.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View Details CTA */}
              <button
                onClick={() => handleViewIntelligence(currentHotspot.id)}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-400 font-mono">
              Click any area on the map to see details
            </div>
          )}

          {/* Quick Sensor Feed */}
          <div className="p-5 bg-white border border-zinc-200/80 rounded-xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-900">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-zinc-400" />
                Air Quality Sensors
              </span>
              <span className="text-[11px] font-mono text-zinc-400 font-normal">
                {sensors.length} Active
              </span>
            </div>

            <div className="divide-y divide-zinc-100 text-xs">
              {sensors.slice(0, 3).map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between">
                  <div className="truncate max-w-[190px]">
                    <div className="font-medium text-zinc-800 truncate">{s.stationName}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      PM2.5: {s.pm25} µg/m³ · {s.city}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-medium text-zinc-900">
                    {s.aqi} AQI
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

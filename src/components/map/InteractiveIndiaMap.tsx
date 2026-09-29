import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Hotspot, SensorObservation, CitizenReport } from '../../types';
import {
  Compass,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface InteractiveIndiaMapProps {
  hotspots: Hotspot[];
  sensors?: SensorObservation[];
  citizenReports?: CitizenReport[];
  selectedHotspotId?: string;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onViewIntelligence?: (hotspotId: string) => void;
  onSelectCorridor?: (corridor: RiskCorridor) => void;
  isCompact?: boolean;
}

// City view camera bounds
const CITY_CENTERS: Record<
  string,
  { center: [number, number]; zoom: number }
> = {
  all: { center: [22.2, 79.5], zoom: 5 },
  pune: { center: [18.6279, 73.815], zoom: 12 },
  delhi: { center: [28.6469, 77.3164], zoom: 12 },
  mumbai: { center: [19.0178, 72.9056], zoom: 12 },
};

// Geographic Risk Corridors
interface RiskCorridor {
  id: string;
  name: string;
  city: string;
  risk: 'HIGH' | 'CRITICAL';
  coords: [number, number][];
  color: string;
}
const RISK_CORRIDORS: RiskCorridor[] = [
  {
    id: 'corridor-pune',
    name: 'Bhosari-Chakan Industrial Belt',
    city: 'Pune',
    risk: 'HIGH',
    coords: [
      [18.585, 73.785],
      [18.65, 73.83],
      [18.79, 73.855],
      [18.775, 73.895],
      [18.635, 73.86],
      [18.57, 73.815],
    ] as [number, number][],
    color: '#d97706',
  },
  {
    id: 'corridor-delhi',
    name: 'Anand Vihar - Kaushambi Frontier',
    city: 'Delhi',
    risk: 'CRITICAL',
    coords: [
      [28.615, 77.275],
      [28.675, 77.335],
      [28.665, 77.385],
      [28.595, 77.315],
    ] as [number, number][],
    color: '#e11d48',
  },
  {
    id: 'corridor-mumbai',
    name: 'Chembur-Trombay Petrochemical Arc',
    city: 'Mumbai',
    risk: 'HIGH',
    coords: [
      [18.98, 72.875],
      [19.045, 72.915],
      [19.03, 72.955],
      [18.965, 72.91],
    ] as [number, number][],
    color: '#ea580c',
  },
];

// Wind telemetry vectors
const WIND_VECTORS = [
  {
    lat: 18.635,
    lng: 73.82,
    angle: 70,
    speed: '1.8 km/h',
    note: 'Calm valley stagnation',
    city: 'Pune',
  },
  {
    lat: 18.75,
    lng: 73.85,
    angle: 65,
    speed: '2.1 km/h',
    note: 'Chakan light drift',
    city: 'Pune',
  },
  {
    lat: 18.53,
    lng: 73.84,
    angle: 90,
    speed: '3.4 km/h',
    note: 'Shivajinagar easterly',
    city: 'Pune',
  },
  {
    lat: 28.645,
    lng: 77.31,
    angle: 310,
    speed: '0.9 km/h',
    note: 'Severe NW surface inversion',
    city: 'Delhi',
  },
  {
    lat: 19.02,
    lng: 72.905,
    angle: 240,
    speed: '4.2 km/h',
    note: 'Sea breeze coastal eddy',
    city: 'Mumbai',
  },
  {
    lat: 22.955,
    lng: 72.63,
    angle: 120,
    speed: '2.5 km/h',
    note: 'Arid inland calm',
    city: 'Ahmedabad',
  },
];

// Geographic landmarks for Pune context
const PUNE_LANDMARKS = [
  {
    name: 'NH 60 (Pune-Nashik Hwy)',
    lat: 18.665,
    lng: 73.848,
    type: 'Highway',
  },
  {
    name: 'Mumbai-Pune Expressway',
    lat: 18.65,
    lng: 73.74,
    type: 'Expressway',
  },
  {
    name: 'Pavana River Basin',
    lat: 18.625,
    lng: 73.785,
    type: 'River',
  },
  {
    name: 'Indrayani River Corridor',
    lat: 18.705,
    lng: 73.835,
    type: 'River',
  },
  {
    name: 'Bhosari MIDC Sector 7',
    lat: 18.632,
    lng: 73.842,
    type: 'Industrial',
  },
];

export const InteractiveIndiaMap: React.FC<
  InteractiveIndiaMapProps
> = ({
  hotspots,
  sensors = [],
  citizenReports = [],
  selectedHotspotId,
  onSelectHotspot,
  onViewIntelligence,
  onSelectCorridor,
  isCompact = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer toggles
  const [showAqi, setShowAqi] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showWind, setShowWind] = useState(false);
  const [showCorridors, setShowCorridors] = useState(false);
  const [showSensors, setShowSensors] = useState(false);
  const [showReports, setShowReports] = useState(false);

  // Active city filter
  const [activeCityFilter, setActiveCityFilter] = useState<
    'all' | 'pune' | 'delhi' | 'mumbai'
  >('all');

  // NEW: selected risk corridor
  const [selectedCorridorId, setSelectedCorridorId] = useState<
    string | null
  >(null);

  const selectedHotspot =
    hotspots.find((h) => h.id === selectedHotspotId) || hotspots[0];

  const selectedCorridor =
    RISK_CORRIDORS.find((c) => c.id === selectedCorridorId) || null;

  // Layer groups
  const layersRef = useRef<{
    aqiLayer: L.LayerGroup;
    hotspotsLayer: L.LayerGroup;
    windLayer: L.LayerGroup;
    corridorsLayer: L.LayerGroup;
    sensorsLayer: L.LayerGroup;
    reportsLayer: L.LayerGroup;
    landmarksLayer: L.LayerGroup;
  }>({
    aqiLayer: L.layerGroup(),
    hotspotsLayer: L.layerGroup(),
    windLayer: L.layerGroup(),
    corridorsLayer: L.layerGroup(),
    sensorsLayer: L.layerGroup(),
    reportsLayer: L.layerGroup(),
    landmarksLayer: L.layerGroup(),
  });

  // =========================================================
  // 1. Initialize Map
  // =========================================================

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CITY_CENTERS.all.center,
      zoom: CITY_CENTERS.all.zoom,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    const basemap = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }
    );

    basemap.addTo(map);

    // Map resize handling
    const invalidateMapSize = () => {
      map.invalidateSize({ pan: false });
    };

    map.whenReady(() => {
      requestAnimationFrame(() => {
        invalidateMapSize();

        requestAnimationFrame(() => {
          invalidateMapSize();
        });
      });
    });

    const timers = [100, 300, 700].map((delay) =>
      window.setTimeout(invalidateMapSize, delay)
    );

    const resizeObserver = new ResizeObserver(() => {
      invalidateMapSize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Attach layers
    const {
      aqiLayer,
      hotspotsLayer,
      windLayer,
      corridorsLayer,
      sensorsLayer,
      reportsLayer,
      landmarksLayer,
    } = layersRef.current;

    aqiLayer.addTo(map);
    hotspotsLayer.addTo(map);
    windLayer.addTo(map);
    corridorsLayer.addTo(map);
    sensorsLayer.addTo(map);
    reportsLayer.addTo(map);
    landmarksLayer.addTo(map);

    return () => {
      timers.forEach(clearTimeout);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // =========================================================
  // 2. Render Hotspots
  // =========================================================

  useEffect(() => {
    const { hotspotsLayer } = layersRef.current;

    hotspotsLayer.clearLayers();

    if (!showHotspots) return;

    hotspots.forEach((h) => {
      const isSelected =
        h.id === (selectedHotspot?.id || selectedHotspotId);

      const isCritical = h.risk === 'CRITICAL';
      const color = isCritical ? '#e11d48' : '#d97706';

      const markerHtml = `
        <div class="relative flex items-center group cursor-pointer" style="transform: translate(-10px, -10px);">
          ${
            isSelected
              ? `<span class="absolute -inset-2 rounded-full animate-ping opacity-35" style="background-color: ${color};"></span>`
              : ''
          }
          <div class="relative flex items-center shadow-xs rounded-full border border-white bg-white/95 px-2 py-0.5 text-[11px] font-sans transition-transform group-hover:scale-110">
            <span class="w-2.5 h-2.5 rounded-full mr-1.5 shrink-0" style="background-color: ${color};"></span>
            <span class="font-medium text-zinc-900 whitespace-nowrap">${h.city}</span>
            <span class="ml-1 text-[10px] font-mono text-zinc-500 tabular-nums">${h.aqi}</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-hotspot-pin',
        html: markerHtml,
        iconSize: [80, 26],
        iconAnchor: [12, 13],
      });

      const marker = L.marker(
        [h.coordinates.lat, h.coordinates.lng],
        { icon }
      );

      marker.on('click', () => {
        onSelectHotspot(h);
      });

      hotspotsLayer.addLayer(marker);
    });
  }, [
    hotspots,
    selectedHotspotId,
    selectedHotspot,
    showHotspots,
    onSelectHotspot,
  ]);

  // =========================================================
  // 3. Render Air Quality Layer
  // =========================================================

  useEffect(() => {
    const { aqiLayer } = layersRef.current;

    aqiLayer.clearLayers();

    if (!showAqi) return;

    hotspots.forEach((h) => {
      const isCritical = h.risk === 'CRITICAL';
      const color = isCritical ? '#e11d48' : '#f59e0b';
      const radiusMeters = (h.affectedRadiusKm || 12) * 1000;

      const circle = L.circle(
        [h.coordinates.lat, h.coordinates.lng],
        {
          radius: radiusMeters,
          color,
          weight: 1,
          opacity: 0.4,
          fillColor: color,
          fillOpacity: isCritical ? 0.16 : 0.12,
        }
      );

      aqiLayer.addLayer(circle);

      const innerCore = L.circle(
        [h.coordinates.lat, h.coordinates.lng],
        {
          radius: radiusMeters * 0.35,
          color,
          weight: 0,
          fillColor: color,
          fillOpacity: isCritical ? 0.25 : 0.2,
        }
      );

      aqiLayer.addLayer(innerCore);
    });
  }, [hotspots, showAqi]);

  // =========================================================
  // 4. Render Risk Areas
  // =========================================================

  useEffect(() => {
    const { corridorsLayer } = layersRef.current;

    corridorsLayer.clearLayers();

    if (!showCorridors) return;

    RISK_CORRIDORS.forEach((c) => {
      const isSelected = selectedCorridorId === c.id;

      const polygon = L.polygon(c.coords, {
        color: c.color,
        dashArray: isSelected ? undefined : '4, 4',
        weight: isSelected ? 3 : 1.5,
        fillColor: c.color,
        fillOpacity: isSelected ? 0.2 : 0.1,
      });

      // Tooltip
      polygon.bindTooltip(
        `
          <div class="text-[11px] font-medium text-zinc-900">
            ${c.name}
          </div>
          <div class="text-[10px] text-zinc-500 font-mono">
            ${c.risk} RISK AREA
          </div>
        `,
        {
          sticky: true,
          className: 'custom-leaflet-tooltip',
        }
      );

      // NEW: click selection
    polygon.on('click', () => {
      setSelectedCorridorId(c.id);
      onSelectCorridor?.(c);
     });

      corridorsLayer.addLayer(polygon);
    });
  }, [showCorridors, selectedCorridorId]);

  // =========================================================
  // 5. Render Wind Layer
  // =========================================================

  useEffect(() => {
    const { windLayer } = layersRef.current;

    windLayer.clearLayers();

    if (!showWind) return;

    WIND_VECTORS.forEach((w) => {
      const windHtml = `
        <div class="flex items-center gap-1.5 p-1 bg-white/90 border border-zinc-200/80 rounded-md shadow-2xs backdrop-blur-xs select-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${w.angle}deg);">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
          <div class="text-[10px] font-mono leading-none">
            <span class="font-medium text-zinc-800">${w.speed}</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-wind-marker',
        html: windHtml,
        iconSize: [60, 22],
        iconAnchor: [30, 11],
      });

      const marker = L.marker([w.lat, w.lng], { icon });

      marker.bindTooltip(
        `
          <div class="text-[11px] font-medium text-zinc-900">
            ${w.note}
          </div>
          <div class="text-[10px] text-zinc-500">
            ${w.city} Airshed
          </div>
        `,
        {
          className: 'custom-leaflet-tooltip',
        }
      );

      windLayer.addLayer(marker);
    });
  }, [showWind]);

  // =========================================================
  // 6. Render Sensors
  // =========================================================

  useEffect(() => {
    const { sensorsLayer } = layersRef.current;

    sensorsLayer.clearLayers();

    if (!showSensors) return;

    sensors.forEach((s) => {
      const isAnomaly = s.status === 'anomaly';
      const color = isAnomaly ? '#e11d48' : '#2563eb';

      const sensorHtml = `
        <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center cursor-pointer transition-transform hover:scale-125" style="background-color: ${color};">
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-sensor-icon',
        html: sensorHtml,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker(
        [s.coordinates.lat, s.coordinates.lng],
        { icon }
      );

      marker.bindPopup(`
        <div class="p-1 font-sans text-xs">
          <div class="font-semibold text-zinc-900">${s.stationName}</div>
          <div class="text-zinc-500 text-[11px] mt-0.5">
            ${s.city} · Ground Sensor
          </div>

          <div class="mt-2 pt-1 border-t border-zinc-100 grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>AQI: <strong>${s.aqi}</strong></div>
            <div>PM2.5: <strong>${s.pm25} µg/m³</strong></div>
            <div>NO2: <strong>${s.no2} µg/m³</strong></div>
            <div>Temp: <strong>${s.temperatureC}°C</strong></div>
          </div>
        </div>
      `);

      sensorsLayer.addLayer(marker);
    });
  }, [sensors, showSensors]);

  // =========================================================
  // 7. Citizen Reports
  // =========================================================

  useEffect(() => {
    const { reportsLayer } = layersRef.current;

    reportsLayer.clearLayers();

    if (!showReports) return;

    citizenReports.forEach((r) => {
      const reportHtml = `
        <div class="w-4 h-4 rounded-sm bg-emerald-600 border border-white shadow-xs flex items-center justify-center cursor-pointer transition-transform hover:scale-125 text-white">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-report-icon',
        html: reportHtml,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker(
        [r.coordinates.lat, r.coordinates.lng],
        { icon }
      );

      marker.bindPopup(`
        <div class="p-1 font-sans text-xs">
          <div class="font-semibold text-zinc-900">
            ${r.observationType}
          </div>

          <div class="text-zinc-500 text-[11px] mt-0.5">
            ${r.locationName}
          </div>

          <div class="mt-1 text-[11px] text-zinc-600">
            Reported by ${r.reportedBy}
          </div>

          ${
            r.aiAnalysis
              ? `
                <div class="mt-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  AI Verified: ${r.aiAnalysis.confidence}% · ${r.aiAnalysis.risk} Risk
                </div>
              `
              : ''
          }
        </div>
      `);

      reportsLayer.addLayer(marker);
    });
  }, [citizenReports, showReports]);

  // =========================================================
  // 8. Pune Landmarks
  // =========================================================

  useEffect(() => {
    const { landmarksLayer } = layersRef.current;

    landmarksLayer.clearLayers();

    if (activeCityFilter === 'pune') {
      PUNE_LANDMARKS.forEach((lm) => {
        const landmarkHtml = `
          <div class="px-1.5 py-0.5 rounded bg-zinc-900/80 text-white text-[9.5px] font-mono whitespace-nowrap shadow-2xs pointer-events-none opacity-85">
            ${lm.name}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-landmark-tag',
          html: landmarkHtml,
          iconSize: [100, 16],
          iconAnchor: [50, 8],
        });

        const marker = L.marker(
          [lm.lat, lm.lng],
          { icon }
        );

        landmarksLayer.addLayer(marker);
      });
    }
  }, [activeCityFilter]);

  // =========================================================
  // City Filter
  // =========================================================

  const handleCityFilter = (
    cityKey: 'all' | 'pune' | 'delhi' | 'mumbai'
  ) => {
    setActiveCityFilter(cityKey);

    const map = mapInstanceRef.current;

    if (!map) return;

    const target = CITY_CENTERS[cityKey];

    map.flyTo(target.center, target.zoom, {
      duration: 1.1,
      easeLinearity: 0.25,
    });

    if (cityKey === 'pune') {
      const puneHotspot = hotspots.find(
        (h) => h.city.toLowerCase() === 'pune'
      );

      if (puneHotspot) onSelectHotspot(puneHotspot);
    } else if (cityKey === 'delhi') {
      const delhiHotspot = hotspots.find(
        (h) => h.city.toLowerCase() === 'delhi'
      );

      if (delhiHotspot) onSelectHotspot(delhiHotspot);
    } else if (cityKey === 'mumbai') {
      const mumHotspot = hotspots.find(
        (h) => h.city.toLowerCase() === 'mumbai'
      );

      if (mumHotspot) onSelectHotspot(mumHotspot);
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white border border-zinc-200/80 rounded-xl overflow-hidden select-none">

      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-zinc-100 bg-white z-10">

        <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
          <Compass className="w-3.5 h-3.5 text-zinc-400" />

          <span>Pollution Map</span>

          <span className="text-zinc-300">·</span>

          <span className="text-zinc-400 font-normal">
            {activeCityFilter === 'pune'
              ? 'Pune & Pimpri-Chinchwad'
              : activeCityFilter === 'delhi'
              ? 'Delhi NCR'
              : activeCityFilter === 'mumbai'
              ? 'Mumbai'
              : 'National Airsheds'}
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1 bg-zinc-100/80 p-0.5 rounded-lg text-[11px]">

          <button
            onClick={() => setShowAqi(!showAqi)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              showAqi
                ? 'bg-white text-zinc-900 font-medium shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Air Quality
          </button>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              showHotspots
                ? 'bg-white text-zinc-900 font-medium shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Pollution Hotspots ({hotspots.length})
          </button>

          <button
            onClick={() => setShowWind(!showWind)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              showWind
                ? 'bg-white text-zinc-900 font-medium shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Wind
          </button>

          <button
            onClick={() => {
              setShowCorridors(!showCorridors);

              if (showCorridors) {
                setSelectedCorridorId(null);
              }
            }}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              showCorridors
                ? 'bg-white text-zinc-900 font-medium shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Risk Areas
          </button>

          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              showSensors
                ? 'bg-white text-zinc-900 font-medium shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Sensors
          </button>

          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              showReports
                ? 'bg-white text-zinc-900 font-medium shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Citizen Reports
          </button>

        </div>
      </div>

      {/* Main Map */}
      <div className="relative flex-1 w-full min-h-[440px] max-h-[640px] overflow-hidden bg-[#fafaf9]">

        <div
          ref={mapContainerRef}
          className="w-full h-full z-0"
        />

        {/* City Filters */}
        <div className="absolute top-3 left-4 z-20 flex items-center gap-1 bg-white/95 border border-zinc-200/80 rounded-lg p-1 shadow-2xs backdrop-blur-xs text-[11px]">

          <button
            onClick={() => handleCityFilter('all')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeCityFilter === 'all'
                ? 'bg-zinc-900 text-white font-medium'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Cities
          </button>

          <button
            onClick={() => handleCityFilter('pune')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeCityFilter === 'pune'
                ? 'bg-zinc-900 text-white font-medium'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Pune Area
          </button>

          <button
            onClick={() => handleCityFilter('delhi')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeCityFilter === 'delhi'
                ? 'bg-zinc-900 text-white font-medium'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Delhi NCR
          </button>

          <button
            onClick={() => handleCityFilter('mumbai')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeCityFilter === 'mumbai'
                ? 'bg-zinc-900 text-white font-medium'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Mumbai
          </button>

        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-3 right-4 z-20 flex flex-col gap-0.5 bg-white border border-zinc-200/80 rounded-lg shadow-2xs p-0.5">

          <button
            onClick={handleZoomIn}
            className="p-1 text-zinc-500 hover:text-zinc-900 rounded transition-colors"
            title="Zoom In"
          >
            <Maximize2 className="w-3 h-3" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-1 text-zinc-500 hover:text-zinc-900 rounded transition-colors"
            title="Zoom Out"
          >
            <Minimize2 className="w-3 h-3" />
          </button>

        </div>
      </div>

      {/* Selected Risk Area */}
      {selectedCorridor && (
        <div className="px-5 py-3.5 bg-white border-t border-zinc-100 z-10">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>
              <div className="flex items-center gap-2 text-xs">

                <span className="font-semibold text-zinc-900">
                  {selectedCorridor.name}
                </span>

                <span className="text-zinc-300">·</span>

                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    selectedCorridor.risk === 'CRITICAL'
                      ? 'text-rose-700 bg-rose-50'
                      : 'text-amber-700 bg-amber-50'
                  }`}
                >
                  Risk:{' '}
                  {selectedCorridor.risk === 'CRITICAL'
                    ? 'Critical'
                    : 'High'}
                </span>

                <span className="text-zinc-300">·</span>

                <span className="text-[11px] text-zinc-500">
                  {selectedCorridor.city}
                </span>

              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1.5">

                <div>
                  Area type:{' '}
                  <span className="font-medium text-zinc-800">
                    Industrial Risk Area
                  </span>
                </div>

                <div>
                  Status:{' '}
                  <span className="font-medium text-zinc-800">
                    Active
                  </span>
                </div>

                <div>
                  Monitoring:{' '}
                  <span className="font-medium text-zinc-800">
                    AI + Sensors
                  </span>
                </div>

              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCorridorId(null);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Clear
            </button>

          </div>
        </div>
      )}

      {/* Selected Hotspot Intelligence Drawer */}
      {!selectedCorridor && selectedHotspot && (
        <div className="px-5 py-3.5 bg-white border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">

          <div className="flex-1 min-w-0">

            <div className="flex items-center gap-2 text-xs">

              <span className="font-semibold text-zinc-900 truncate">
                {selectedHotspot.name === 'Pune Industrial Corridor'
                  ? 'Pune Industrial Area'
                  : selectedHotspot.name}
              </span>

              <span className="text-zinc-300">·</span>

              <span
                className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                  selectedHotspot.risk === 'CRITICAL'
                    ? 'text-rose-700 bg-rose-50'
                    : 'text-amber-700 bg-amber-50'
                }`}
              >
                Risk:{' '}
                {selectedHotspot.risk === 'CRITICAL'
                  ? 'Critical'
                  : selectedHotspot.risk === 'HIGH'
                  ? 'High'
                  : 'Moderate'}
              </span>

              <span className="text-zinc-300 hidden sm:inline">
                ·
              </span>

              <span className="text-zinc-400 text-[11px] hidden sm:inline font-mono">
                Detected: {selectedHotspot.detectedAgo}
              </span>

            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1">

              <div>
                AQI:{' '}
                <span className="font-mono font-semibold text-zinc-900">
                  {selectedHotspot.aqi}
                </span>
              </div>

              <div>
                PM2.5:{' '}
                <span className="font-mono font-medium text-zinc-800">
                  148 µg/m³
                </span>
              </div>

              <div>
                Severity:{' '}
                <span className="font-medium text-zinc-800">
                  {selectedHotspot.risk === 'CRITICAL'
                    ? 'Critical'
                    : selectedHotspot.risk === 'HIGH'
                    ? 'High'
                    : 'Moderate'}
                </span>
              </div>

              <div>
                Confidence:{' '}
                <span className="font-mono font-medium text-zinc-800">
                  {selectedHotspot.confidence}%
                </span>
              </div>

              <div className="text-zinc-600">
                Source:{' '}
                <span className="font-normal text-zinc-800">
                  Factory emissions
                </span>
              </div>

              <div className="text-zinc-600">
                Wind:{' '}
                <span className="font-normal text-zinc-800">
                  1.8 km/h (Low wind)
                </span>
              </div>

              <div className="text-zinc-600">
                Forecast:{' '}
                <span className="font-mono text-rose-700 font-medium">
                  +38% (next 6h)
                </span>
              </div>

            </div>
          </div>

          {onViewIntelligence && (
            <button
              onClick={() =>
                onViewIntelligence(selectedHotspot.id)
              }
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-medium transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

        </div>
      )}
    </div>
  );
};
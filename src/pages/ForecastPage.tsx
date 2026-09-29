import React, { useEffect, useState } from 'react';
import { fetchForecast, fetchForecastCities } from '../services/api';
import { CityForecast } from '../types';
import { PredictionChart } from '../components/charts/PredictionChart';
import { Sliders } from 'lucide-react';

export const ForecastPage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('pune');
  const [forecast, setForecast] = useState<CityForecast | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>(['pune', 'delhi', 'mumbai', 'ahmedabad']);
  const [sensitivity, setSensitivity] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetchForecastCities();
        if (res.availableCities.length > 0) {
          setAvailableCities(res.availableCities);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCities();
  }, []);

  useEffect(() => {
    async function loadForecastData() {
      try {
        setIsLoading(true);
        const res = await fetchForecast(selectedCity, sensitivity);
        setForecast(res.forecast);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadForecastData();
  }, [selectedCity, sensitivity]);

  // Simplify drivers display text
  const simpleDrivers = [
    { name: 'Industrial Activity', impact: 'HIGH', detail: 'Night shifts starting factory boiler cycles' },
    { name: 'Low Wind', impact: 'HIGH', detail: 'Wind speed under 2 km/h, keeping smoke near ground' },
    { name: 'Cold Evening Air', impact: 'MEDIUM', detail: 'Cooler evening air keeps smoke trapped close to the surface' },
    { name: 'Satellite Smoke Plume', impact: 'MEDIUM', detail: 'Satellite image shows smoke moving southeast' },
    { name: 'Past Trends', impact: 'LOW', detail: 'Normal pattern for this weekday and season' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header & City Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Predictions
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mt-0.5">
            Air Quality Forecast
          </h2>
        </div>

        {/* City Segmented Control */}
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
          {availableCities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1 rounded-md capitalize transition-colors ${
                selectedCity.toLowerCase() === city.toLowerCase()
                  ? 'bg-white text-zinc-900 font-medium shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Demo Label */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 font-normal">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        <span className="text-zinc-600 font-medium">Demo prediction — not live environmental data.</span>
        <span className="text-zinc-300 hidden sm:inline">·</span>
        <span className="hidden sm:inline">Air quality may get worse over the next 6 hours.</span>
      </div>

      {isLoading && !forecast ? (
        <div className="p-12 text-center text-xs text-zinc-400 font-mono">
          Loading forecast...
        </div>
      ) : forecast ? (
        <div className="space-y-8">
          {/* Main Key Statistics: Current AQI, Expected Change, Next 6 Hours */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Current AQI
              </div>
              <div className="text-3xl font-semibold font-mono text-zinc-900 mt-1 tabular-nums">
                {forecast.currentAqi}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-normal">
                {forecast.cityName}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Expected Change
              </div>
              <div className="text-3xl font-semibold font-mono text-rose-700 mt-1 tabular-nums">
                +{forecast.spikeForecastPercentage}%
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-normal">
                Next 6 Hours
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Main Reason
              </div>
              <div className="text-sm font-medium text-zinc-800 mt-2 truncate">
                Industrial Activity
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-normal">
                Combined with low wind
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Confidence
              </div>
              <div className="text-sm font-mono text-zinc-800 mt-2 font-medium">
                High (92%)
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-normal">
                Based on weather & sensors
              </div>
            </div>
          </section>

          {/* Main Forecast Chart: Now: 172 · 2h: 188 · 4h: 221 · 6h: 258 */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-2">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Next 6 Hours Forecast
                </h3>
                <p className="text-[11px] text-zinc-500 font-normal">
                  Now: 172 · 2h: 188 · 4h: 221 · 6h: 258
                </p>
              </div>

              {/* Sensitivity control */}
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                <Sliders className="w-3 h-3 text-zinc-400" />
                <span>Wind Calm:</span>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-16 accent-zinc-800 cursor-pointer"
                />
                <span className="font-semibold">{sensitivity.toFixed(1)}x</span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="py-2">
              <PredictionChart
                data={forecast.hourlyProjections}
                currentAqi={forecast.currentAqi}
                height={220}
              />
            </div>
          </section>

          {/* Main Reasons */}
          <section className="space-y-3">
            <div className="border-b border-zinc-200/80 pb-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Main Reasons
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {simpleDrivers.map((driver) => (
                <div
                  key={driver.name}
                  className="p-3.5 rounded-lg border border-zinc-200/80 bg-white space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-900">{driver.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        driver.impact === 'HIGH'
                          ? 'text-rose-700 bg-rose-50'
                          : driver.impact === 'MEDIUM'
                          ? 'text-amber-800 bg-amber-50'
                          : 'text-zinc-600 bg-zinc-100'
                      }`}
                    >
                      {driver.impact === 'HIGH' ? 'High Impact' : driver.impact === 'MEDIUM' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-normal">
                    {driver.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Advisory */}
          <div className="p-4 bg-zinc-50 rounded-lg text-xs text-zinc-600 flex items-baseline gap-2 font-normal leading-relaxed">
            <span className="font-medium text-zinc-900 shrink-0">Summary:</span>
            <span>Air quality is expected to decline by +38% over the next 6 hours. People sensitive to pollution should consider staying indoors.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { fetchFederatedNetwork, triggerFederatedRound } from '../services/api';
import { FederatedCityNode, FederatedModelUpdate } from '../types';
import { RefreshCw, Lock } from 'lucide-react';

export const FederatedNetworkPage: React.FC = () => {
  const [networkData, setNetworkData] = useState<{
    connectedCitiesCount: number;
    sharedModelsCount: number;
    totalModelUpdates: number;
    privacyGuarantee: string;
    algorithm: string;
    coreTenet: string;
    cities: FederatedCityNode[];
    recentUpdates: FederatedModelUpdate[];
  } | null>(null);

  const [isAggregating, setIsAggregating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNetwork();
  }, []);

  const loadNetwork = async () => {
    try {
      setIsLoading(true);
      const data = await fetchFederatedNetwork();
      setNetworkData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAggregation = async () => {
    try {
      setIsAggregating(true);
      await triggerFederatedRound();
      await loadNetwork();
    } catch (err: any) {
      alert('Sync failed: ' + err.message);
    } finally {
      setIsAggregating(false);
    }
  };

  const primaryCities = [
    'Mumbai',
    'Pune',
    'Ahmedabad',
    'Delhi',
    'Bengaluru',
    'Hyderabad',
    'Chennai',
    'Kolkata',
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header with Simple English */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Privacy-Safe AI
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mt-0.5">
            How Cities Share AI
          </h2>
        </div>

        <button
          onClick={handleRunAggregation}
          disabled={isAggregating}
          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isAggregating ? 'animate-spin' : ''}`} />
          <span>{isAggregating ? 'Syncing...' : 'Sync Models Now'}</span>
        </button>
      </div>

      {/* Clear simple explanation box requested by user */}
      <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-2 text-xs text-zinc-700">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-zinc-600 shrink-0" />
          <span className="font-semibold text-zinc-900">
            Raw data stays in the city.
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-zinc-600 font-normal">
          <div>
            • <strong>Local Training:</strong> Each city trains its own AI model using its local sensor data.
          </div>
          <div>
            • <strong>Only Updates Shared:</strong> Only mathematical model updates are sent to the central system.
          </div>
          <div>
            • <strong>Privacy Protected:</strong> Cities improve their models together without sharing private citizen data.
          </div>
        </div>
      </div>

      {/* 3 Metric Figures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Connected Cities
          </div>
          <div className="text-2xl font-semibold font-mono text-zinc-900 mt-1 tabular-nums">
            {networkData?.connectedCitiesCount ?? 12}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5 font-normal">
            Cities participating
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Shared AI Models
          </div>
          <div className="text-2xl font-semibold font-mono text-zinc-900 mt-1 tabular-nums">
            0{networkData?.sharedModelsCount ?? 8}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5 font-normal">
            Active prediction models
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Model Updates
          </div>
          <div className="text-2xl font-semibold font-mono text-zinc-900 mt-1 tabular-nums">
            {networkData?.totalModelUpdates?.toLocaleString() ?? '1,284'}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5 font-normal">
            Updates combined safely
          </div>
        </div>
      </div>

      {/* Visual Flow with Simple English:
          Cities ↓ Local Training ↓ Model Updates ↓ Combine AI Models ↓ Use Local Model
      */}
      <section className="space-y-3">
        <div className="border-b border-zinc-200/80 pb-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            How It Works
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1 text-center">
          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg">
            <div className="text-xs font-semibold text-zinc-900">1. Cities</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Collect local air data</div>
          </div>
          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg">
            <div className="text-xs font-semibold text-zinc-900">2. Local Training</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Train AI on device</div>
          </div>
          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg">
            <div className="text-xs font-semibold text-zinc-900">3. Model Updates</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Send weight changes</div>
          </div>
          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg">
            <div className="text-xs font-semibold text-zinc-900">4. Combine Models</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Average AI updates</div>
          </div>
          <div className="p-3 bg-zinc-900 text-white rounded-lg">
            <div className="text-xs font-semibold">5. Improved Model</div>
            <div className="text-[10px] text-zinc-300 mt-0.5">Better forecast in each city</div>
          </div>
        </div>
      </section>

      {/* Network Topology: Cities around center Shared AI Model */}
      <section className="space-y-3">
        <div className="border-b border-zinc-200/80 pb-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Connected Cities Map
          </h3>
        </div>

        <div className="h-64 bg-zinc-50 border border-zinc-200/80 rounded-xl relative overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 600 250" className="w-full h-full">
            {/* Center Shared Model */}
            <circle cx="300" cy="125" r="44" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
            <text x="300" y="122" fontSize="9" fontWeight="600" fill="#18181b" textAnchor="middle">
              SHARED
            </text>
            <text x="300" y="134" fontSize="9" fontWeight="600" fill="#18181b" textAnchor="middle">
              AI MODEL
            </text>

            {/* Orbiting cities */}
            {primaryCities.map((city, idx) => {
              const angle = (idx / primaryCities.length) * 2 * Math.PI;
              const radius = 95;
              const x = 300 + Math.cos(angle) * radius;
              const y = 125 + Math.sin(angle) * radius;

              return (
                <g key={city}>
                  <line
                    x1="300"
                    y1="125"
                    x2={x}
                    y2={y}
                    stroke="#e4e4e7"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <circle cx={x} cy={y} r="18" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1" />
                  <text
                    x={x}
                    y={y + 3}
                    fontSize="8"
                    fontWeight="500"
                    fill="#3f3f46"
                    textAnchor="middle"
                  >
                    {city}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* Model Updates Table with clear headers */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Recent Model Updates
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">
            {networkData?.recentUpdates?.length || 0} Total
          </span>
        </div>

        <div className="divide-y divide-zinc-100 text-xs">
          {networkData?.recentUpdates?.map((upd) => (
            <div key={upd.id} className="py-2.5 flex items-center justify-between gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">#{upd.roundNumber}</span>
                <span className="text-zinc-900 font-sans font-medium">{upd.participatingCity}</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-500">
                <span>Update magnitude: {upd.gradientNorm}</span>
                <span>Accuracy gain: +{upd.lossReduction}</span>
                <span className="text-zinc-400">{upd.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

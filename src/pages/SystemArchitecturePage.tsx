import React from 'react';

export const SystemArchitecturePage: React.FC = () => {
  const tiers = [
    {
      step: '01',
      title: 'DATA SOURCES',
      subtitle: 'Where information comes from',
      items: [
        'Citizen Reports (Photos from the public)',
        'Sensors (Ground air monitors for PM2.5 and gases)',
        'Satellite Data (Space imagery of smoke and dust)',
        'Weather Data (Wind direction, temperature, and calm air)',
        'Past Trends (Historical air quality records)',
      ],
    },
    {
      step: '02',
      title: 'COLLECT DATA',
      subtitle: 'Gathering and organizing readings in real time',
      items: [
        'Live Data Ingestion (Fast streaming from all cities)',
        'Map Grid Indexing (Organizing data by city zone)',
        'Data Cleaning (Filling missing sensor gaps automatically)',
      ],
    },
    {
      step: '03',
      title: 'AI ANALYSIS',
      subtitle: 'Understanding what the data means',
      items: [
        'Computer Vision (Recognizes smoke and fire in photos)',
        'Data Fusion (Combines ground sensors with satellite images)',
        'Unusual Activity Detection (Spots sudden pollution spikes)',
      ],
    },
    {
      step: '04',
      title: 'PREDICTION & SHARED AI',
      subtitle: 'Forecasting pollution without sharing private data',
      items: [
        'GNN + LSTM (AI models that follow wind patterns over time)',
        'Federated Learning (Cities improve AI together without sharing raw data)',
        'Clear Explanations (Explains which factors caused the pollution)',
      ],
    },
    {
      step: '05',
      title: 'ALERTS & ACTION',
      subtitle: 'Helping teams respond quickly',
      items: [
        'Pollution Hotspots (Shows problem areas on the map)',
        'Forecasts (Warns about spikes up to 6 hours ahead)',
        'Risk Levels (Ranks areas from Low to Critical)',
        'Field Alerts (Sends notifications directly to inspection teams)',
      ],
    },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
          System Overview
        </h2>
        <p className="text-xs text-zinc-500 font-normal mt-0.5">
          How AEROVEDA turns raw sensor readings and photos into early warnings and field action.
        </p>
      </div>

      {/* Core Operational Loop */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200/80 bg-zinc-50 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900">How it works:</span>
          <span className="font-mono text-zinc-600">DATA → AI → INSIGHT → ACTION</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="font-semibold text-zinc-900">For users:</span>
          <span className="font-mono text-zinc-600">SEE → UNDERSTAND → FORECAST → ACT</span>
        </div>
      </div>

      {/* Tiered Architecture Flow */}
      <div className="space-y-4">
        {tiers.map((tier, idx) => (
          <React.Fragment key={tier.title}>
            <div className="p-5 rounded-xl border border-zinc-200/80 bg-white space-y-3 shadow-2xs">
              <div className="flex items-baseline justify-between border-b border-zinc-100 pb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-mono font-medium text-zinc-400">
                    {tier.step}
                  </span>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    {tier.title}
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400 font-normal">
                  {tier.subtitle}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {tier.items.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded bg-zinc-50 border border-zinc-200/60 text-zinc-700 font-normal"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {idx < tiers.length - 1 && (
              <div className="flex justify-center text-zinc-300 text-sm font-mono select-none">
                ↓
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

import React from 'react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-zinc-50 border-b border-zinc-200/60 px-8 py-1.5 text-[11px] text-zinc-500 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-medium text-zinc-700">Demo Mode</span>
        <span className="text-zinc-300">·</span>
        <span>Simulated air quality data for demonstration purposes. Not official government records.</span>
      </div>
      <div className="hidden lg:inline text-zinc-400 font-mono text-[10px]">
        AEROVEDA Demo
      </div>
    </div>
  );
};

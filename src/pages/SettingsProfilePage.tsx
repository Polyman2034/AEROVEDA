import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resetDatabase } from '../services/api';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export const SettingsProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [criticalThreshold, setCriticalThreshold] = useState(300);
  const [highThreshold, setHighThreshold] = useState(200);
  const [samplingRate, setSamplingRate] = useState('5 minutes');
  const [federatedCadence, setFederatedCadence] = useState('Hourly');
  const [isResetting, setIsResetting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = async () => {
    if (confirm('Reset demo data to default?')) {
      setIsResetting(true);
      try {
        await resetDatabase();
        window.location.reload();
      } catch (err: any) {
        alert('Reset failed: ' + err.message);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
          Settings & Profile
        </h2>
        <p className="text-xs text-zinc-500 font-normal mt-0.5">
          Manage your account information and set when automatic alerts should be sent.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-zinc-900 text-white text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Profile Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Your Account
        </h3>

        <div className="p-5 rounded-xl border border-zinc-200/80 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[11px] text-zinc-400">Name</div>
            <div className="font-medium text-zinc-900 mt-0.5">{user?.name}</div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-400">Email Address</div>
            <div className="font-mono text-zinc-900 mt-0.5">{user?.email}</div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-400">Department</div>
            <div className="text-zinc-700 mt-0.5">{user?.department || 'Pollution Control'}</div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-400">Area</div>
            <div className="text-zinc-700 mt-0.5">{user?.jurisdiction}</div>
          </div>
        </div>
      </section>

      {/* Thresholds Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="border-b border-zinc-200/80 pb-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Alert Triggers
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">
              Critical Alert Level (AQI)
            </label>
            <input
              type="number"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              min={250}
              max={500}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-xs font-mono text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            />
            <span className="text-[11px] text-zinc-400">Automatically creates an emergency alert</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">
              High Risk Level (AQI)
            </label>
            <input
              type="number"
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              min={150}
              max={300}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-xs font-mono text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            />
            <span className="text-[11px] text-zinc-400">Notifies the inspection team to check the area</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">
              Sensor Check Rate
            </label>
            <select
              value={samplingRate}
              onChange={(e) => setSamplingRate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-xs font-medium text-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            >
              <option value="1 minute">Every 1 minute (Fast)</option>
              <option value="5 minutes">Every 5 minutes (Normal)</option>
              <option value="15 minutes">Every 15 minutes (Battery saving)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">
              How Often Cities Share AI
            </label>
            <select
              value={federatedCadence}
              onChange={(e) => setFederatedCadence(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-xs font-medium text-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            >
              <option value="Every 30 mins">Every 30 minutes</option>
              <option value="Hourly">Hourly (Recommended)</option>
              <option value="Daily">Once a day</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
        >
          Save Settings
        </button>
      </form>

      {/* Database Maintenance & Sign Out */}
      <section className="pt-4 border-t border-zinc-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div>
            <div className="text-xs font-medium text-zinc-900">Reset Demo Data</div>
            <div className="text-[11px] text-zinc-400">Restore all sample areas and alerts back to default</div>
          </div>
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-3 py-1.5 bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-zinc-100">
          <div>
            <div className="text-xs font-medium text-zinc-900">Sign Out</div>
            <div className="text-[11px] text-zinc-400">Sign out of this session</div>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-md text-xs font-medium transition-colors self-start sm:self-auto"
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
};

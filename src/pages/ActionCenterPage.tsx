import React, { useEffect, useState } from 'react';
import { fetchAlerts, updateAlertStatus } from '../services/api';
import { EnvironmentalAlert, AlertStatus } from '../types';

const WORKFLOW_STEPS: AlertStatus[] = [
  'DETECTED',
  'VALIDATED',
  'ALERT_SENT',
  'ACKNOWLEDGED',
  'INVESTIGATING',
  'RESOLVED',
];

// Simple, clear labels requested by the user:
// Detected, Checked, Alert Sent, Accepted, Under Review, Resolved
const STATUS_LABELS: Record<AlertStatus, string> = {
  DETECTED: 'Detected',
  VALIDATED: 'Checked',
  ALERT_SENT: 'Alert Sent',
  ACKNOWLEDGED: 'Accepted',
  INVESTIGATING: 'Under Review',
  RESOLVED: 'Resolved',
};

export const ActionCenterPage: React.FC = () => {
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [counts, setCounts] = useState({
    critical: '03',
    high: '08',
    moderate: '16',
    total: 27,
  });
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await fetchAlerts();
      setAlerts(res.alerts);
      setCounts(res.counts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (alertId: string, nextStatus: AlertStatus) => {
    try {
      setUpdatingId(alertId);

      // Optimistic update
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: nextStatus, updatedAt: new Date().toISOString() } : a))
      );

      const res = await updateAlertStatus(
        alertId,
        nextStatus,
        `Status updated to ${STATUS_LABELS[nextStatus]}`
      );

      setAlerts((prev) => prev.map((a) => (a.id === alertId ? res.alert : a)));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
      loadAlerts();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'ALL') return true;
    return a.risk === activeFilter;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header & Status Indicator Pills: High Priority, Medium Priority, Low Priority */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Field Actions
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mt-0.5">
            Alerts
          </h2>
        </div>

        {/* Semantic Priority Filters */}
        <div className="flex items-center gap-3 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter(activeFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              activeFilter === 'CRITICAL' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>High Priority</span>
            <span className="font-mono text-[11px] text-zinc-400">{counts.critical}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'HIGH' ? 'ALL' : 'HIGH')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              activeFilter === 'HIGH' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Medium Priority</span>
            <span className="font-mono text-[11px] text-zinc-400">{counts.high}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'MODERATE' ? 'ALL' : 'MODERATE')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              activeFilter === 'MODERATE' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Low Priority</span>
            <span className="font-mono text-[11px] text-zinc-400">{counts.moderate}</span>
          </button>
        </div>
      </div>

      {/* Clean Table / List of Alerts */}
      <div className="space-y-4">
        {isLoading && alerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400 font-mono">
            Loading alerts...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            No alerts for this priority level.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/80">
            {filteredAlerts.map((alert) => {
              const currentStepIdx = WORKFLOW_STEPS.indexOf(alert.status);
              const isCritical = alert.risk === 'CRITICAL';
              const isHigh = alert.risk === 'HIGH';

              return (
                <div key={alert.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                  {/* Line 1: Where? & What happened? */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isCritical
                            ? 'bg-rose-500'
                            : isHigh
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                        {alert.locationName}
                      </h3>
                      <span className="text-zinc-300">·</span>
                      <span className="text-xs text-zinc-500 font-normal">
                        {alert.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                      <span>Expected AQI: <strong className="text-zinc-900 font-medium">{alert.predictedAqi}</strong></span>
                      <span>·</span>
                      <span>Duration: {alert.expectedDurationHours}</span>
                    </div>
                  </div>

                  {/* Line 2: What should be done? */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-600 font-normal">
                    <div>
                      What should be done? <span className="font-medium text-zinc-900">{alert.suggestedResponse}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Team: {alert.assignedAuthority}
                    </div>
                  </div>

                  {/* Line 3: Current Status Stepper */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Current Status: <strong className="text-zinc-800 font-medium">{STATUS_LABELS[alert.status]}</strong></span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-1 bg-zinc-50 p-1 rounded-lg border border-zinc-200/60">
                      {WORKFLOW_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <button
                            key={step}
                            onClick={() => handleStatusChange(alert.id, step)}
                            disabled={updatingId === alert.id}
                            className={`px-2 py-1.5 rounded text-[11px] font-medium transition-colors text-center truncate ${
                              isCurrent
                                ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                                : isCompleted
                                ? 'text-zinc-700 hover:bg-zinc-200/60'
                                : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            {STATUS_LABELS[step]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

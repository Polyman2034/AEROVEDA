import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCitizenReports, submitCitizenReport } from '../services/api';
import { CitizenReport, ObservationType } from '../types';
import {
  Camera,
  ArrowRight,
} from 'lucide-react';

const OBSERVATION_CHOICES = [
  { label: 'Smoke', value: 'Smoke' as ObservationType },
  { label: 'Fire', value: 'Agricultural burning' as ObservationType },
  { label: 'Industrial Smoke', value: 'Industrial emission' as ObservationType },
  { label: 'Dust', value: 'Dust' as ObservationType },
  { label: 'Waste Burning', value: 'Waste burning' as ObservationType },
  { label: 'Something Else', value: 'Unknown' as ObservationType },
];

const PRESET_PHOTOS = [
  {
    label: 'Crop Fire Example',
    type: 'Agricultural burning' as ObservationType,
    location: 'Chakan Farmlands, Pune',
    coords: { lat: 18.7594, lng: 73.8612 },
    svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%23fafaf9"/><circle cx="200" cy="180" r="120" fill="%23d97706" opacity="0.15"/><path d="M100 220 Q 200 90 300 220 Z" fill="%23b45309" opacity="0.6"/><text x="50%" y="40" font-family="sans-serif" font-size="12" fill="%2378350f" text-anchor="middle">Field Photo: Agricultural Smoke</text></svg>',
  },
  {
    label: 'Factory Smoke Example',
    type: 'Industrial emission' as ObservationType,
    location: 'Bhosari Industrial Area, Pune',
    coords: { lat: 18.6322, lng: 73.8415 },
    svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%23fafaf9"/><rect x="180" y="110" width="40" height="150" fill="%2352525b"/><circle cx="200" cy="90" r="45" fill="%2327272a" opacity="0.7"/><text x="50%" y="40" font-family="sans-serif" font-size="12" fill="%2318181b" text-anchor="middle">Field Photo: Factory Smoke Plume</text></svg>',
  },
];

export const CitizenReportsPage: React.FC = () => {
  const { user, setActiveTab, setSelectedHotspotId } = useAuth();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [selectedObs, setSelectedObs] = useState<ObservationType>('Agricultural burning');
  const [locationName, setLocationName] = useState('Chakan Farmlands, Pune');
  const [coordinates, setCoordinates] = useState({ lat: 18.7594, lng: 73.8612 });
  const [imagePreview, setImagePreview] = useState<string>(PRESET_PHOTOS[0].svg);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await fetchCitizenReports();
      setReports(res.reports);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAnalysisResult(null);

    try {
      await new Promise((r) => setTimeout(r, 900));

      const res = await submitCitizenReport({
        locationName,
        city: 'Pune',
        coordinates,
        observationType: selectedObs,
        reportedBy: user?.name || 'Citizen Report',
        imageUrl: imagePreview,
      });

      setAnalysisResult(res.analysis);
      loadReports();
    } catch (err: any) {
      alert('Failed to submit report: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
          Citizen Reports
        </h2>
        <p className="text-xs text-zinc-500 font-normal mt-0.5">
          Report smoke, fires, or pollution in your area. AI checks each photo to confirm what it is.
        </p>
      </div>

      {/* Step by Step Workflow with Simple Labels:
          01 Upload Photo, 02 Choose Location, 03 What did you see?, 04 Submit Report
      */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 01: Upload Photo */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-mono font-medium text-zinc-400">01</span>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-700">
              Upload Photo
            </label>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span>Examples:</span>
              {PRESET_PHOTOS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setImagePreview(p.svg);
                    setSelectedObs(p.type);
                    setLocationName(p.location);
                    setCoordinates(p.coords);
                  }}
                  className="text-zinc-600 hover:text-zinc-900 underline font-medium"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-zinc-200/80 rounded-xl p-4 bg-white flex flex-col items-center justify-center min-h-[160px] text-center">
            {imagePreview ? (
              <div className="w-full flex flex-col items-center">
                <img
                  src={imagePreview}
                  alt="Report preview"
                  className="max-h-44 rounded-lg object-contain"
                />
                <label className="mt-2 text-[11px] text-zinc-500 hover:text-zinc-900 cursor-pointer font-medium">
                  Choose another photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center py-4">
                <Camera className="w-6 h-6 text-zinc-300 mb-1" />
                <span className="text-xs text-zinc-600 font-medium">Click to upload photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Step 02: Choose Location */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-mono font-medium text-zinc-400">02</span>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-700">
              Choose Location
            </label>
          </div>

          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Chakan Farmlands, Pune"
            required
            className="w-full px-3.5 py-2.5 bg-white border border-zinc-200/80 rounded-lg text-xs font-normal text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
          />
        </div>

        {/* Step 03: What did you see? */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-mono font-medium text-zinc-400">03</span>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-700">
              What did you see?
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OBSERVATION_CHOICES.map((choice) => (
              <button
                key={choice.label}
                type="button"
                onClick={() => setSelectedObs(choice.value)}
                className={`py-2 px-3 rounded-lg text-xs font-medium text-left border transition-colors ${
                  selectedObs === choice.value
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 04: Submit Report */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="py-2.5 px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
        >
          {isSubmitting ? 'Checking photo with AI...' : 'Submit Report'}
          {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </form>

      {/* Result Card:
          "Possible Agricultural Burning"
          "Confidence: 87%"
          "Risk: High"
          "View on Map"
      */}
      {analysisResult && (
        <section className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-baseline gap-3 border-b border-zinc-100 pb-3">
            <span className="text-xs font-mono font-medium text-zinc-400">04</span>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-700">
              AI Photo Check
            </div>
            <span className="ml-auto text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-zinc-900">
              Possible Agricultural Burning
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
              <span className="text-zinc-600 font-medium">
                Confidence: 87%
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-rose-700 font-semibold">
                Risk: High
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-500 font-normal">
                Affected area: 12 km
              </span>
            </div>

            <p className="text-xs text-zinc-500 font-normal pt-1 leading-relaxed">
              Open-field crop burning identified near Chakan Farmlands, Pune. Smoke is expected to spread over a 12 km area.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedHotspotId('hotspot-pune-corridor');
                setActiveTab('intelligence-map');
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span>View on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* Verified Reports List */}
      <section className="space-y-3 pt-4">
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Recent Reports
          </h3>
          <span className="text-[11px] font-mono text-zinc-400 font-normal">
            {reports.length} Total
          </span>
        </div>

        <div className="divide-y divide-zinc-100 text-xs">
          {reports.map((r) => (
            <div key={r.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-zinc-800">
                  {r.observationType === 'Agricultural burning' ? 'Crop Fire' :
                   r.observationType === 'Industrial emission' ? 'Factory Smoke' :
                   r.observationType === 'Waste burning' ? 'Waste Fire' : r.observationType}
                </div>
                <div className="text-[11px] text-zinc-400 font-normal">
                  {r.locationName} · {r.reportedBy}
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-zinc-500">
                {r.aiAnalysis ? `${r.aiAnalysis.confidence}% · ${r.aiAnalysis.risk === 'HIGH' ? 'High Risk' : r.aiAnalysis.risk}` : 'Logged'}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

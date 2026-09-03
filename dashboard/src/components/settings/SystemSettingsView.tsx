import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Sliders, 
  Video, 
  CheckCircle2, 
  ShieldCheck, 
  Database,
  Radio
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.75);
  const [modelVersion, setModelVersion] = useState<string>('YOLOv8n-Custom-UrbanEye-v2');
  const [detectPotholes, setDetectPotholes] = useState<boolean>(true);
  const [detectANPR, setDetectANPR] = useState<boolean>(true);
  const [detectWaterlogging, setDetectWaterlogging] = useState<boolean>(true);
  const [detectTraffic, setDetectTraffic] = useState<boolean>(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice('System & AI Detection Configuration updated successfully!');
    setTimeout(() => setSaveNotice(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <span>AI Perception Engine & Hardware Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure YOLO model inference weights, confidence thresholds, detector toggles & device edge parameters.
          </p>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Model Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm text-slate-100">AI Model & Neural Parameters</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Detection Confidence Threshold: {(confidenceThreshold * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0.4"
                max="0.95"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>40% (High Recall)</span>
                <span>95% (High Precision)</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Model Architecture & Weights</label>
              <select
                value={modelVersion}
                onChange={(e) => setModelVersion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="YOLOv8n-Custom-UrbanEye-v2">YOLOv8n-Custom-UrbanEye-v2 (FP16 Edge-Optimized)</option>
                <option value="YOLOv9-Dense-Municipal">YOLOv9-Dense-Municipal (High Resolution)</option>
                <option value="MobileNetV3-LowPower">MobileNetV3-LowPower (Smartphone Mode)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enabled Detectors Toggles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm text-slate-100">Enabled Detection Sub-Systems</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <span className="text-xs font-semibold text-slate-200">🕳️ Potholes & Surface Damage Detector</span>
              <input type="checkbox" checked={detectPotholes} onChange={() => setDetectPotholes(!detectPotholes)} className="rounded text-sky-500 w-4 h-4" />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <span className="text-xs font-semibold text-slate-200">🔍 ANPR Number Plate OCR Detector</span>
              <input type="checkbox" checked={detectANPR} onChange={() => setDetectANPR(!detectANPR)} className="rounded text-sky-500 w-4 h-4" />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <span className="text-xs font-semibold text-slate-200">💧 Waterlogging & Flood Level Detector</span>
              <input type="checkbox" checked={detectWaterlogging} onChange={() => setDetectWaterlogging(!detectWaterlogging)} className="rounded text-sky-500 w-4 h-4" />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <span className="text-xs font-semibold text-slate-200">🚦 Vehicle Counting & Traffic Classifier</span>
              <input type="checkbox" checked={detectTraffic} onChange={() => setDetectTraffic(!detectTraffic)} className="rounded text-sky-500 w-4 h-4" />
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 transition-all"
          >
            Apply Configuration Parameters
          </button>
        </div>
      </form>
    </div>
  );
};

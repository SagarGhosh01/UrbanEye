import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  TrendingUp, 
  Activity, 
  Volume2, 
  Cpu, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Zap,
  BarChart3,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AICommandHub: React.FC = () => {
  const [trafficData, setTrafficData] = useState<any>(null);
  const [roadHealth, setRoadHealth] = useState<any>(null);
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const backendUrl = 'http://' + (window.location.hostname || 'localhost') + ':8000';
      
      // 1. Predict Traffic Flow & Signal Timing
      const tRes = await fetch(`${backendUrl}/api/v1/ai/traffic/predict-flow?current_speed_kmh=24.2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car: 14, bus: 4, truck: 2, motorcycle: 11, auto_rickshaw: 6, pedestrian: 3 })
      });
      const tData = await tRes.json();
      setTrafficData(tData);

      // 2. Predict Road Health & Degradation Timeline
      const rRes = await fetch(`${backendUrl}/api/v1/ai/road/predict-health?waterlogging_present=false&daily_traffic_pcu=1650.0`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { dimensions: { width_cm: 38.0, length_cm: 45.0, depth_cm: 8.5, volume_litres: 11.2 } },
          { dimensions: { width_cm: 25.0, length_cm: 30.0, depth_cm: 5.0, volume_litres: 4.8 } }
        ])
      });
      const rData = await rRes.json();
      setRoadHealth(rData);

      // 3. AI Executive Digest & Speech Alert
      const aRes = await fetch(`${backendUrl}/api/v1/ai/assistant/generate-digest?event_type=POTHOLE&severity=CRITICAL&resolved_address=Sector+14+Main+Transit+Highway`, {
        method: 'POST'
      });
      const aData = await aRes.json();
      setDigest(aData);
    } catch (err) {
      console.error("Error fetching AI Insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const speakAlert = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <span>AI Autonomous Urban Perception & Predictive Analytics Hub</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2.5 py-0.5 rounded border border-purple-500/30 font-bold">
              NEURAL INFERENCE ONLINE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Markov predictive traffic control, pavement degradation forecasting, and natural language executive digests.
          </p>
        </div>
        <button
          onClick={fetchAIInsights}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center space-x-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh AI Predictions</span>
        </button>
      </div>

      {/* Grid of 3 Core AI Engines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Traffic Optimizer */}
        {trafficData && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>AI Traffic Signal & Flow Control</span>
                </span>
                <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold rounded border border-sky-500/30">
                  {trafficData.level_of_service}
                </span>
              </div>

              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Passenger Car Units (PCU):</span>
                  <span className="font-bold text-sky-400 text-sm">{trafficData.pcu_count} PCU/hr</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">15-Min Congestion Forecast:</span>
                  <span className="font-bold text-amber-400">{trafficData.predictive_15m_forecast?.predicted_pcu} PCU</span>
                </div>
                <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl space-y-1">
                  <span className="text-[10px] text-sky-300 font-bold block font-sans">AI ADAPTIVE SIGNAL RECOMMENDATION</span>
                  <p className="text-slate-100 font-bold">{trafficData.ai_signal_recommendation?.action}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Road Health Forecaster */}
        {roadHealth && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>AI Road Health & Structural Failure Forecast</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded border border-emerald-500/30">
                  RHI: {roadHealth.road_health_index}/100
                </span>
              </div>

              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Est. Days to Road Failure:</span>
                  <span className="font-bold text-rose-400 text-sm">{roadHealth.predictive_decay_forecast?.estimated_days_to_structural_failure} Days</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Predicted Collapse Date:</span>
                  <span className="font-bold text-slate-200">{roadHealth.predictive_decay_forecast?.predicted_failure_date}</span>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                  <span className="text-[10px] text-emerald-300 font-bold block font-sans">RECOMMENDED ASPHALT DISPATCH</span>
                  <p className="text-slate-100 font-bold">{roadHealth.maintenance_recommendation?.recommended_patch_asphalt_tons} Tons Patch Material</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. AI Assistant & Speech Synthesis */}
        {digest && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Executive Digest & Audio Alert</span>
                </span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold rounded border border-purple-500/30">
                  SPEECH ENGINE
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-purple-300 font-bold block font-sans">EXECUTIVE INCIDENT DIGEST</span>
                  <p className="text-slate-200 leading-relaxed">{digest.executive_summary_markdown}</p>
                </div>
                
                <button
                  onClick={() => speakAlert(digest.driver_audio_speech_text)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 Play Driver Audio Speech Alert</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

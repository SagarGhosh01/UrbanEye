import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Wrench, 
  Bus, 
  ShieldAlert, 
  Calendar,
  Activity,
  Droplet,
  Users
} from 'lucide-react';
import { RoadConditionBoard } from './RoadConditionBoard';
import { BandwidthSavingsGauge } from './BandwidthSavingsGauge';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>Comprehensive Citywide Perception Analytics</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 font-mono px-2.5 py-0.5 rounded border border-sky-500/30 font-bold">
              HISTORICAL TRENDS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-sectional metrics for municipal road health, traffic flow, fleet bandwidth efficiency & safety incidents.
          </p>
        </div>
      </div>

      {/* 4 Analytics Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Road Analytics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>1. Road & Surface Infrastructure Analytics</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Potholes Detected (Last 30 Days)</span>
              <span className="font-mono font-bold text-rose-400 text-sm">186 Potholes</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Road Surface Damage Trend</span>
              <span className="font-mono font-bold text-amber-400 text-sm">-14.2% (Improving)</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Waterlogging Frequency</span>
              <span className="font-mono font-bold text-blue-400 text-sm">4 Wards Flagged</span>
            </div>
          </div>
        </div>

        {/* 2. Traffic Analytics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>2. Traffic Density & Congestion Analytics</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Total Vehicles Counted Today</span>
              <span className="font-mono font-bold text-sky-400 text-sm">3,414 Vehicles</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Average Bus Corridor Speed</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">28.4 km/h</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Peak Hour Bottlenecks</span>
              <span className="font-mono font-bold text-rose-400 text-sm">3 Critical Hotspots</span>
            </div>
          </div>
        </div>

        {/* 3. Fleet Analytics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Bus className="w-4 h-4 text-emerald-400" />
            <span>3. Mobile Sensor Fleet & Bandwidth Analytics</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Events Per Bus (Avg)</span>
              <span className="font-mono font-bold text-purple-400 text-sm">7.8 Events / Bus</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Metropolitan Spatial Coverage</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">82% City Coverage</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Edge Bandwidth Reduction</span>
              <span className="font-mono font-bold text-sky-400 text-sm">99.1% Saved</span>
            </div>
          </div>
        </div>

        {/* 4. Safety Analytics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>4. Pedestrian & Safety Incident Analytics</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Critical Incidents Logged</span>
              <span className="font-mono font-bold text-rose-400 text-sm">7 Active</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Near-Miss Pedestrian Alerts</span>
              <span className="font-mono font-bold text-amber-400 text-sm">14 Detections</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">ANPR Hotlist Matches</span>
              <span className="font-mono font-bold text-purple-400 text-sm">2 Plate Scans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

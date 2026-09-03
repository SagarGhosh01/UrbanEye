import React, { useState } from 'react';
import { 
  Map, 
  Layers, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  Bus, 
  Droplet, 
  TrendingUp, 
  Wrench, 
  Users, 
  Search,
  Eye
} from 'lucide-react';
import { GISMap } from './GISMap';
import { BusTelemetry, UrbanEvent, RoadSegment, HeatmapPoint } from '../../types';

interface GISMapViewProps {
  buses: BusTelemetry[];
  events: UrbanEvent[];
  roadSegments: RoadSegment[];
  heatmaps: HeatmapPoint[];
  selectedBusId: string;
  onBusSelect: (id: string) => void;
  onEventClick: (ev: UrbanEvent) => void;
}

export const GISMapView: React.FC<GISMapViewProps> = ({
  buses,
  events,
  roadSegments,
  heatmaps,
  selectedBusId,
  onBusSelect,
  onEventClick
}) => {
  // Layer toggles
  const [showBuses, setShowBuses] = useState<boolean>(true);
  const [showPotholes, setShowPotholes] = useState<boolean>(true);
  const [showRoadDamage, setShowRoadDamage] = useState<boolean>(true);
  const [showWaterlogging, setShowWaterlogging] = useState<boolean>(true);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showPedestrians, setShowPedestrians] = useState<boolean>(true);
  const [showSigns, setShowSigns] = useState<boolean>(true);

  // Severity filters
  const [sevCritical, setSevCritical] = useState<boolean>(true);
  const [sevHigh, setSevHigh] = useState<boolean>(true);
  const [sevMedium, setSevMedium] = useState<boolean>(true);
  const [sevLow, setSevLow] = useState<boolean>(true);

  // Time filter
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Controls & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-bold text-slate-100">GIS City Telemetry Layers & Filtering Console</h2>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === 'today' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === '7days' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === '30days' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Map Layers Toggles Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-bold text-[11px] mr-1">MAP LAYERS:</span>
          
          <label className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors ${
            showBuses ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <input type="checkbox" checked={showBuses} onChange={() => setShowBuses(!showBuses)} className="hidden" />
            <span>🚌 Buses ({buses.length || 24})</span>
          </label>

          <label className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors ${
            showPotholes ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <input type="checkbox" checked={showPotholes} onChange={() => setShowPotholes(!showPotholes)} className="hidden" />
            <span>🕳️ Potholes</span>
          </label>

          <label className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors ${
            showRoadDamage ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <input type="checkbox" checked={showRoadDamage} onChange={() => setShowRoadDamage(!showRoadDamage)} className="hidden" />
            <span>🚧 Road Damage</span>
          </label>

          <label className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors ${
            showWaterlogging ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <input type="checkbox" checked={showWaterlogging} onChange={() => setShowWaterlogging(!showWaterlogging)} className="hidden" />
            <span>💧 Waterlogging</span>
          </label>

          <label className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors ${
            showTraffic ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <input type="checkbox" checked={showTraffic} onChange={() => setShowTraffic(!showTraffic)} className="hidden" />
            <span>🚦 Traffic</span>
          </label>

          <label className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors ${
            showIncidents ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <input type="checkbox" checked={showIncidents} onChange={() => setShowIncidents(!showIncidents)} className="hidden" />
            <span>🚨 Incidents</span>
          </label>

          <label className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors ${
            showPedestrians ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <input type="checkbox" checked={showPedestrians} onChange={() => setShowPedestrians(!showPedestrians)} className="hidden" />
            <span>🚶 Pedestrians</span>
          </label>

          <label className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors ${
            showSigns ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <input type="checkbox" checked={showSigns} onChange={() => setShowSigns(!showSigns)} className="hidden" />
            <span>🪧 Signs</span>
          </label>
        </div>

        {/* Severity Checkboxes Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-bold text-[11px]">SEVERITY FILTER:</span>
          
          <label className="flex items-center space-x-1.5 text-rose-400 font-semibold cursor-pointer">
            <input type="checkbox" checked={sevCritical} onChange={() => setSevCritical(!sevCritical)} className="rounded bg-slate-950 text-rose-500" />
            <span>☑ Critical</span>
          </label>

          <label className="flex items-center space-x-1.5 text-orange-400 font-semibold cursor-pointer">
            <input type="checkbox" checked={sevHigh} onChange={() => setSevHigh(!sevHigh)} className="rounded bg-slate-950 text-orange-500" />
            <span>☑ High</span>
          </label>

          <label className="flex items-center space-x-1.5 text-amber-400 font-semibold cursor-pointer">
            <input type="checkbox" checked={sevMedium} onChange={() => setSevMedium(!sevMedium)} className="rounded bg-slate-950 text-amber-500" />
            <span>☑ Medium</span>
          </label>

          <label className="flex items-center space-x-1.5 text-sky-400 font-semibold cursor-pointer">
            <input type="checkbox" checked={sevLow} onChange={() => setSevLow(!sevLow)} className="rounded bg-slate-950 text-sky-500" />
            <span>☑ Low</span>
          </label>
        </div>
      </div>

      {/* Main Interactive Map Frame */}
      <div className="h-[620px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <GISMap
          buses={showBuses ? buses : []}
          events={events}
          roadSegments={roadSegments}
          heatmaps={heatmaps}
          selectedBusId={selectedBusId}
          onBusSelect={onBusSelect}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  );
};

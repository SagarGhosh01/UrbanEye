import React, { useState } from 'react';
import { 
  Route, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Bus, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight,
  Map
} from 'lucide-react';
import { RouteIntelligence, NavigationTab } from '../../types';

interface RouteIntelligenceViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const RouteIntelligenceView: React.FC<RouteIntelligenceViewProps> = ({ onNavigate }) => {
  const [routes] = useState<RouteIntelligence[]>([
    {
      route_id: 'ROUTE-42',
      route_name: 'Route 42 (Howrah Station to Garia Corridor)',
      distance_km: 18.4,
      avg_delay_min: 12,
      hazards_count: 17,
      traffic_events_count: 31,
      incidents_count: 2,
      status: 'NEEDS_ATTENTION',
      active_buses: 6
    },
    {
      route_id: 'ROUTE-12',
      route_name: 'Route 12 (Airport Express Connector)',
      distance_km: 24.2,
      avg_delay_min: 5,
      hazards_count: 4,
      traffic_events_count: 12,
      incidents_count: 0,
      status: 'GOOD',
      active_buses: 8
    },
    {
      route_id: 'ROUTE-8A',
      route_name: 'Route 8A (Salt Lake Sector V Tech Belt)',
      distance_km: 14.1,
      avg_delay_min: 18,
      hazards_count: 22,
      traffic_events_count: 45,
      incidents_count: 4,
      status: 'CRITICAL_DELAY',
      active_buses: 5
    },
    {
      route_id: 'ROUTE-33',
      route_name: 'Route 33 (College Street Academic Ring)',
      distance_km: 11.8,
      avg_delay_min: 8,
      hazards_count: 9,
      traffic_events_count: 19,
      incidents_count: 1,
      status: 'NEEDS_ATTENTION',
      active_buses: 4
    }
  ]);

  const [selectedRoute, setSelectedRoute] = useState<RouteIntelligence>(routes[0]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Route className="w-5 h-5 text-sky-400" />
            <span>Transit Route Intelligence Matrix</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 font-mono px-2.5 py-0.5 rounded border border-sky-500/30 font-bold">
              CORRIDOR ANALYTICS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-defined bus route corridor perception linking vehicle sensor passes to fixed infrastructure conditions.
          </p>
        </div>
      </div>

      {/* Main Grid: Route Cards & Interactive Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route List Cards */}
        <div className="lg:col-span-6 space-y-4">
          {routes.map((rt) => {
            const isSelected = selectedRoute.route_id === rt.route_id;
            const statusClass = {
              GOOD: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              NEEDS_ATTENTION: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
              CRITICAL_DELAY: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }[rt.status];

            return (
              <div
                key={rt.route_id}
                onClick={() => setSelectedRoute(rt)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500 ring-1 ring-sky-500/50 shadow-xl'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="font-extrabold text-sm text-sky-400">{rt.route_id}</span>
                    <span className="text-xs text-slate-400">({rt.active_buses} Active Buses)</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${statusClass}`}>
                    {rt.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-100">{rt.route_name}</h3>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center font-mono text-xs">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">DISTANCE</span>
                    <span className="font-bold text-slate-200">{rt.distance_km} km</span>
                  </div>

                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">AVG DELAY</span>
                    <span className="font-bold text-amber-400">{rt.avg_delay_min} min</span>
                  </div>

                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">HAZARDS</span>
                    <span className="font-bold text-rose-400">{rt.hazards_count}</span>
                  </div>

                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">TRAFFIC</span>
                    <span className="font-bold text-purple-400">{rt.traffic_events_count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep Corridor Inspection */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="font-mono text-xs text-sky-400 font-bold">{selectedRoute.route_id}</span>
              <h3 className="text-base font-bold text-slate-100">{selectedRoute.route_name}</h3>
            </div>
            <button
              onClick={() => onNavigate('gis_map')}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Corridor GIS View</span>
            </button>
          </div>

          {/* Simulated Corridor Pipeline Graph */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Route Hazard Density Along Corridor:</div>
            <div className="h-32 bg-slate-950 rounded-xl border border-slate-800 p-4 relative overflow-hidden flex items-center justify-between">
              <div className="absolute inset-x-4 top-1/2 h-1 bg-slate-800 rounded-full" />
              
              {/* Route checkpoints */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                <span className="text-[10px] font-mono text-slate-400 mt-1">Start Terminal</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-rose-500 ring-4 ring-rose-500/30 flex items-center justify-center font-mono text-[9px] text-white font-bold animate-bounce">
                  !
                </div>
                <span className="text-[10px] font-mono text-rose-400 mt-1">MG Rd (17 Hazards)</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                <span className="text-[10px] font-mono text-slate-400 mt-1">Central Station</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                <span className="text-[10px] font-mono text-slate-400 mt-1">End Terminal</span>
              </div>
            </div>
          </div>

          {/* Incident History along Route */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-200">Incident History & PWD Priority</div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between text-rose-400 font-semibold">
                <span>Pothole Cluster #P-1028 (Segment 4)</span>
                <span className="font-mono text-[10px]">CRITICAL</span>
              </div>
              <p className="text-[11px] text-slate-400">
                17 total road surface hazards reported across 6 transit buses operating on {selectedRoute.route_id}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Bus, 
  Video, 
  BrainCircuit, 
  AlertTriangle, 
  Flame, 
  TrendingUp, 
  Map, 
  Play, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  Activity, 
  Radio, 
  CheckCircle,
  Eye,
  Zap,
  HardDrive
} from 'lucide-react';
import { KPISummary, BusTelemetry, UrbanEvent, NavigationTab, IncidentItem } from '../../types';

interface CommandCenterViewProps {
  kpis: KPISummary | null;
  buses: BusTelemetry[];
  events: UrbanEvent[];
  incidents: IncidentItem[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectEvent: (ev: UrbanEvent) => void;
  onStartDemo: () => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  kpis,
  buses,
  events,
  incidents,
  onNavigate,
  onSelectEvent,
  onStartDemo
}) => {
  const activeBuses = kpis?.active_buses_count || 24;
  const onlineCameras = 21;
  const aiEventsCount = kpis?.total_events_today || 186;
  const openIssuesCount = kpis?.open_issues_count || 42;
  const criticalIncidentsCount = incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length || 7;
  const trafficStatus = kpis?.traffic_density_level || 'HIGH';

  const trafficColor = {
    LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    SEVERE: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  }[trafficStatus];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Quick Actions Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <span>Urban Perception Command Center</span>
            <span className="text-[10px] bg-sky-500/20 text-sky-400 font-mono px-2 py-0.5 rounded border border-sky-500/30">
              REAL-TIME OVERVIEW
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Distributed Mobile Sensor Network Operating Across Metropolitan Transit Corridors
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => onNavigate('fleet')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-all hover:border-sky-500"
          >
            <Bus className="w-3.5 h-3.5 text-sky-400" />
            <span>View Live Fleet</span>
          </button>

          <button
            onClick={() => onNavigate('gis_map')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-all hover:border-sky-500"
          >
            <Map className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open GIS Map</span>
          </button>

          <button
            onClick={() => onNavigate('incidents')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-all hover:border-rose-500"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>View Incidents</span>
          </button>

          <button
            onClick={onStartDemo}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Live Demo</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Active Buses */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Buses</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">{activeBuses}</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Telemetry Online</span>
          </div>
        </div>

        {/* KPI 2: Online Cameras */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Online Cameras</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">{onlineCameras}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Front & Optical Sensors
          </div>
        </div>

        {/* KPI 3: AI Events */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">AI Events</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">{aiEventsCount}</div>
          <div className="text-[11px] text-purple-400 mt-1">
            Edge ML Detections
          </div>
        </div>

        {/* KPI 4: Open Issues */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Open Issues</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">{openIssuesCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Infra Work Orders
          </div>
        </div>

        {/* KPI 5: Incidents */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Incidents</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">{criticalIncidentsCount}</div>
          <div className="text-[11px] text-rose-400 mt-1">
            Action Required
          </div>
        </div>

        {/* KPI 6: Traffic Status */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Traffic Density</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xl font-black font-mono px-2.5 py-0.5 rounded-lg border ${trafficColor}`}>
              {trafficStatus}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            City Density Level
          </div>
        </div>
      </div>

      {/* Main Grid: City Map Preview & Recent AI Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live City Map & Active Fleet Widget */}
        <div className="lg:col-span-8 space-y-6">
          {/* GIS Map Preview Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Map className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-slate-200">Live City GIS Telemetry Map</h3>
              </div>
              <button
                onClick={() => onNavigate('gis_map')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 font-semibold"
              >
                <span>Full Interactive View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual map placeholder with pins preview */}
            <div 
              onClick={() => onNavigate('gis_map')}
              className="h-[320px] rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden cursor-pointer group"
            >
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Simulated Map Markers */}
              <div className="absolute top-1/3 left-1/4 animate-bounce">
                <div className="px-2 py-1 bg-sky-500 text-white rounded-lg font-mono text-[10px] font-bold shadow-lg flex items-center space-x-1">
                  <Bus className="w-3 h-3" />
                  <span>BUS-102</span>
                </div>
              </div>

              <div className="absolute top-1/2 left-3/5">
                <div className="px-2 py-1 bg-rose-500 text-white rounded-lg font-mono text-[10px] font-bold shadow-lg flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Pothole #P-1028</span>
                </div>
              </div>

              <div className="absolute bottom-1/4 left-1/3">
                <div className="px-2 py-1 bg-amber-500 text-slate-950 rounded-lg font-mono text-[10px] font-bold shadow-lg flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Congestion Hotspot</span>
                </div>
              </div>

              {/* Overlay Prompt */}
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-center justify-center">
                <div className="px-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center space-x-2 shadow-2xl group-hover:scale-105 transition-all">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Click to Expand GIS Interactive Layers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Buses Mini-List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bus className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-slate-200">Active Sensor Buses</h3>
              </div>
              <button
                onClick={() => onNavigate('fleet')}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
              >
                Manage Fleet ({buses.length || 24})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(buses.length > 0 ? buses.slice(0, 6) : [
                { bus_id: 'BUS-102', route_name: 'Route 42', speed_kmh: 34, status: 'ACTIVE' },
                { bus_id: 'BUS-105', route_name: 'Route 12', speed_kmh: 28, status: 'ACTIVE' },
                { bus_id: 'BUS-108', route_name: 'Route 8A', speed_kmh: 42, status: 'ACTIVE' },
                { bus_id: 'BUS-112', route_name: 'Route 33', speed_kmh: 0, status: 'AT_STOP' },
                { bus_id: 'BUS-118', route_name: 'Route 19', speed_kmh: 31, status: 'ACTIVE' },
                { bus_id: 'BUS-124', route_name: 'Route 51', speed_kmh: 25, status: 'ACTIVE' },
              ]).map((b) => (
                <div
                  key={b.bus_id}
                  onClick={() => onNavigate('live_bus')}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-sky-500/50 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-sky-400">{b.bus_id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      ONLINE
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">{b.route_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                    <span>Speed: {b.speed_kmh} km/h</span>
                    <span className="text-sky-400">AI: Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent AI Events & Critical Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Critical Alerts Ticker */}
          <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="text-sm font-bold text-rose-300">Critical City Alerts</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-rose-500 text-white font-bold rounded-full">
                7 HIGH
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="text-rose-400">🕳️ Repeated Pothole Hazard</span>
                  <span className="text-[10px] text-slate-400 font-mono">12 min ago</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Pothole #P-1028 detected 8 times by 4 buses on MG Road.
                </p>
                <div className="pt-1 flex items-center space-x-2">
                  <button 
                    onClick={() => onNavigate('infrastructure')}
                    className="text-[10px] text-sky-400 hover:underline font-bold"
                  >
                    View & Assign Officer →
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="text-amber-400">💧 Urban Waterlogging</span>
                  <span className="text-[10px] text-slate-400 font-mono">24 min ago</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Water accumulation at Park Circus Roundabout (Depth &gt; 15cm).
                </p>
              </div>
            </div>
          </div>

          {/* Recent AI Events Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-200">Recent AI Detections</h3>
              </div>
              <button
                onClick={() => onNavigate('incidents')}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
              {(events.length > 0 ? events.slice(0, 5) : [
                {
                  event_id: 'EVT-9041',
                  type: 'POTHOLE',
                  confidence: 0.94,
                  severity: 'HIGH',
                  bus_id: 'BUS-102',
                  timestamp: '18:42:10',
                  location: { road_name: 'MG Road Segment 4' }
                },
                {
                  event_id: 'EVT-9040',
                  type: 'WATERLOGGING',
                  confidence: 0.88,
                  severity: 'MEDIUM',
                  bus_id: 'BUS-105',
                  timestamp: '18:40:02',
                  location: { road_name: 'Park Circus Connector' }
                },
                {
                  event_id: 'EVT-9039',
                  type: 'ANPR_ALERT',
                  confidence: 0.91,
                  severity: 'HIGH',
                  bus_id: 'BUS-118',
                  timestamp: '18:38:15',
                  location: { road_name: 'EM Bypass Junction' }
                },
                {
                  event_id: 'EVT-9038',
                  type: 'DAMAGED_SIGN',
                  confidence: 0.85,
                  severity: 'LOW',
                  bus_id: 'BUS-102',
                  timestamp: '18:35:40',
                  location: { road_name: 'College Street Crossing' }
                }
              ]).map((ev: any) => (
                <div
                  key={ev.event_id}
                  onClick={() => onSelectEvent(ev)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{ev.event_id}</span>
                    <span className="text-[10px] text-slate-400">{ev.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-sky-400">{ev.type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                      {(ev.confidence * 100).toFixed(0)}% Conf
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Bus {ev.bus_id} • {ev.location?.road_name || 'City Route'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

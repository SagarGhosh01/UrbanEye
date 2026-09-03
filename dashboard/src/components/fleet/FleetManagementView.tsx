import React, { useState } from 'react';
import { 
  Bus, 
  Video, 
  Radio, 
  Cpu, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { BusTelemetry, NavigationTab } from '../../types';

interface FleetManagementViewProps {
  buses: BusTelemetry[];
  onNavigate: (tab: NavigationTab) => void;
}

export const FleetManagementView: React.FC<FleetManagementViewProps> = ({ buses, onNavigate }) => {
  const fleetData: BusTelemetry[] = buses.length > 0 ? buses : [
    {
      bus_id: 'BUS-102',
      registration_no: 'WB-04-E-1892',
      route_name: 'Route 42 (Howrah - Garia)',
      status: 'ONLINE',
      current_lat: 22.5726,
      current_lng: 88.3639,
      speed_kmh: 34,
      heading_deg: 180,
      last_seen: 'Just now',
      camera_status: 'ACTIVE',
      gps_status: 'ACTIVE',
      ai_status: 'ACTIVE',
      events_today_count: 24
    },
    {
      bus_id: 'BUS-105',
      registration_no: 'WB-04-E-2041',
      route_name: 'Route 12 (Airport Express)',
      status: 'ONLINE',
      current_lat: 22.5411,
      current_lng: 88.3912,
      speed_kmh: 28,
      heading_deg: 90,
      last_seen: '1 min ago',
      camera_status: 'ACTIVE',
      gps_status: 'ACTIVE',
      ai_status: 'ACTIVE',
      events_today_count: 18
    },
    {
      bus_id: 'BUS-108',
      registration_no: 'WB-04-E-3112',
      route_name: 'Route 8A (Salt Lake Sector V)',
      status: 'ONLINE',
      current_lat: 22.5810,
      current_lng: 88.3750,
      speed_kmh: 42,
      heading_deg: 270,
      last_seen: '2 mins ago',
      camera_status: 'ACTIVE',
      gps_status: 'ACTIVE',
      ai_status: 'ACTIVE',
      events_today_count: 31
    },
    {
      bus_id: 'BUS-112',
      registration_no: 'WB-04-E-4509',
      route_name: 'Route 33 (College Street Ring)',
      status: 'ONLINE',
      current_lat: 22.5530,
      current_lng: 88.3510,
      speed_kmh: 0,
      heading_deg: 0,
      last_seen: 'Just now',
      camera_status: 'ACTIVE',
      gps_status: 'ACTIVE',
      ai_status: 'ACTIVE',
      events_today_count: 12
    },
    {
      bus_id: 'BUS-118',
      registration_no: 'WB-04-E-5912',
      route_name: 'Route 19 (Behala Trunk)',
      status: 'ONLINE',
      current_lat: 22.5320,
      current_lng: 88.3450,
      speed_kmh: 31,
      heading_deg: 45,
      last_seen: 'Just now',
      camera_status: 'ACTIVE',
      gps_status: 'ACTIVE',
      ai_status: 'ACTIVE',
      events_today_count: 27
    }
  ];

  const [selectedBus, setSelectedBus] = useState<BusTelemetry | null>(fleetData[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFleet = fleetData.filter(b => 
    b.bus_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.route_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.registration_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-sky-400" />
            <span>Mobile Transit Sensor Fleet Management</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 font-mono px-2.5 py-0.5 rounded border border-sky-500/30 font-bold">
              24 SENSORS ONLINE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor state of public transit buses acting as distributed mobile perception nodes.
          </p>
        </div>
      </div>

      {/* Grid: Bus Table & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bus List Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bus ID, route, registration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">BUS ID</th>
                  <th className="pb-3">ASSIGNED ROUTE</th>
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3">CAMERA / GPS / AI</th>
                  <th className="pb-3">EVENTS</th>
                  <th className="pb-3 text-right">INSPECT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredFleet.map((b) => {
                  const isSelected = selectedBus?.bus_id === b.bus_id;

                  return (
                    <tr
                      key={b.bus_id}
                      onClick={() => setSelectedBus(b)}
                      className={`hover:bg-slate-950/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-800/80 font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 text-sky-400 font-bold">{b.bus_id}</td>
                      <td className="py-3.5 font-sans font-semibold text-slate-200">{b.route_name}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <span className="text-emerald-400 font-bold">CAM: {b.camera_status || 'ACTIVE'}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-sky-400 font-bold">GPS: {b.gps_status || 'ACTIVE'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-purple-300 font-bold">{b.events_today_count || 24}</td>
                      <td className="py-3.5 text-right">
                        <button className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white rounded-lg text-[11px] font-sans transition-colors">
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Bus Details Modal/Panel */}
        <div className="lg:col-span-5">
          {selectedBus ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-mono">Mobile Node Dossier</span>
                  <h3 className="text-xl font-black text-sky-400 font-mono">{selectedBus.bus_id}</h3>
                  <p className="text-xs text-slate-300 font-medium">{selectedBus.registration_no || 'WB-04-E-1892'}</p>
                </div>

                <button
                  onClick={() => onNavigate('live_bus')}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Live Feed</span>
                </button>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">STATUS</span>
                  <span className="font-bold text-emerald-400">{selectedBus.status}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">ASSIGNED ROUTE</span>
                  <span className="font-bold text-slate-200 font-sans text-xs truncate block">{selectedBus.route_name}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">CAMERA STATUS</span>
                  <span className="font-bold text-emerald-400">ACTIVE (FRONT)</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">AI INFERENCE</span>
                  <span className="font-bold text-purple-400">ACTIVE (YOLOv8)</span>
                </div>
              </div>

              {/* Today's Events Breakdown Box */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200">Today's Detected AI Events Breakdown:</div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-rose-400 text-[10px] block font-bold">Road Hazards</span>
                    <span className="font-bold text-slate-100 text-base">8</span>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-amber-400 text-[10px] block font-bold">Traffic Events</span>
                    <span className="font-bold text-slate-100 text-base">13</span>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-purple-400 text-[10px] block font-bold">Safety Events</span>
                    <span className="font-bold text-slate-100 text-base">3</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center justify-center text-slate-400 text-xs">
              Select a bus from the list to view telemetry dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  TrendingUp, 
  Car, 
  Truck, 
  Bus, 
  Bike, 
  AlertCircle, 
  Clock, 
  Activity,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export const TrafficIntelligenceView: React.FC = () => {
  const trafficLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE' = 'HIGH';

  const vehicleClassification = [
    { type: 'Cars & Sedans', count: 1842, pct: 54, icon: <Car className="w-4 h-4 text-sky-400" /> },
    { type: 'Buses & Transit', count: 412, pct: 12, icon: <Bus className="w-4 h-4 text-emerald-400" /> },
    { type: 'Two-Wheelers', count: 890, pct: 26, icon: <Bike className="w-4 h-4 text-amber-400" /> },
    { type: 'Heavy Commercial / Trucks', count: 270, pct: 8, icon: <Truck className="w-4 h-4 text-purple-400" /> }
  ];

  const hotspots = [
    { rank: 1, road: 'Park Circus Roundabout', density: '94%', speed: '8 km/h', delay: '+18 min', level: 'SEVERE' },
    { rank: 2, road: 'MG Road - Central Crossing', density: '86%', speed: '14 km/h', delay: '+12 min', level: 'HIGH' },
    { rank: 3, road: 'College Street Junction', density: '78%', speed: '18 km/h', delay: '+9 min', level: 'HIGH' },
    { rank: 4, road: 'EM Bypass Connector', density: '68%', speed: '24 km/h', delay: '+5 min', level: 'MEDIUM' },
    { rank: 5, road: 'Hazra Road Junction', density: '52%', speed: '32 km/h', delay: '+2 min', level: 'LOW' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Status Indicator */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            <span>Real-Time Traffic Perception & Density Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous optical vehicle count, speed profiling & congestion hotspot intelligence from bus optical feeds.
          </p>
        </div>

        {/* Traffic Status Indicator */}
        <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">TRAFFIC STATUS:</span>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg font-black font-mono text-sm">
              HIGH 🟠
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Vehicle Classification & Live Count KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vehicleClassification.map((item) => (
          <div key={item.type} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">{item.type}</span>
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">{item.icon}</div>
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">{item.count.toLocaleString()}</div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: `${item.pct}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1">
              <span>{item.pct}% of Total Volume</span>
              <span className="text-emerald-400">+4.2% / hr</span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Grid: Hotspots & Delay Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hotspots Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>City Congestion Hotspots & Transit Delay</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Updated 10s ago</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">RANK</th>
                  <th className="pb-3">ROAD CORRIDOR</th>
                  <th className="pb-3">DENSITY</th>
                  <th className="pb-3">AVG SPEED</th>
                  <th className="pb-3">BUS DELAY</th>
                  <th className="pb-3">LEVEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {hotspots.map((h) => (
                  <tr key={h.rank} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 font-bold text-slate-400">#{h.rank}</td>
                    <td className="py-3 font-semibold text-slate-200 font-sans">{h.road}</td>
                    <td className="py-3 text-sky-400 font-bold">{h.density}</td>
                    <td className="py-3 text-slate-300">{h.speed}</td>
                    <td className="py-3 text-rose-400 font-bold">{h.delay}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.level === 'SEVERE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        h.level === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        h.level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {h.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Peak-Hour Analysis Card */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Peak Hour Density Profile</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Morning Rush Hour</div>
              <div className="text-sm font-bold text-slate-100">08:30 AM - 10:30 AM</div>
              <div className="text-[11px] text-amber-400 font-mono">Avg Delay: +14 mins</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Evening Peak Surge</div>
              <div className="text-sm font-bold text-slate-100">05:30 PM - 08:30 PM</div>
              <div className="text-[11px] text-rose-400 font-mono">Avg Delay: +22 mins (CURRENT)</div>
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1">
              <div className="text-xs font-bold text-purple-300">AI Traffic Recommendation</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Reroute Bus Line 42 via EM Bypass bypass lane to bypass Park Circus 18 min bottle-neck.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

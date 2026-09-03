import React from 'react';
import { 
  Radio, 
  Bus, 
  MapPin, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const FleetCoverageView: React.FC = () => {
  const coveragePct = 82;
  const highZones = 12;
  const medZones = 7;
  const lowZones = 4;

  const zones = [
    { name: 'Ward 42 - MG Road & Central', coverage: '98%', buses: 8, status: 'HIGH' },
    { name: 'Ward 18 - Park Circus & Connector', coverage: '94%', buses: 6, status: 'HIGH' },
    { name: 'Ward 33 - College Street Ring', coverage: '91%', buses: 5, status: 'HIGH' },
    { name: 'Ward 54 - Salt Lake Sector V', coverage: '88%', buses: 7, status: 'HIGH' },
    { name: 'Ward 12 - Airport Bypass Corridor', coverage: '74%', buses: 4, status: 'MEDIUM' },
    { name: 'Ward 67 - Garia Main Trunk', coverage: '65%', buses: 3, status: 'MEDIUM' },
    { name: 'Ward 89 - Behala Commercial Ring', coverage: '42%', buses: 2, status: 'LOW' },
    { name: 'Ward 104 - Jadavpur Suburbs', coverage: '28%', buses: 1, status: 'LOW' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span>Distributed Mobile Sensor Network Coverage</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-0.5 rounded border border-emerald-500/30 font-bold">
              PERCEPTION MAP
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Public transit buses function as roaming mobile optical sensors, continuously surveying city infrastructure.
          </p>
        </div>
      </div>

      {/* Main Coverage KPI Progress Gauge */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Metropolitan Spatial Coverage Index</span>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-black text-slate-100 font-mono tracking-tight">{coveragePct}%</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">OPTIMAL DENSE PERCEPTION</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="text-xl font-bold font-mono text-emerald-400">{highZones}</div>
              <div className="text-[10px] text-slate-300">High Coverage Zones</div>
            </div>

            <div className="text-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="text-xl font-bold font-mono text-amber-400">{medZones}</div>
              <div className="text-[10px] text-slate-300">Medium Zones</div>
            </div>

            <div className="text-center p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <div className="text-xl font-bold font-mono text-rose-400">{lowZones}</div>
              <div className="text-[10px] text-slate-300">Low Coverage Zones</div>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800 flex">
            <div className="bg-emerald-500 h-full" style={{ width: '52%' }} title="High Coverage (12 zones)" />
            <div className="bg-amber-500 h-full" style={{ width: '30%' }} title="Medium Coverage (7 zones)" />
            <div className="bg-rose-500 h-full" style={{ width: '18%' }} title="Low Coverage (4 zones)" />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>High Coverage (12 Zones)</span>
            <span>Medium (7 Zones)</span>
            <span>Low (4 Zones)</span>
          </div>
        </div>
      </div>

      {/* Ward Zone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((z) => (
          <div key={z.name} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">{z.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                z.status === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                z.status === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {z.status}
              </span>
            </div>

            <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">{z.coverage}</div>

            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Active Sensor Buses:</span>
              <span className="font-bold font-mono text-sky-400">{z.buses} Buses</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

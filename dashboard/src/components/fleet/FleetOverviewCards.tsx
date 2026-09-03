import React from 'react';
import { Bus, AlertOctagon, Droplets, Car, Gauge, Database, TrendingUp, ShieldCheck } from 'lucide-react';
import { KPISummary } from '../../types';

interface Props {
  kpis: KPISummary | null;
}

export const FleetOverviewCards: React.FC<Props> = ({ kpis }) => {
  const cards = [
    {
      title: 'Active Roaming Fleet',
      value: kpis?.active_buses_count ?? 5,
      unit: 'Buses',
      subtext: '100% Corridor Coverage',
      icon: Bus,
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
      textColor: 'text-sky-400',
      gradient: 'from-sky-500/10 via-slate-900 to-slate-900',
    },
    {
      title: 'Potholes Detected',
      value: kpis?.potholes_detected ?? 13,
      unit: 'Total',
      subtext: 'Geo-tagged & Depth Scored',
      icon: AlertOctagon,
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      gradient: 'from-amber-500/10 via-slate-900 to-slate-900',
    },
    {
      title: 'Waterlogging & Flood',
      value: kpis?.waterlogging_detected ?? 4,
      unit: 'Hotspots',
      subtext: 'Monsoon Alert Corridor',
      icon: Droplets,
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      gradient: 'from-blue-500/10 via-slate-900 to-slate-900',
    },
    {
      title: 'Vehicles Tracked',
      value: kpis?.total_vehicles_tracked?.toLocaleString() ?? '1,845',
      unit: 'Units',
      subtext: 'ByteTrack Multi-Object',
      icon: Car,
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      gradient: 'from-emerald-500/10 via-slate-900 to-slate-900',
    },
    {
      title: 'Traffic Congestion Index',
      value: '0.68',
      unit: '/ 1.0',
      subtext: 'Moderate Peak Corridor',
      icon: Gauge,
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      gradient: 'from-purple-500/10 via-slate-900 to-slate-900',
    },
    {
      title: 'Bandwidth Saved',
      value: `${kpis?.bandwidth_savings_pct ?? 97.4}%`,
      unit: 'Saved',
      subtext: 'Edge ML vs 1080p Stream',
      icon: Database,
      border: 'border-teal-500/30',
      bg: 'bg-teal-500/10',
      textColor: 'text-teal-400',
      gradient: 'from-teal-500/10 via-slate-900 to-slate-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`bg-gradient-to-b ${c.gradient} rounded-xl p-3.5 border ${c.border} shadow-lg hover:border-slate-600 transition-all duration-200 flex flex-col justify-between group hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider leading-tight">
                {c.title}
              </span>
              <div className={`p-2 rounded-lg ${c.bg} group-hover:scale-105 transition-transform`}>
                <Icon className={`w-4 h-4 ${c.textColor}`} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline space-x-1.5 mb-1">
                <span className="text-2xl font-extrabold font-mono text-slate-100 group-hover:text-white transition-colors">{c.value}</span>
                <span className="text-xs font-semibold text-slate-400 font-sans">{c.unit}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-emerald-400 inline shrink-0" />
                <span className="truncate">{c.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

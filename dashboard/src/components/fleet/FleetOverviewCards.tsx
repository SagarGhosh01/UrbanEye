import React from 'react';
import { Bus, AlertOctagon, Droplets, Car, Gauge, Database, ArrowUpRight } from 'lucide-react';
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
      subtext: '100% City Coverage',
      icon: Bus,
      color: 'sky',
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
      textColor: 'text-sky-400',
    },
    {
      title: 'Potholes Detected',
      value: kpis?.potholes_detected ?? 13,
      unit: 'Total',
      subtext: 'Geo-tagged & Scored',
      icon: AlertOctagon,
      color: 'amber',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
    {
      title: 'Waterlogging & Flood',
      value: kpis?.waterlogging_detected ?? 4,
      unit: 'Hotspots',
      subtext: 'Monsoon Alert Head',
      icon: Droplets,
      color: 'blue',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      title: 'Vehicles Tracked (Anti-Double Count)',
      value: kpis?.total_vehicles_tracked?.toLocaleString() ?? '1,845',
      unit: 'Units',
      subtext: 'ByteTrack Multi-Object',
      icon: Car,
      color: 'emerald',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Traffic Congestion Index',
      value: '0.68',
      unit: '/ 1.0',
      subtext: 'Moderate Flow Peak',
      icon: Gauge,
      color: 'purple',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      textColor: 'text-purple-400',
    },
    {
      title: 'Bandwidth Saved vs Raw Video',
      value: `${kpis?.bandwidth_savings_pct ?? 97.4}%`,
      unit: 'Saved',
      subtext: 'Edge Events vs 1080p Stream',
      icon: Database,
      color: 'teal',
      border: 'border-teal-500/30',
      bg: 'bg-teal-500/10',
      textColor: 'text-teal-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`bg-slate-900/90 rounded-xl p-3.5 border ${c.border} shadow-md hover:border-slate-600 transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400 leading-tight">
                {c.title}
              </span>
              <div className={`p-1.5 rounded-lg ${c.bg}`}>
                <Icon className={`w-4 h-4 ${c.textColor}`} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold font-mono text-slate-100">{c.value}</span>
                <span className="text-xs font-semibold text-slate-400">{c.unit}</span>
              </div>
              <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-400">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span>{c.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

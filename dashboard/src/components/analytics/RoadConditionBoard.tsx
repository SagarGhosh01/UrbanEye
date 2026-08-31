import React from 'react';
import { RoadSegment } from '../../types';
import { Activity, AlertTriangle, CheckCircle, Wrench, Droplets } from 'lucide-react';

interface Props {
  segments: RoadSegment[];
}

export const RoadConditionBoard: React.FC<Props> = ({ segments }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'WATCHLIST':
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 shrink-0">
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide truncate">
              Municipal Road Health Index
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              Aggregated Surface Quality & Defect Density
            </p>
          </div>
        </div>

        <span className="text-[11px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono shrink-0">
          {segments.length} Corridors
        </span>
      </div>

      {/* Responsive Corridor List */}
      <div className="mt-3 space-y-2.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
        {segments.map((seg) => (
          <div
            key={seg.segment_id}
            className="p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 rounded-xl transition-all space-y-2"
          >
            {/* Top Row: Road Name & Priority Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-200 truncate leading-snug" title={seg.road_name}>
                  {seg.road_name}
                </h4>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {seg.segment_id}
                </span>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wider font-mono ${getPriorityBadge(
                  seg.maintenance_priority
                )}`}
              >
                {seg.maintenance_priority || 'NORMAL'}
              </span>
            </div>

            {/* Middle Row: Progress Bar & Score */}
            <div className="flex items-center space-x-2.5">
              <div className="flex-1 bg-slate-800/90 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                    seg.condition_score
                  )}`}
                  style={{ width: `${Math.max(8, seg.condition_score)}%` }}
                />
              </div>
              <span className={`font-mono font-bold text-xs shrink-0 ${getScoreColor(seg.condition_score)}`}>
                {seg.condition_score}<span className="text-[10px] text-slate-500">/100</span>
              </span>
            </div>

            {/* Bottom Row: Hazard Counts */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900 font-mono">
              <div className="flex items-center space-x-3">
                <span className="flex items-center text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1" />
                  {seg.pothole_count} Potholes
                </span>
                <span className="flex items-center text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-1" />
                  {seg.waterlogging_count} Flooded
                </span>
              </div>

              <span className="text-slate-500 text-[9px]">
                {seg.condition_score >= 80 ? 'Optimal' : seg.condition_score >= 50 ? 'Needs Inspection' : 'Critical Repair'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

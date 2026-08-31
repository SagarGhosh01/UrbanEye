import React from 'react';
import { RoadSegment } from '../../types';
import { Activity, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

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
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'WATCHLIST':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Municipal Road Health Index
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated Road Surface Quality & Defect Density
            </p>
          </div>
        </div>

        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded font-mono">
          {segments.length} Monitored Corridors
        </span>
      </div>

      {/* Segments Table */}
      <div className="mt-3 overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-2 font-medium">Road Segment</th>
              <th className="pb-2 font-medium">Condition Score</th>
              <th className="pb-2 font-medium">Potholes</th>
              <th className="pb-2 font-medium">Waterlogging</th>
              <th className="pb-2 font-medium text-right">Maintenance Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {segments.map((seg) => (
              <tr key={seg.segment_id} className="hover:bg-slate-950/40 transition-colors">
                <td className="py-2.5 font-medium text-slate-200">
                  {seg.road_name}
                  <span className="block text-[10px] text-slate-500 font-mono">{seg.segment_id}</span>
                </td>
                <td className="py-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          seg.condition_score >= 80
                            ? 'bg-emerald-500'
                            : seg.condition_score >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${seg.condition_score}%` }}
                      />
                    </div>
                    <span className={`font-mono font-bold ${getScoreColor(seg.condition_score)}`}>
                      {seg.condition_score}/100
                    </span>
                  </div>
                </td>
                <td className="py-2.5 font-mono text-slate-300">{seg.pothole_count}</td>
                <td className="py-2.5 font-mono text-slate-300">{seg.waterlogging_count}</td>
                <td className="py-2.5 text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getPriorityBadge(seg.maintenance_priority)}`}>
                    {seg.maintenance_priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

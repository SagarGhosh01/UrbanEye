import React from 'react';
import { Database, ArrowDownRight, DollarSign, Wifi } from 'lucide-react';
import { BandwidthReport } from '../../types';

interface Props {
  report: BandwidthReport | null;
}

export const BandwidthSavingsGauge: React.FC<Props> = ({ report }) => {
  const savingsPct = report?.savings_percentage ?? 97.4;
  const rawMb = report?.raw_video_mb_est ?? 160000;
  const edgeMb = report?.actual_edge_mb ?? 1240;
  const costSaved = report?.network_cost_saved_usd_est ?? 12.70;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30">
              <Database className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Bandwidth Optimization Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Edge Ingestion vs Continuous Raw 1080p Uplink
              </p>
            </div>
          </div>

          <span className="text-xs bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded border border-teal-500/30">
            {savingsPct}% REDUCTION
          </span>
        </div>

        {/* Comparison Visualizer */}
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Continuous 1080p Raw Stream (Hypothetical)</span>
              <span className="font-mono text-red-400 font-bold">{(rawMb / 1024).toFixed(1)} GB / Day</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div className="bg-red-500/80 h-full rounded-full w-full" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>UrbanEye Edge Structured Events + Clips (Actual)</span>
              <span className="font-mono text-emerald-400 font-bold">{(edgeMb / 1024).toFixed(2)} GB / Day</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.max(2.6, 100 - savingsPct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Savings Footer Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[10px] flex items-center">
            <Wifi className="w-3 h-3 text-teal-400 mr-1" /> Bandwidth Conserved
          </span>
          <span className="font-bold text-slate-100 font-mono text-sm">
            {((rawMb - edgeMb) / 1024).toFixed(1)} GB / Day
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[10px] flex items-center">
            <DollarSign className="w-3 h-3 text-emerald-400 mr-1" /> Fleet Cellular Cost Saved
          </span>
          <span className="font-bold text-emerald-400 font-mono text-sm">
            ${costSaved.toFixed(2)} / Day
          </span>
        </div>
      </div>
    </div>
  );
};

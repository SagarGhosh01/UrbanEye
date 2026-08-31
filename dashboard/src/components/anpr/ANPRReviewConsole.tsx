import React, { useState } from 'react';
import { ShieldCheck, Lock, Flag, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { ANPRRecord, UserRole } from '../../types';

interface Props {
  records: ANPRRecord[];
  currentRole: UserRole;
  onFlagRecord: (anprId: string, reason: string) => void;
}

export const ANPRReviewConsole: React.FC<Props> = ({ records, currentRole, onFlagRecord }) => {
  const isAuthorized = currentRole === 'law_enforcement_liaison' || currentRole === 'admin';
  const [selectedRecord, setSelectedRecord] = useState<ANPRRecord | null>(null);

  if (!isAuthorized) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="p-3 bg-red-500/10 rounded-full border border-red-500/30 mb-3">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
          Access Restricted: Law Enforcement & Traffic Authority Only
        </h3>
        <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
          In accordance with the BEL Privacy & Ethics Blueprint, raw Automatic Number Plate Recognition (ANPR) logs and vehicle tracking records are classified under strict Role-Based Access Control (RBAC).
        </p>
        <div className="mt-4 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-slate-400">
          Current Role: <span className="text-amber-400 font-bold">{currentRole.toUpperCase()}</span> (Switch to 'Police Liaison' or 'Admin' in top-right)
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center space-x-2">
              <span>ANPR & Traffic Incident Console</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
                RBAC VERIFIED
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Confidence-Gated OCR with Human-in-the-Loop Verification
            </p>
          </div>
        </div>

        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded font-mono">
          {records.length} Monitored Hits
        </span>
      </div>

      {/* ANPR Records Table */}
      <div className="mt-3 overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-2 font-medium">Plate Number</th>
              <th className="pb-2 font-medium">OCR Confidence</th>
              <th className="pb-2 font-medium">Vehicle Type</th>
              <th className="pb-2 font-medium">Reporting Bus</th>
              <th className="pb-2 font-medium">Time</th>
              <th className="pb-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {records.map((r) => {
              const isUnreadable = r.registration_no === 'Not readable' || r.ocr_confidence < 0.75;
              return (
                <tr key={r.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-2.5">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        isUnreadable
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {r.registration_no}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`font-bold ${
                        r.ocr_confidence >= 0.85
                          ? 'text-emerald-400'
                          : r.ocr_confidence >= 0.75
                          ? 'text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {(r.ocr_confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300 font-sans">{r.vehicle_type}</td>
                  <td className="py-2.5 text-slate-400">{r.bus_id}</td>
                  <td className="py-2.5 text-slate-400 font-sans">{new Date(r.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 text-right font-sans">
                    {r.is_flagged ? (
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/40 font-semibold">
                        FLAGGED: {r.flag_reason || 'Alert'}
                      </span>
                    ) : (
                      <button
                        onClick={() => onFlagRecord(r.id, 'Traffic Encroachment')}
                        className="px-2 py-1 bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white rounded text-[11px] transition-colors"
                      >
                        Flag Vehicle
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  Filter, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { AuditLogEntry } from '../../types';

export const AuditLogsView: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>([
    {
      log_id: 'LOG-4091',
      user_name: 'Officer Raj Kumar',
      user_role: 'Field Officer',
      action: 'Verified Road Hazard Pothole #P-1028',
      timestamp: '2026-09-02 18:42:11',
      event_id: 'EVT-9041',
      old_status: 'DETECTED',
      new_status: 'VERIFIED',
      details: 'Confirmed 12cm asphalt erosion depth on MG Road Segment 4 via field tablet inspection.'
    },
    {
      log_id: 'LOG-4090',
      user_name: 'Dr. Anita Banerjee',
      user_role: 'Transport Authority',
      action: 'Assigned Work Order to PWD Repair Unit',
      timestamp: '2026-09-02 18:28:40',
      event_id: 'EVT-9040',
      old_status: 'VERIFIED',
      new_status: 'ASSIGNED',
      details: 'Assigned priority repair team to Park Circus Flyover Waterlogging.'
    },
    {
      log_id: 'LOG-4089',
      user_name: 'Inspector Vikram Singh',
      user_role: 'Police Liaison',
      action: 'Flagged Vehicle Registration Plate WB12AB1234',
      timestamp: '2026-09-02 17:52:05',
      event_id: 'ANPR-8812',
      old_status: 'UNVERIFIED',
      new_status: 'FLAGGED_HOTLIST',
      details: 'Matched optical scan against state law enforcement database.'
    },
    {
      log_id: 'LOG-4088',
      user_name: 'Officer Priyanshu Das',
      user_role: 'Field Officer',
      action: 'Resolved Traffic Sign Hazard #S-5011',
      timestamp: '2026-09-02 16:15:22',
      event_id: 'EVT-9038',
      old_status: 'IN_PROGRESS',
      new_status: 'RESOLVED',
      details: 'Sign post realigned and bolted securely at College Street Junction.'
    },
    {
      log_id: 'LOG-4087',
      user_name: 'Subhash Roy',
      user_role: 'Bus Operator',
      action: 'Initiated Live Optical & Telemetry Camera Stream',
      timestamp: '2026-09-02 15:30:00',
      event_id: 'BUS-102',
      old_status: 'OFFLINE',
      new_status: 'ONLINE',
      details: 'Smartphone camera linked via HTTPS web broker on Route 42.'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter(l => 
    l.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.event_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            <span>Immutable Government Audit Trail</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-0.5 rounded border border-emerald-500/30 font-bold">
              ACCOUNTABILITY LOG
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically logged record of all officer actions, incident status modifications & authority directives.
          </p>
        </div>
      </div>

      {/* Log Search & Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit logs by officer, action, or event ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3">LOG ID</th>
                <th className="pb-3">TIMESTAMP</th>
                <th className="pb-3">USER & ROLE</th>
                <th className="pb-3">ACTION PERFORMED</th>
                <th className="pb-3">EVENT ID</th>
                <th className="pb-3">STATUS TRANSITION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 font-bold text-sky-400">{log.log_id}</td>
                  <td className="py-3.5 text-slate-400">{log.timestamp}</td>
                  <td className="py-3.5 font-sans">
                    <div className="font-bold text-slate-100">{log.user_name}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">{log.user_role}</div>
                  </td>
                  <td className="py-3.5 font-sans font-semibold text-slate-200">{log.action}</td>
                  <td className="py-3.5 font-mono text-purple-300">{log.event_id || 'N/A'}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-bold">
                      {log.old_status} → {log.new_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

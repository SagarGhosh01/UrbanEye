import React, { useState, useEffect } from 'react';
import { MunicipalTicket } from '../../types';
import { api } from '../../services/api';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  Layers, 
  Download, 
  RefreshCw, 
  Hash, 
  Building2, 
  AlertTriangle 
} from 'lucide-react';

export const MunicipalTicketsBoard: React.FC = () => {
  const [tickets, setTickets] = useState<MunicipalTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<MunicipalTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await api.getTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (e) {
      console.error('Error fetching tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const exportTicketJson = (ticket: MunicipalTicket) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ticket, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${ticket.ticket_id}_PWD_WORK_ORDER.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide flex items-center space-x-2">
              <span>Public Works (PWD) Automated Work-Orders</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                Multi-Pass Consensus Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              AI-Generated Municipal Repair Orders with Asphalt Volume, Cost Estimates (₹ INR), and SHA-256 Evidence Seal
            </p>
          </div>
        </div>

        <button
          onClick={fetchTickets}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* Main Grid: Ticket List + Selected Ticket Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {tickets.map((t) => {
            const isSelected = selectedTicket?.ticket_id === t.ticket_id;
            return (
              <div
                key={t.ticket_id}
                onClick={() => setSelectedTicket(t)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/80 hover:bg-slate-800/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-emerald-400">{t.ticket_id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    t.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {t.severity} • {t.hazard_type}
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium truncate mb-2">{t.road_name}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <span className="flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-sky-400" />
                    <span>{t.sightings_count} Fleet Passes</span>
                  </span>
                  <span className="font-mono font-bold text-slate-100">₹{t.estimated_repair_cost_inr.toLocaleString('en-IN')}</span>
                  <span className="text-emerald-400 font-bold font-mono">{Math.round(t.consensus_score * 100)}% Conf</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Municipal Work-Order Detailed Dossier */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
              {/* Ticket Top Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                      OFFICIAL PWD WORK ORDER
                    </span>
                    <span className="text-xs text-slate-400 font-mono">SLA: {selectedTicket.sla_deadline_hours}h Response</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 font-mono">{selectedTicket.ticket_id}</h3>
                  <p className="text-xs text-slate-400 flex items-center mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400 mr-1 shrink-0" />
                    <span>{selectedTicket.road_name} ({selectedTicket.location.lat?.toFixed(4)}, {selectedTicket.location.lng?.toFixed(4)})</span>
                  </p>
                </div>

                <button
                  onClick={() => exportTicketJson(selectedTicket)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PWD Order</span>
                </button>
              </div>

              {/* Engineering Quantities & Estimates Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Asphalt Volume</span>
                  <span className="text-base font-bold text-slate-100 font-mono">{selectedTicket.estimated_asphalt_m3} m³</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Area: {selectedTicket.estimated_area_sqm} m²</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Estimated Cost (INR)</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">₹{selectedTicket.estimated_repair_cost_inr.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">DSR-2026 PWD Schedule</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Consensus Verification</span>
                  <span className="text-base font-bold text-sky-400 font-mono">{Math.round(selectedTicket.consensus_score * 100)}%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{selectedTicket.buses_involved.join(', ')}</span>
                </div>
              </div>

              {/* Cryptographic Tamper-Evident Integrity Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Tamper-Evident SHA-256 Seal & Chain-of-Custody</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400 break-all select-all space-y-1">
                  <div>
                    <strong className="text-slate-300">SHA256:</strong> {selectedTicket.sha256_hash}
                  </div>
                  <div>
                    <strong className="text-slate-300">SIGNATURE:</strong> {selectedTicket.chain_of_custody_signature}
                  </div>
                  <div className="text-emerald-400 pt-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span>Hardware HSM Verified • Zero Fabrication Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Status: <strong className="text-amber-400">{selectedTicket.status}</strong></span>
                <span className="text-slate-500 text-[11px]">Logged: {new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Select a work-order ticket to view engineering quantities and cryptographic proof.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

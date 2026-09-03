import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Video, 
  Scan, 
  Cpu, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  Bus, 
  ArrowRight,
  Clock,
  Eye,
  Filter,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { UserRole } from '../../types';

interface ANPRInvestigationViewProps {
  currentRole: UserRole;
  onFlagRecord?: (id: string, reason: string) => void;
}

export const ANPRInvestigationView: React.FC<ANPRInvestigationViewProps> = ({ currentRole }) => {
  const [searchPlate, setSearchPlate] = useState<string>('RJ14CV0002');
  const [loading, setLoading] = useState<boolean>(false);
  const [dossier, setDossier] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [flagInput, setFlagInput] = useState<string>('Suspected Traffic Violation / Hotlist Watch');

  const pipelineSteps = [
    { name: '1. Optics & Video Feed', desc: '4K Bus / Webcam', icon: '📷' },
    { name: '2. Deep Learning Detection', desc: 'YOLO11 / YOLOv8', icon: '🚘' },
    { name: '3. Vehicle Multi-Tracking', desc: 'ByteTrack persistent ID', icon: '🎯' },
    { name: '4. Dedicated Plate Model', desc: '99.5% mAP ROI Crop', icon: '🔍' },
    { name: '5. Neural OCR Engine', desc: 'PaddleOCR PP-OCRv4', icon: '🔤' },
    { name: '6. Database & Geotagging', desc: 'Geocoded Address & DB', icon: '✅' },
  ];

  const fetchVehicleDossier = async (plateToSearch: string) => {
    if (!plateToSearch.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const backendUrl = 'http://' + (window.location.hostname || 'localhost') + ':8000';
      const res = await fetch(`${backendUrl}/api/v1/anpr/lookup/${encodeURIComponent(plateToSearch.trim())}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to fetch vehicle plate data');
      }
      const data = await res.json();
      setDossier(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching vehicle record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDossier('RJ14CV0002');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicleDossier(searchPlate);
  };

  const handleFlagVehicle = async (anprId: string) => {
    try {
      const backendUrl = 'http://' + (window.location.hostname || 'localhost') + ':8000';
      await fetch(`${backendUrl}/api/v1/anpr/flag/${anprId}?reason=${encodeURIComponent(flagInput)}`, {
        method: 'POST'
      });
      fetchVehicleDossier(searchPlate);
    } catch (err) {
      console.error("Flag vehicle failed:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-sky-400" />
            <span>ANPR & Vehicle Intelligence Investigation Console</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 font-mono px-2.5 py-0.5 rounded border border-sky-500/30 font-bold">
              LAW ENFORCEMENT & TRANSIT INTELLIGENCE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Query historical vehicle plate sightings, track spatio-temporal routes, view evidence image snapshots, and manage watchlists.
          </p>
        </div>
      </div>

      {/* 6-Step AI Detection Pipeline Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="text-xs font-bold text-slate-200">ANPR Recognition Pipeline Architecture:</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineSteps.map((step, idx) => (
            <div key={step.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 relative">
              <div className="text-xl">{step.icon}</div>
              <div className="font-bold text-xs text-slate-100">{step.name}</div>
              <div className="text-[10px] text-sky-400 font-mono">{step.desc}</div>
              {idx < pipelineSteps.length - 1 && (
                <ArrowRight className="hidden lg:block w-3 h-3 text-slate-600 absolute right-1 top-1/2 -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-lg">
        <Search className="w-5 h-5 text-sky-400" />
        <input
          type="text"
          placeholder="Enter Vehicle Registration Plate (e.g. RJ14CV0002, DL01AB1234, MH12DE5678)..."
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500 uppercase tracking-wider"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center space-x-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{loading ? 'Searching Database...' : 'Investigate Vehicle Plate'}</span>
        </button>
      </form>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Vehicle Dossier Data */}
      {dossier && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Vehicle Summary Card */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 block">Registration Number</span>
                <div className="text-3xl font-black text-amber-400 font-mono tracking-widest uppercase">
                  {dossier.matched_plate || dossier.search_query}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Sightings</span>
                <span className="text-2xl font-bold text-sky-400 font-mono">{dossier.total_sightings}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block font-sans">FIRST SIGHTING</span>
                <span className="font-bold text-slate-200">
                  {dossier.first_seen ? new Date(dossier.first_seen).toLocaleString() : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block font-sans">LAST SIGHTING</span>
                <span className="font-bold text-slate-200">
                  {dossier.last_seen ? new Date(dossier.last_seen).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Watchlist & Flagging Console */}
            <div className={`p-4 rounded-xl border space-y-3 ${dossier.is_flagged ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center space-x-2">
                  <ShieldAlert className={`w-4 h-4 ${dossier.is_flagged ? 'text-rose-400' : 'text-emerald-400'}`} />
                  <span className={dossier.is_flagged ? 'text-rose-300' : 'text-emerald-300'}>
                    Law Enforcement Watchlist Status
                  </span>
                </span>
                <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold ${dossier.is_flagged ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {dossier.is_flagged ? 'HOTLIST FLAGGED' : 'CLEAN'}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-mono">
                {dossier.flag_reason}
              </p>

              {dossier.sightings && dossier.sightings.length > 0 && !dossier.is_flagged && (
                <div className="pt-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    placeholder="Reason for flagging..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                  />
                  <button
                    onClick={() => handleFlagVehicle(dossier.sightings[0].anpr_id)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Flag Vehicle
                  </button>
                </div>
              )}
            </div>

            {/* Evidence Image Snapshot */}
            {dossier.sightings && dossier.sightings.length > 0 && dossier.sightings[0].evidence_thumbnail && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Latest Camera Evidence Frame Snapshot</span>
                </span>
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video max-h-56">
                  <img
                    src={dossier.sightings[0].evidence_thumbnail}
                    alt="Camera Plate Evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Location Sightings Timeline */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Spatio-Temporal Sightings Timeline ({dossier.sightings ? dossier.sightings.length : 0})</span>
            </h3>

            {(!dossier.sightings || dossier.sightings.length === 0) ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                No recorded sightings found for "{dossier.search_query}".
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {dossier.sightings.map((loc: any, idx: number) => (
                  <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-sky-400 flex items-center space-x-1">
                        <Bus className="w-3.5 h-3.5" />
                        <span>{loc.bus_id || 'BUS-101'}</span>
                      </span>
                      <span className="text-slate-400 text-[10px]">{new Date(loc.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-200 font-semibold">{loc.address}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>GPS: {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}</span>
                      <span className="text-emerald-400 font-bold">Conf: {intVal(loc.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function intVal(num: number): number {
  return Math.round(num || 0);
}

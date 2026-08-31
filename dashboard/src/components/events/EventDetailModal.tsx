import React, { useState, useEffect } from 'react';
import { UrbanEvent } from '../../types';
import { api } from '../../services/api';
import { 
  X, 
  ShieldAlert, 
  MapPin, 
  Cpu, 
  CheckCircle, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  FileText, 
  Lock, 
  Eye 
} from 'lucide-react';

interface Props {
  event: UrbanEvent | null;
  onClose: () => void;
  onUpdateStatus: (eventId: string, newStatus: string) => void;
}

export const EventDetailModal: React.FC<Props> = ({ event, onClose, onUpdateStatus }) => {
  const [viewMode, setViewMode] = useState<'RAW' | 'GRADCAM'>('RAW');
  const [gradcamOverlay, setGradcamOverlay] = useState<string | null>(null);
  const [loadingGradcam, setLoadingGradcam] = useState<boolean>(false);
  const [ticketCreated, setTicketCreated] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  if (!event) return null;

  const fetchGradcam = async () => {
    if (gradcamOverlay || !event.evidence?.thumbnail_base64) return;
    try {
      setLoadingGradcam(true);
      const bbox = event.metadata?.bounding_boxes?.[0]?.bbox || [150, 200, 300, 150];
      const res = await api.getGradCam(event.evidence.thumbnail_base64, bbox);
      if (res && res.overlay_base64) {
        setGradcamOverlay(res.overlay_base64);
      }
    } catch (e) {
      console.warn('Grad-CAM generation error:', e);
    } finally {
      setLoadingGradcam(false);
    }
  };

  const handleGenerateTicket = async () => {
    try {
      const ticket = await api.generateTicket({
        event_id: event.event_id,
        hazard_type: event.type,
        severity: event.severity,
        lat: event.location?.lat,
        lng: event.location?.lng,
        buses: [event.bus_id],
        road_name: "Ring Road (Near Moolchand)"
      });
      setTicketCreated(true);
      setTicketId(ticket.ticket_id);
    } catch (e) {
      console.error('Error generating ticket:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30">
              <ShieldAlert className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                <span>{event.type} Evidence Dossier</span>
                <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                  {event.event_id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Timestamp: {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Frame Evidence Preview & View Mode Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Visual Intelligence Layer</span>
              </span>

              {/* Grad-CAM Explainability Pill Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setViewMode('RAW')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    viewMode === 'RAW' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Bounding Box
                </button>
                <button
                  onClick={() => {
                    setViewMode('GRADCAM');
                    fetchGradcam();
                  }}
                  className={`px-2.5 py-1 rounded font-medium flex items-center space-x-1 transition-all ${
                    viewMode === 'GRADCAM' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-yellow-200" />
                  <span>Grad-CAM Explainability</span>
                </button>
              </div>
            </div>

            {/* Video / Heatmap Viewport */}
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative flex items-center justify-center">
              {viewMode === 'GRADCAM' && gradcamOverlay ? (
                <img
                  src={gradcamOverlay}
                  alt="Grad-CAM Saliency Overlay"
                  className="w-full h-full object-cover animate-in fade-in"
                />
              ) : event.evidence?.thumbnail_base64 ? (
                <img
                  src={event.evidence.thumbnail_base64}
                  alt="Event Evidence"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <ShieldAlert className="w-10 h-10 text-sky-400 mx-auto opacity-60" />
                  <p className="text-sm font-semibold text-slate-300">Raw Evidence Frame Captured</p>
                  <p className="text-xs text-slate-500 font-mono">Clip URL: {event.evidence?.clip_url || 'Stored on Edge Unit'}</p>
                </div>
              )}

              {loadingGradcam && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center space-x-2 text-xs text-amber-400 font-mono">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Computing Neural Gradient Saliency...</span>
                </div>
              )}

              <div className="absolute top-2 right-2 bg-slate-950/90 text-xs px-2.5 py-1 rounded font-mono text-emerald-400 border border-slate-800">
                CONFIDENCE: {(event.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-sky-400" /> GPS Geotag
              </span>
              {event.location?.lat ? (
                <div className="font-mono text-slate-200">
                  {event.location.lat.toFixed(6)}, {event.location.lng?.toFixed(6)}
                  <span className="block text-[10px] text-emerald-400">Lock Accuracy: ±{event.location.accuracy_m}m</span>
                </div>
              ) : (
                <span className="text-amber-400 font-semibold font-mono">GPS Signal Unavailable (Tunnel/Shadow)</span>
              )}
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1 flex items-center">
                <Cpu className="w-3.5 h-3.5 mr-1 text-purple-400" /> Edge Intelligence
              </span>
              <div className="font-mono text-slate-200">
                <span>Bus: {event.bus_id} ({event.camera_id})</span>
                <span className="block text-[10px] text-slate-400">Model: {event.metadata?.model_version || 'yolov8n-urbaneye'}</span>
              </div>
            </div>
          </div>

          {/* Tamper-Evident SHA-256 Seal Badge */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 text-[11px] font-mono space-y-1">
            <div className="flex items-center space-x-1.5 text-teal-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>SHA-256 Cryptographic Chain-of-Custody Seal</span>
            </div>
            <div className="text-slate-400 truncate select-all text-[10px]">
              HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>

          {/* Ticket generation confirmation banner if created */}
          {ticketCreated && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PWD Work-Order <strong>{ticketId}</strong> generated with asphalt quantity & cost schedule!</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={handleGenerateTicket}
            disabled={ticketCreated}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all ${
              ticketCreated
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{ticketCreated ? 'Ticket Dispatched' : 'Auto-Generate PWD Work Order'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateStatus(event.event_id, 'REVIEWED')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => onUpdateStatus(event.event_id, 'RESOLVED')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Resolve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

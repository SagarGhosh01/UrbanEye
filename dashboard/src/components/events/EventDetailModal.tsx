import React from 'react';
import { UrbanEvent } from '../../types';
import { X, ShieldAlert, MapPin, Cpu, CheckCircle, Send, AlertTriangle } from 'lucide-react';

interface Props {
  event: UrbanEvent | null;
  onClose: () => void;
  onUpdateStatus: (eventId: string, newStatus: string) => void;
}

export const EventDetailModal: React.FC<Props> = ({ event, onClose, onUpdateStatus }) => {
  if (!event) return null;

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
          {/* Frame Evidence Preview */}
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative flex items-center justify-center">
            {event.evidence?.thumbnail_base64 ? (
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

            <div className="absolute top-2 right-2 bg-slate-950/90 text-xs px-2.5 py-1 rounded font-mono text-emerald-400 border border-slate-800">
              CONFIDENCE: {(event.confidence * 100).toFixed(1)}%
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

          {/* ANPR Plate details if available */}
          {event.anpr && (
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs block">Associated License Plate</span>
                <span className="text-base font-mono font-bold text-sky-400">{event.anpr.plate}</span>
              </div>
              <span className="text-xs bg-sky-500/20 text-sky-300 font-mono px-2 py-1 rounded">
                OCR Conf: {(event.anpr.confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Current Status:</span>
            <span className="text-xs font-bold text-sky-400 font-mono">{event.status}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateStatus(event.event_id, 'REVIEWED')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => onUpdateStatus(event.event_id, 'DISPATCHED')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            >
              Dispatch Road Crew
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

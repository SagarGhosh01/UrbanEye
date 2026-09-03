import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { ANPRRecord, UserRole } from '../../types';

interface ANPRInvestigationViewProps {
  currentRole: UserRole;
  onFlagRecord?: (id: string, reason: string) => void;
}

export const ANPRInvestigationView: React.FC<ANPRInvestigationViewProps> = ({ currentRole, onFlagRecord }) => {
  const [searchPlate, setSearchPlate] = useState<string>('WB12AB1234');
  const [flagReason, setFlagReason] = useState<string>('Suspected Stolen Vehicle');

  const pipelineSteps = [
    { name: '1. Optical Camera', desc: '4K Bus Feed', icon: '📷' },
    { name: '2. Vehicle Detection', desc: 'YOLOv8 BBox', icon: '🚘' },
    { name: '3. Vehicle Tracking', desc: 'DeepSORT ID', icon: '🎯' },
    { name: '4. License Plate Detection', desc: 'Crop ROI', icon: '🔍' },
    { name: '5. OCR Engine', desc: 'CRNN Text', icon: '🔤' },
    { name: '6. Registration Match', desc: 'Plate Verified', icon: '✅' },
  ];

  const investigatedVehicle = {
    plate: 'WB12AB1234',
    confidence: 91,
    vehicle_type: 'Sedan / White Maruti',
    first_seen: '18:31:04',
    last_seen: '18:34:52',
    detecting_buses: ['BUS-102', 'BUS-118'],
    is_flagged: true,
    flag_reason: 'Hotlist Match - Stolen Vehicle Database',
    location_history: [
      { time: '18:34:52', bus: 'BUS-118', road: 'Park Circus Connector', lat: 22.5411, lng: 88.3912 },
      { time: '18:31:04', bus: 'BUS-102', road: 'MG Road Junction', lat: 22.5726, lng: 88.3639 }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-sky-400" />
            <span>ANPR & Vehicle Investigation Console</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 font-mono px-2.5 py-0.5 rounded border border-sky-500/30 font-bold">
              LAW ENFORCEMENT LIAISON
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic License Plate Recognition pipeline and multi-bus spatial tracking investigation tool.
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-lg">
        <Search className="w-5 h-5 text-sky-400" />
        <input
          type="text"
          placeholder="Enter Vehicle Plate Number (e.g. WB12AB1234)..."
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500"
        />
        <button
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
        >
          Investigate Vehicle
        </button>
      </div>

      {/* Vehicle Investigation Dossier Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vehicle Dossier Details */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-400">Target Registration Plate</span>
              <div className="text-2xl font-black text-emerald-400 font-mono tracking-wider">{investigatedVehicle.plate}</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">OCR Confidence</span>
              <span className="text-xl font-bold text-purple-400 font-mono">{investigatedVehicle.confidence}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">FIRST SEEN</span>
              <span className="font-bold text-slate-200">{investigatedVehicle.first_seen}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">LAST SEEN</span>
              <span className="font-bold text-slate-200">{investigatedVehicle.last_seen}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2">
              <span className="text-slate-500 text-[10px] block">DETECTED BY TRANSIT BUSES</span>
              <div className="flex items-center space-x-2 pt-1">
                {investigatedVehicle.detecting_buses.map(b => (
                  <span key={b} className="px-2.5 py-1 bg-sky-500/20 text-sky-400 rounded-lg font-bold border border-sky-500/30">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Flagging Console */}
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
              <span className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Hotlist Flagging Console</span>
              </span>
              <span className="px-2 py-0.5 bg-rose-500 text-white rounded font-mono text-[10px]">
                FLAGGED
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {investigatedVehicle.flag_reason}
            </p>
          </div>
        </div>

        {/* Right: Location History Timeline & Map */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Spatio-Temporal Sightings Timeline</span>
          </h3>

          <div className="space-y-3">
            {investigatedVehicle.location_history.map((loc, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-sky-400">{loc.bus}</span>
                  <span className="text-slate-400 text-[10px]">{loc.time}</span>
                </div>
                <div className="text-slate-200 font-semibold">{loc.road}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  GPS: {loc.lat}, {loc.lng}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Cpu, HardDrive, Thermometer, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import { EdgeDevice } from '../../types';

interface Props {
  devices: EdgeDevice[];
}

export const FleetDeviceHealth: React.FC<Props> = ({ devices }) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Edge Hardware & Device Health
            </h3>
            <p className="text-xs text-slate-400">
              NVIDIA Jetson Orin & Qualcomm RB Compute Diagnostics
            </p>
          </div>
        </div>

        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded font-mono">
          {devices.length} Onboard Units
        </span>
      </div>

      {/* Device Cards Grid */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto">
        {devices.map((dev) => (
          <div
            key={dev.device_id}
            className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs text-sky-400">{dev.device_id} ({dev.bus_id})</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                    dev.status === 'ONLINE'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : dev.status === 'BUFFERING_OFFLINE'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {dev.status}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div>Model: <span className="text-slate-200">{dev.model_family}</span></div>
                <div>Firmware: <span className="text-slate-300">{dev.firmware_version}</span></div>
                <div>AI Weights: <span className="text-sky-400">{dev.model_version}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] font-mono">
              <div>
                <span className="text-slate-500 block">GPU Load</span>
                <span className="font-bold text-emerald-400">{dev.gpu_usage_pct}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Core Temp</span>
                <span className="font-bold text-amber-400">{dev.temperature_c}°C</span>
              </div>
              <div>
                <span className="text-slate-500 block">Buffered</span>
                <span className="font-bold text-slate-200">{dev.buffered_events_count} evts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

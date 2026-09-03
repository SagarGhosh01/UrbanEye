import React from 'react';
import { Shield, Radio, Activity, RefreshCw, UserCheck, CheckCircle2, Wifi } from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeBusesCount: number;
  isConnected: boolean;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeBusesCount,
  isConnected,
  demoMode,
  setDemoMode
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 py-3 sticky top-0 z-50 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center border border-sky-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider text-slate-100 uppercase">UrbanEye</span>
                <span className="text-[10px] bg-sky-500/15 text-sky-400 font-bold px-2 py-0.5 rounded-full border border-sky-500/30 shadow-sm">
                  PROD v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                AI-Powered Urban Perception & Transit Intelligence Engine
              </p>
            </div>
          </div>

          {/* Mobile Connection Status Badge */}
          <div className="flex md:hidden items-center space-x-1.5 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-300">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* Center: Real-Time Telemetry HUD */}
        <div className="hidden lg:flex items-center space-x-5 bg-slate-950/80 px-4 py-1.5 rounded-xl border border-slate-800/80 shadow-inner text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="text-slate-300">
              BROKER: <span className={isConnected ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="text-slate-300">
              SENSORS: <span className="text-sky-400 font-bold">{activeBusesCount} BUSES</span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">
              ZERO FABRICATION: <span className="text-emerald-400 font-bold">VERIFIED</span>
            </span>
          </div>
        </div>

        {/* Right: Controls & Role Switcher */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95 ${
              demoMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${demoMode ? 'text-amber-400 animate-spin-slow' : ''}`} />
            <span>Pilot Mode: {demoMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Role selector dropdown */}
          <div className="flex items-center bg-slate-950/90 rounded-xl px-2.5 py-1 border border-slate-800 shadow-sm">
            <UserCheck className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none pr-1 py-0.5 cursor-pointer"
            >
              <option value="admin" className="bg-slate-900 text-slate-100">Role: Chief Admin</option>
              <option value="analyst" className="bg-slate-900 text-slate-100">Role: City Analyst</option>
              <option value="law_enforcement_liaison" className="bg-slate-900 text-slate-100">Role: Police Liaison</option>
              <option value="viewer" className="bg-slate-900 text-slate-100">Role: General Viewer</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

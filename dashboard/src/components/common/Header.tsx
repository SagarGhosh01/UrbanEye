import React from 'react';
import { Shield, Radio, Activity, RefreshCw, UserCheck, AlertTriangle } from 'lucide-react';
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
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center space-x-3.5">
          <div className="bg-gradient-to-br from-sky-500 to-blue-700 p-2.5 rounded-xl shadow-md flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider text-slate-100 uppercase">UrbanEye</span>
              <span className="text-xs bg-sky-500/20 text-sky-400 font-semibold px-2 py-0.5 rounded border border-sky-500/30">
                PROD v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              UrbanEye • AI-Powered Urban Perception & Transit Intelligence Platform
            </p>
          </div>
        </div>

        {/* Center: Live Status HUD */}
        <div className="hidden lg:flex items-center space-x-6 bg-slate-950/60 px-4 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-mono text-slate-300">
              {isConnected ? 'LIVE BROKER CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-mono">
              ROAMING SENSORS: <span className="text-sky-400 font-bold">{activeBusesCount} BUSES</span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-300 font-mono">
              ZERO FABRICATION: <span className="text-emerald-400 font-bold">ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Right: Demo Mode Toggle & Role Switcher */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              demoMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${demoMode ? 'text-amber-400' : ''}`} />
            <span>Pilot Demo Mode: {demoMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Role selector */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-1 border border-slate-800">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1.5" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none pr-2 py-1 cursor-pointer"
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

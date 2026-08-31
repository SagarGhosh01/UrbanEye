import React, { useState } from 'react';
import { Play, AlertTriangle, Droplets, ShieldAlert, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface Props {
  onRefresh: () => void;
}

export const PilotDemoControls: React.FC<Props> = ({ onRefresh }) => {
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleInject = async (type: string, severity: string = 'HIGH') => {
    setLoadingAction(type);
    try {
      await api.injectHazard(type, severity, 'BUS-101');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleOffline = async () => {
    const nextState = !isSimulatingOffline;
    setIsSimulatingOffline(nextState);
    setLoadingAction('toggle_net');
    try {
      await api.toggleNetwork('EDGE-101', nextState);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStepFleet = async () => {
    setLoadingAction('step_fleet');
    try {
      await api.tickFleet();
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-xl p-4 shadow-xl mb-4 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center space-x-1 border border-amber-500/40">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PILOT & STAKEHOLDER DEMO CONTROLS</span>
          </div>
          <span className="text-xs text-slate-400">
            Trigger live real-time edge detection events and network resilient store-and-forward tests.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleInject('POTHOLE', 'CRITICAL')}
            disabled={loadingAction !== null}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/80 hover:bg-red-600 text-white flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>+ Inject Deep Pothole</span>
          </button>

          <button
            onClick={() => handleInject('WATERLOGGING', 'HIGH')}
            disabled={loadingAction !== null}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600/80 hover:bg-sky-600 text-white flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>+ Inject Waterlogging</span>
          </button>

          <button
            onClick={() => handleInject('NEAR_MISS', 'HIGH')}
            disabled={loadingAction !== null}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/80 hover:bg-purple-600 text-white flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>+ Inject Near-Miss</span>
          </button>

          <button
            onClick={handleToggleOffline}
            disabled={loadingAction !== null}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
              isSimulatingOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isSimulatingOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isSimulatingOffline ? 'Edge Offline (Buffering...)' : 'Simulate Network Outage'}</span>
          </button>

          <button
            onClick={handleStepFleet}
            disabled={loadingAction !== null}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Step Fleet Movement</span>
          </button>
        </div>
      </div>
    </div>
  );
};

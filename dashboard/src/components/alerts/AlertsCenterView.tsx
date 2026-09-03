import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Flame, 
  TrendingUp, 
  Droplet, 
  Wrench, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Trash2
} from 'lucide-react';
import { AlertNotification, NavigationTab } from '../../types';

interface AlertsCenterViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const AlertsCenterView: React.FC<AlertsCenterViewProps> = ({ onNavigate }) => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([
    {
      alert_id: 'ALT-101',
      type: 'CRITICAL_INCIDENT',
      severity: 'CRITICAL',
      title: 'Critical Pothole Detected Repeatedly',
      message: 'Pothole #P-1028 detected 8 times across 4 buses on MG Road. High transit bus damage risk.',
      timestamp: '12 min ago',
      bus_id: 'BUS-102',
      is_read: false
    },
    {
      alert_id: 'ALT-102',
      type: 'MAJOR_HAZARD',
      severity: 'HIGH',
      title: 'Park Circus Waterlogging Alert',
      message: 'Water accumulation exceeding 15cm detected by BUS-105 at Park Circus flyover base.',
      timestamp: '24 min ago',
      bus_id: 'BUS-105',
      is_read: false
    },
    {
      alert_id: 'ALT-103',
      type: 'TRAFFIC_CONGESTION',
      severity: 'MEDIUM',
      title: 'Peak Evening Traffic Density Surge',
      message: 'College Street Junction speed dropped below 14 km/h due to rush hour accumulation.',
      timestamp: '45 min ago',
      bus_id: 'BUS-118',
      is_read: true
    },
    {
      alert_id: 'ALT-104',
      type: 'INFRASTRUCTURE',
      severity: 'LOW',
      title: 'Inverted Speed Sign Detected',
      message: 'Speed limit traffic sign inverted on Central Avenue corridor.',
      timestamp: '1 hour ago',
      bus_id: 'BUS-124',
      is_read: true
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  const filtered = alerts.filter(a => activeFilter === 'ALL' || a.type === activeFilter);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>Authority Notification & Alert Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time automated incident dispatches categorizing city perception signals.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={markAllRead}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
        {['ALL', 'CRITICAL_INCIDENT', 'MAJOR_HAZARD', 'TRAFFIC_CONGESTION', 'WATERLOGGING', 'INFRASTRUCTURE'].map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === type
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const alertTheme = {
            CRITICAL_INCIDENT: { border: 'border-rose-500/40', bg: 'bg-rose-950/20', icon: '🔴', tag: 'bg-rose-500 text-white' },
            MAJOR_HAZARD: { border: 'border-orange-500/40', bg: 'bg-orange-950/20', icon: '🟠', tag: 'bg-orange-500 text-slate-950 font-bold' },
            TRAFFIC_CONGESTION: { border: 'border-amber-500/40', bg: 'bg-amber-950/20', icon: '🟡', tag: 'bg-amber-500 text-slate-950 font-bold' },
            WATERLOGGING: { border: 'border-blue-500/40', bg: 'bg-blue-950/20', icon: '🔵', tag: 'bg-blue-500 text-white' },
            INFRASTRUCTURE: { border: 'border-purple-500/40', bg: 'bg-purple-950/20', icon: '🟣', tag: 'bg-purple-500 text-white' }
          }[alert.type] || { border: 'border-slate-800', bg: 'bg-slate-950', icon: '🔔', tag: 'bg-slate-800 text-slate-200' };

          return (
            <div
              key={alert.alert_id}
              className={`p-5 rounded-2xl border ${alertTheme.border} ${alertTheme.bg} space-y-3 shadow-lg transition-all ${
                !alert.is_read ? 'ring-1 ring-amber-500/30' : 'opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">{alertTheme.icon}</span>
                  <span className="font-bold text-sm text-slate-100">{alert.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${alertTheme.tag}`}>
                    {alert.severity}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{alert.timestamp}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-7">{alert.message}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 pl-7">
                <span className="text-xs font-mono text-slate-400">Source: Bus {alert.bus_id} Telemetry</span>

                {/* Workflow Trigger: View -> Verify -> Assign */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate('incidents')}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onNavigate('infrastructure')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => onNavigate('incidents')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

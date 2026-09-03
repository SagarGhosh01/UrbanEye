import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  Bus, 
  Flame, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  UserCheck, 
  Layers, 
  TrendingUp,
  RefreshCw,
  Plus
} from 'lucide-react';
import { InfrastructureIssue, UserRole } from '../../types';

interface InfrastructureManagementViewProps {
  currentRole: UserRole;
}

export const InfrastructureManagementView: React.FC<InfrastructureManagementViewProps> = ({ currentRole }) => {
  const [issues, setIssues] = useState<InfrastructureIssue[]>([
    {
      issue_id: 'P-1028',
      title: 'Deep Asphalt Pothole',
      type: 'POTHOLE',
      severity: 'HIGH',
      detection_frequency: 8,
      buses_detected_count: 4,
      location: { lat: 22.5726, lng: 88.3639, road_name: 'MG Road Segment 4', resolved_address: '142 MG Road, Ward 42' },
      last_detected: '12 min ago',
      status: 'OPEN',
      assigned_officer: undefined
    },
    {
      issue_id: 'W-3041',
      title: 'Park Circus Flyover Waterlogging',
      type: 'WATERLOGGING',
      severity: 'CRITICAL',
      detection_frequency: 14,
      buses_detected_count: 6,
      location: { lat: 22.5411, lng: 88.3912, road_name: 'Park Circus Connector', resolved_address: 'Flyover Ramp Base' },
      last_detected: '5 min ago',
      status: 'VERIFIED',
      assigned_officer: 'Officer Raj Kumar'
    },
    {
      issue_id: 'Z-2012',
      title: 'Missing Zebra Crossing Paint',
      type: 'MISSING_ZEBRA',
      severity: 'MEDIUM',
      detection_frequency: 19,
      buses_detected_count: 7,
      location: { lat: 22.5810, lng: 88.3750, road_name: 'College Street Crossing', resolved_address: 'Near Presidency Univ' },
      last_detected: '34 min ago',
      status: 'ASSIGNED',
      assigned_officer: 'Officer Priyanshu Das'
    },
    {
      issue_id: 'D-4090',
      title: 'Shifted Concrete Divider Barrier',
      type: 'MISSING_DIVIDER',
      severity: 'MEDIUM',
      detection_frequency: 5,
      buses_detected_count: 3,
      location: { lat: 22.5530, lng: 88.3510, road_name: 'Lenin Sarani Corridor', resolved_address: 'Esplanade Terminal' },
      last_detected: '1 hour ago',
      status: 'OPEN',
      assigned_officer: undefined
    },
    {
      issue_id: 'S-5011',
      title: 'Inverted Speed Limit Sign',
      type: 'DAMAGED_SIGN',
      severity: 'LOW',
      detection_frequency: 11,
      buses_detected_count: 5,
      location: { lat: 22.5690, lng: 88.3610, road_name: 'Central Avenue', resolved_address: 'Near Metro Gate 2' },
      last_detected: '2 hours ago',
      status: 'RESOLVED',
      assigned_officer: 'Officer Animesh Roy'
    }
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', name: 'All Hazards' },
    { id: 'POTHOLE', name: '🕳️ Potholes' },
    { id: 'ROAD_DAMAGE', name: '🚧 Road Damage' },
    { id: 'WATERLOGGING', name: '💧 Waterlogging' },
    { id: 'MISSING_DIVIDER', name: '🧱 Dividers' },
    { id: 'MISSING_ZEBRA', name: '🚶 Zebra Crossings' },
    { id: 'DAMAGED_SIGN', name: '🪧 Traffic Signs' }
  ];

  const handleVerify = (id: string) => {
    setIssues(prev => prev.map(i => i.issue_id === id ? { ...i, status: 'VERIFIED' } : i));
  };

  const handleAssign = (id: string) => {
    setIssues(prev => prev.map(i => i.issue_id === id ? { ...i, status: 'ASSIGNED', assigned_officer: 'Officer Raj Kumar' } : i));
  };

  const handleResolve = (id: string) => {
    setIssues(prev => prev.map(i => i.issue_id === id ? { ...i, status: 'RESOLVED' } : i));
  };

  const filteredIssues = issues.filter(i => activeCategory === 'ALL' || i.type === activeCategory);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>Municipal Road & Infrastructure Portal</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2.5 py-0.5 rounded border border-amber-500/30 font-bold">
              MULTI-PASS REPEAT DETECTION CONFIDENCE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic multi-bus consensus algorithms eliminate false positives by tracking detection frequency across different transit vehicles.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Total Flagged:</span>
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl font-bold font-mono text-xs">
            {issues.length} Issues
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIssues.map((issue) => {
          const statusColors = {
            OPEN: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            VERIFIED: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
            ASSIGNED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            RESOLVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }[issue.status];

          return (
            <div
              key={issue.issue_id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg transition-all"
            >
              {/* Card Top */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  #{issue.issue_id}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${statusColors}`}>
                  {issue.status}
                </span>
              </div>

              {/* Title & Severity */}
              <div>
                <h3 className="font-bold text-sm text-slate-100">{issue.title}</h3>
                <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{issue.location.road_name}</span>
                </p>
              </div>

              {/* Detection Frequency Highlight Box */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Detection Frequency:</span>
                  <span className="font-mono font-bold text-sky-400 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Detected {issue.detection_frequency} times</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Distinct Buses:</span>
                  <span className="text-emerald-400 font-bold">{issue.buses_detected_count} Buses</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                  <span>Last Seen:</span>
                  <span>{issue.last_detected}</span>
                </div>
              </div>

              {/* Assigned Officer */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Assigned Officer:</span>
                <span className="font-semibold text-slate-200">
                  {issue.assigned_officer || 'Unassigned'}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleVerify(issue.issue_id)}
                  disabled={issue.status === 'VERIFIED' || issue.status === 'RESOLVED'}
                  className="py-1.5 bg-slate-800 hover:bg-sky-600 disabled:opacity-40 text-slate-200 hover:text-white font-bold rounded-xl text-[11px] transition-colors"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleAssign(issue.issue_id)}
                  disabled={issue.status === 'RESOLVED'}
                  className="py-1.5 bg-slate-800 hover:bg-purple-600 disabled:opacity-40 text-slate-200 hover:text-white font-bold rounded-xl text-[11px] transition-colors"
                >
                  Assign
                </button>
                <button
                  onClick={() => handleResolve(issue.issue_id)}
                  disabled={issue.status === 'RESOLVED'}
                  className="py-1.5 bg-slate-800 hover:bg-emerald-600 disabled:opacity-40 text-slate-200 hover:text-white font-bold rounded-xl text-[11px] transition-colors"
                >
                  Resolve
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

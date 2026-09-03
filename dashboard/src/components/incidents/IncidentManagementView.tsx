import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Play, 
  MapPin, 
  Bus, 
  Video, 
  Filter, 
  Search, 
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { IncidentItem, IncidentStatus, UserRole } from '../../types';

interface IncidentManagementViewProps {
  currentRole: UserRole;
}

export const IncidentManagementView: React.FC<IncidentManagementViewProps> = ({ currentRole }) => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([
    {
      incident_id: 'INC-8092',
      type: 'POTHOLE_CRITICAL',
      severity: 'CRITICAL',
      status: 'DETECTED',
      ai_confidence: 94.2,
      bus_id: 'BUS-102',
      camera_id: 'CAM-FRONT-01',
      location: { lat: 22.5726, lng: 88.3639, road_name: 'MG Road Segment 4', resolved_address: '142 MG Road, Ward 42' },
      timestamp: '2026-09-02 18:42:11',
      assigned_officer: null,
      description: 'Severe road pothole detected by 4 buses. Asphalt erosion depth > 12cm. High damage potential for transit buses.'
    },
    {
      incident_id: 'INC-8091',
      type: 'WATERLOGGING_SEVERE',
      severity: 'HIGH',
      status: 'UNDER_REVIEW',
      ai_confidence: 89.6,
      bus_id: 'BUS-105',
      camera_id: 'CAM-FRONT-02',
      location: { lat: 22.5411, lng: 88.3912, road_name: 'Park Circus Connector', resolved_address: 'Park Circus Flyover Base' },
      timestamp: '2026-09-02 18:25:40',
      assigned_officer: 'Officer Raj Kumar',
      description: 'Waterlogging accumulating across 2 lanes. Vehicle flow restricted.'
    },
    {
      incident_id: 'INC-8089',
      type: 'DAMAGED_TRAFFIC_SIGN',
      severity: 'MEDIUM',
      status: 'VERIFIED',
      ai_confidence: 91.5,
      bus_id: 'BUS-118',
      camera_id: 'CAM-FRONT-01',
      location: { lat: 22.5810, lng: 88.3750, road_name: 'College Street Junction', resolved_address: 'Near Presidency Univ' },
      timestamp: '2026-09-02 17:50:12',
      assigned_officer: 'Officer Priyanshu Das',
      description: 'Stop sign inverted by heavy winds. Low visibility for nighttime traffic.'
    },
    {
      incident_id: 'INC-8085',
      type: 'ANPR_UNAUTHORIZED_VEHICLE',
      severity: 'CRITICAL',
      status: 'ASSIGNED',
      ai_confidence: 96.4,
      bus_id: 'BUS-102',
      camera_id: 'CAM-FRONT-01',
      location: { lat: 22.5690, lng: 88.3610, road_name: 'Central Avenue', resolved_address: 'Central Station Crossing' },
      timestamp: '2026-09-02 17:12:05',
      assigned_officer: 'Inspector Vikram Singh',
      description: 'Vehicle plate WB12AB1234 flagged on stolen vehicle database scanned by BUS-102.'
    },
    {
      incident_id: 'INC-8078',
      type: 'MISSING_DIVIDER',
      severity: 'MEDIUM',
      status: 'IN_PROGRESS',
      ai_confidence: 87.1,
      bus_id: 'BUS-124',
      camera_id: 'CAM-FRONT-01',
      location: { lat: 22.5530, lng: 88.3510, road_name: 'Lenin Sarani', resolved_address: 'Esplanade Terminal' },
      timestamp: '2026-09-02 16:04:30',
      assigned_officer: 'Officer Animesh Roy',
      description: 'Concrete median barrier shifted out of position following minor impact.'
    },
    {
      incident_id: 'INC-8065',
      type: 'POTHOLE_REPAIRED',
      severity: 'LOW',
      status: 'RESOLVED',
      ai_confidence: 98.0,
      bus_id: 'BUS-108',
      camera_id: 'CAM-FRONT-01',
      location: { lat: 22.5320, lng: 88.3450, road_name: 'Hazra Road Segment 2', resolved_address: 'Hazra Crossing' },
      timestamp: '2026-09-02 14:15:00',
      assigned_officer: 'Officer Raj Kumar',
      description: 'Asphalt patching verified resolved by PWD inspection team.'
    }
  ]);

  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(incidents[0]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const officers = ['Officer Raj Kumar', 'Officer Priyanshu Das', 'Inspector Vikram Singh', 'Officer Animesh Roy', 'Officer Swati Sharma'];

  const workflowSteps: IncidentStatus[] = ['DETECTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

  const handleUpdateStatus = (incidentId: string, newStatus: IncidentStatus) => {
    setIncidents(prev => prev.map(i => i.incident_id === incidentId ? { ...i, status: newStatus } : i));
    if (selectedIncident && selectedIncident.incident_id === incidentId) {
      setSelectedIncident(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAssignOfficer = (incidentId: string, officer: string) => {
    setIncidents(prev => prev.map(i => i.incident_id === incidentId ? { ...i, assigned_officer: officer, status: i.status === 'DETECTED' ? 'ASSIGNED' : i.status } : i));
    if (selectedIncident && selectedIncident.incident_id === incidentId) {
      setSelectedIncident(prev => prev ? { ...prev, assigned_officer: officer } : null);
    }
  };

  const filteredIncidents = incidents.filter(i => {
    const matchesStatus = filterStatus === 'ALL' || i.status === filterStatus;
    const matchesSearch = i.incident_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.location.road_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Incident Management Pipeline</span>
            <span className="text-xs bg-rose-500/20 text-rose-300 font-mono px-2.5 py-0.5 rounded border border-rose-500/30 font-bold">
              WORKFLOW ENGINE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Turn AI edge detections into actionable municipal & authority workflows
          </p>
        </div>

        {/* Workflow State Pills */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] font-mono">
          {workflowSteps.map((step, idx) => (
            <React.Fragment key={step}>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg">
                {step.replace('_', ' ')}
              </span>
              {idx < workflowSteps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Layout: Incident List & Detail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            {/* Search & Filter controls */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search incident ID, type, road..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 py-2 px-3 rounded-xl focus:outline-none cursor-pointer font-mono"
              >
                <option value="ALL">All States</option>
                <option value="DETECTED">DETECTED</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
              {filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.incident_id === inc.incident_id;
                const statusBadgeClass = {
                  DETECTED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                  UNDER_REVIEW: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                  VERIFIED: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
                  ASSIGNED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                  IN_PROGRESS: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
                  RESOLVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }[inc.status];

                return (
                  <div
                    key={inc.incident_id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-mono text-xs font-bold text-slate-100">
                        <span>{inc.incident_id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${statusBadgeClass}`}>
                          {inc.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{inc.timestamp.split(' ')[1]}</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200">{inc.type.replace('_', ' ')}</div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[200px]">{inc.location.road_name}</span>
                      <span className="text-purple-400 font-mono font-bold">{inc.ai_confidence}% Conf</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Complete Incident Detail & Action Console */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-slate-100 font-mono">{selectedIncident.incident_id}</span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded border border-purple-500/30">
                      AI Confidence: {selectedIncident.ai_confidence}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-sky-400 mt-0.5">{selectedIncident.type.replace('_', ' ')}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-slate-400">Status:</span>
                  <select
                    value={selectedIncident.status}
                    onChange={(e) => handleUpdateStatus(selectedIncident.incident_id, e.target.value as IncidentStatus)}
                    className="bg-slate-950 border border-sky-500 text-sky-300 text-xs font-bold font-mono py-1.5 px-3 rounded-xl focus:outline-none cursor-pointer"
                  >
                    {workflowSteps.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive State Progression Workflow Bar */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Incident Resolution Lifecycle:</div>
                <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {workflowSteps.map((step, idx) => {
                    const currentIdx = workflowSteps.indexOf(selectedIncident.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <button
                        key={step}
                        onClick={() => handleUpdateStatus(selectedIncident.incident_id, step)}
                        className={`py-2 px-1 rounded-lg text-[10px] font-mono font-bold flex flex-col items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-sky-500 text-white ring-2 ring-sky-400 shadow-md scale-105'
                            : isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>{idx + 1}. {step.substring(0, 6)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evidence Media & Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Simulated Video & Frame Snapshot */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold flex items-center space-x-1.5">
                      <Video className="w-3.5 h-3.5 text-sky-400" />
                      <span>Optical Frame Capture</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">2.4MB Clip Recorded</span>
                  </div>
                  
                  <div className="h-44 rounded-lg bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center group">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                    <div className="p-3 bg-rose-500/30 border border-rose-500 text-rose-300 rounded-lg text-xs font-mono font-bold flex items-center space-x-2 shadow-2xl">
                      <AlertTriangle className="w-4 h-4 animate-pulse" />
                      <span>[AI BBOX: {selectedIncident.type}]</span>
                    </div>
                    <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-400">
                      Camera: {selectedIncident.camera_id} • Bus: {selectedIncident.bus_id}
                    </div>
                  </div>
                </div>

                {/* Metadata & GPS Telemetry */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Location & Telemetry Metadata</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">Road Corridor:</span>
                      <div className="font-semibold text-slate-100">{selectedIncident.location.road_name}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Resolved Address:</span>
                      <div className="text-slate-300">{selectedIncident.location.resolved_address}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[9px]">LATITUDE</span>
                        <span className="text-sky-400">{selectedIncident.location.lat}</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[9px]">LONGITUDE</span>
                        <span className="text-sky-400">{selectedIncident.location.lng}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Officer Assignment */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-200">Incident Details & Observations</div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIncident.description}</p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-300 font-semibold">Assigned Field Officer:</span>
                    <select
                      value={selectedIncident.assigned_officer || ''}
                      onChange={(e) => handleAssignOfficer(selectedIncident.incident_id, e.target.value)}
                      className="bg-slate-900 border border-amber-500/40 text-amber-300 text-xs py-1.5 px-3 rounded-xl focus:outline-none cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {officers.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedIncident.incident_id, 'VERIFIED')}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Mark Verified
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedIncident.incident_id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Resolve Incident
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center justify-center text-slate-400 text-xs">
              Select an incident from the left list to inspect workflow details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

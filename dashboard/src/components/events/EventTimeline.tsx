import React, { useState } from 'react';
import { UrbanEvent } from '../../types';
import { Clock, Filter, AlertTriangle, Droplets, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  events: UrbanEvent[];
  onSelectEvent: (event: UrbanEvent) => void;
}

export const EventTimeline: React.FC<Props> = ({ events, onSelectEvent }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredEvents = events.filter((ev) => {
    if (filterType !== 'ALL' && ev.type !== filterType) return false;
    if (filterSeverity !== 'ALL' && ev.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'POTHOLE':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'WATERLOGGING':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'NEAR_MISS':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full">
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Live Event Feed
          </h3>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono">
            {filteredEvents.length}
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="POTHOLE">Potholes</option>
            <option value="WATERLOGGING">Waterlogging</option>
            <option value="NEAR_MISS">Near-Miss</option>
            <option value="DAMAGED_SIGN">Traffic Signs</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none"
          >
            <option value="ALL">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="mt-3 overflow-y-auto space-y-2 flex-1 pr-1 max-h-[380px]">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No events match the selected criteria.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.event_id}
              onClick={() => onSelectEvent(ev)}
              className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {getTypeIcon(ev.type)}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-200">{ev.type}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getSeverityBadge(ev.severity)}`}>
                      {ev.severity}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                      {(ev.confidence * 100).toFixed(0)}% Conf
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1 font-mono">
                    <span>{ev.bus_id}</span>
                    <span>•</span>
                    <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span className={ev.location?.lat ? 'text-emerald-400' : 'text-amber-400'}>
                      {ev.location?.lat ? 'GPS Locked' : 'GPS Unavailable'}
                    </span>
                  </div>

                  {ev.location?.resolved_address && (
                    <div className="text-[10px] text-sky-300 font-sans truncate max-w-xs mt-0.5" title={ev.location.resolved_address}>
                      📍 {ev.location.resolved_address}
                    </div>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

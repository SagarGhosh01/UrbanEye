import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { BusTelemetry, UrbanEvent, RoadSegment, HeatmapPoint } from '../../types';
import { Navigation, AlertTriangle, Droplets, ShieldAlert, Layers } from 'lucide-react';

interface Props {
  buses: BusTelemetry[];
  events: UrbanEvent[];
  roadSegments: RoadSegment[];
  heatmaps: HeatmapPoint[];
  selectedBusId: string;
  onBusSelect: (busId: string) => void;
  onEventClick: (event: UrbanEvent) => void;
}

// Custom Bus Marker Icon Generator
const createBusIcon = (busId: string, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        background: ${isSelected ? '#38bdf8' : '#0284c7'};
        border: 2px solid #ffffff;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(2, 132, 199, 0.8);
        cursor: pointer;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.8-.6-1.5-1.4-1.5L4 12.5C3.2 12.5 2.5 13.2 2.5 14c0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path><circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle>
        </svg>
      </div>
      <div style="
        position: absolute;
        top: 34px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.9);
        color: #f8fafc;
        font-size: 10px;
        font-family: monospace;
        font-weight: bold;
        padding: 1px 5px;
        border-radius: 4px;
        border: 1px solid #334155;
        white-space: nowrap;
      ">${busId}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Custom Hazard Marker Icon
const createHazardIcon = (type: string, severity: string) => {
  let color = '#f59e0b';
  if (type === 'POTHOLE') color = '#ef4444';
  if (type === 'WATERLOGGING') color = '#38bdf8';
  if (type === 'NEAR_MISS') color = '#f97316';

  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 6px;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px ${color};
        transform: rotate(45deg);
      ">
        <div style="transform: rotate(-45deg); width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export const GISMap: React.FC<Props> = ({
  buses,
  events,
  roadSegments,
  heatmaps,
  selectedBusId,
  onBusSelect,
  onEventClick
}) => {
  const [showBuses, setShowBuses] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showSegments, setShowSegments] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Delhi Transit center coordinates
  const centerLat = 28.6139;
  const centerLng = 77.2090;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full relative">
      {/* Map Header & Layer Toggles */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <Navigation className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              GIS Urban Sensing Command Map
            </h3>
            <p className="text-xs text-slate-400">
              Live PostGIS Spatial Tracking & Municipal Road Network Layers
            </p>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setShowBuses(!showBuses)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              showBuses ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800 text-slate-500'
            }`}
          >
            Buses ({buses.length})
          </button>
          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              showHazards ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-500'
            }`}
          >
            Hazards ({events.length})
          </button>
          <button
            onClick={() => setShowSegments(!showSegments)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              showSegments ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500'
            }`}
          >
            Road Segments ({roadSegments.length})
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              showHeatmap ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-500'
            }`}
          >
            Hotspots
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="mt-3 rounded-lg overflow-hidden border border-slate-800 flex-1 min-h-[380px] relative">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
        >
          {/* Dark Tile Layer (CartoDB Dark Matter) */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> | Bharat Electronics'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Road Segment Polylines */}
          {showSegments && roadSegments.map((seg) => {
            let color = '#10b981'; // Good (>=80)
            if (seg.condition_score < 50) color = '#ef4444'; // Urgent (<50)
            else if (seg.condition_score < 80) color = '#f59e0b'; // Watchlist (50-79)

            return (
              <Polyline
                key={seg.segment_id}
                positions={[
                  [seg.start_lat, seg.start_lng],
                  [seg.end_lat, seg.end_lng]
                ]}
                pathOptions={{ color: color, weight: 6, opacity: 0.85 }}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <strong className="text-slate-100 block text-sm">{seg.road_name}</strong>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Condition Score:</span>
                      <strong style={{ color }}>{seg.condition_score}/100</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Potholes / Waterlog:</span>
                      <span>{seg.pothole_count} / {seg.waterlogging_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Maintenance Priority:</span>
                      <span className="font-bold">{seg.maintenance_priority}</span>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* Heatmap / Hotspot Circles */}
          {showHeatmap && heatmaps.map((h, i) => (
            <CircleMarker
              key={`heat-${i}`}
              center={[h.lat, h.lng]}
              radius={h.weight * 9}
              pathOptions={{
                fillColor: h.type === 'POTHOLE' ? '#ef4444' : h.type === 'WATERLOGGING' ? '#38bdf8' : '#eab308',
                fillOpacity: 0.35,
                stroke: false
              }}
            />
          ))}

          {/* Active Roaming Bus Markers */}
          {showBuses && buses.map((bus) => {
            if (bus.current_lat === null || bus.current_lng === null) return null;
            return (
              <Marker
                key={bus.bus_id}
                position={[bus.current_lat, bus.current_lng]}
                icon={createBusIcon(bus.bus_id, bus.bus_id === selectedBusId)}
                eventHandlers={{
                  click: () => onBusSelect(bus.bus_id)
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <strong className="text-sky-400 block text-sm font-mono">{bus.bus_id}</strong>
                    <p className="text-slate-300 font-medium">{bus.route_name}</p>
                    <div className="flex justify-between pt-1 border-t border-slate-700">
                      <span className="text-slate-400">Speed:</span>
                      <strong className="text-slate-200">{bus.speed_kmh} km/h</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-emerald-400 font-bold">{bus.status}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Road Hazard Event Pins */}
          {showHazards && events.map((ev) => {
            if (!ev.location?.lat || !ev.location?.lng) return null;
            return (
              <Marker
                key={ev.event_id}
                position={[ev.location.lat, ev.location.lng]}
                icon={createHazardIcon(ev.type, ev.severity)}
                eventHandlers={{
                  click: () => onEventClick(ev)
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">{ev.type}</span>
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-1 py-0.5 rounded font-bold">
                        {ev.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 font-mono text-[10px]">{ev.event_id}</p>
                    <div className="text-slate-300">Confidence: <strong>{(ev.confidence * 100).toFixed(0)}%</strong></div>
                    <div className="text-slate-400 text-[10px]">Reported by: {ev.bus_id}</div>
                    <button
                      onClick={() => onEventClick(ev)}
                      className="mt-1.5 w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-1 rounded text-[11px]"
                    >
                      Inspect Evidence
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 space-y-1.5 shadow-xl pointer-events-auto">
          <div className="font-bold text-slate-200 uppercase tracking-wider mb-1">Map Legend</div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Bus Roaming Sensor</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded bg-red-500 rotate-45" />
            <span>Pothole / Road Damage</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded bg-sky-400 rotate-45" />
            <span>Waterlogging Alert</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-5 h-1 bg-emerald-500 rounded" />
            <span>Road Condition Good (≥80)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-5 h-1 bg-red-500 rounded" />
            <span>Road Condition Critical (&lt;50)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

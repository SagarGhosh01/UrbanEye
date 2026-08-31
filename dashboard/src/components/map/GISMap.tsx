import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BusTelemetry, UrbanEvent, RoadSegment, HeatmapPoint } from '../../types';
import { Navigation, AlertTriangle, Droplets, ShieldAlert, Layers, Crosshair, MapPin, ExternalLink } from 'lucide-react';

interface Props {
  buses: BusTelemetry[];
  events: UrbanEvent[];
  roadSegments: RoadSegment[];
  heatmaps: HeatmapPoint[];
  selectedBusId: string;
  onBusSelect: (busId: string) => void;
  onEventClick: (event: UrbanEvent) => void;
}

// Map Auto-Recenter Controller component
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [center[0], center[1], zoom]);
  return null;
};

// Custom Bus Marker Icon Generator
const createBusIcon = (busId: string, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        background: ${isSelected ? '#38bdf8' : '#0284c7'};
        border: 2px solid #ffffff;
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(2, 132, 199, 0.85);
        cursor: pointer;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.8-.6-1.5-1.4-1.5L4 12.5C3.2 12.5 2.5 13.2 2.5 14c0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path><circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle>
        </svg>
      </div>
      <div style="
        position: absolute;
        top: 36px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.95);
        color: #f8fafc;
        font-size: 10px;
        font-family: monospace;
        font-weight: bold;
        padding: 1px 6px;
        border-radius: 4px;
        border: 1px solid #38bdf8;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.6);
      ">${busId}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

// Custom Hazard Marker Icon
const createHazardIcon = (type: string, severity: string) => {
  let color = '#f59e0b';
  if (type === 'POTHOLE') color = '#ef4444';
  if (type === 'WATERLOGGING') color = '#38bdf8';
  if (type === 'NEAR_MISS') color = '#f97316';
  if (type === 'ANPR_ALERT') color = '#a855f7';

  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 6px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px ${color};
        transform: rotate(45deg);
        cursor: pointer;
      ">
        <div style="transform: rotate(-45deg); width: 7px; height: 7px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const GISMap: React.FC<Props> = ({
  buses,
  events,
  roadSegments,
  heatmaps,
  selectedBusId,
  onBusSelect,
  onEventClick,
}) => {
  const [showBuses, setShowBuses] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showSegments, setShowSegments] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeCenter, setActiveCenter] = useState<[number, number]>([28.6139, 77.2090]);

  // Find selected bus location
  const activeBus = buses.find((b) => b.bus_id === selectedBusId);

  // Recenter when active bus moves or is selected
  useEffect(() => {
    if (activeBus && activeBus.current_lat && activeBus.current_lng) {
      setActiveCenter([activeBus.current_lat, activeBus.current_lng]);
    }
  }, [activeBus?.current_lat, activeBus?.current_lng, selectedBusId]);

  // 1-Click Locate User Location
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setActiveCenter(coords);
        },
        (err) => console.log('Location error:', err),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full relative overflow-hidden">
      {/* Map Header & Layer Toggles */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shrink-0">
            <Navigation className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide truncate">
              GIS Urban Sensing Command Map
            </h3>
            <p className="text-xs text-slate-400 truncate">
              High-Precision Sub-Meter PostGIS Spatial Geotagging & Corridors
            </p>
          </div>
        </div>

        {/* Layer Controls & Locate Button */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={handleLocateMe}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded transition-all"
            title="Locate My Exact Position"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowBuses(!showBuses)}
            className={`px-2 py-1 rounded font-medium transition-all ${
              showBuses ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800 text-slate-500'
            }`}
          >
            Buses ({buses.length})
          </button>

          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2 py-1 rounded font-medium transition-all ${
              showHazards ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-500'
            }`}
          >
            Incidents ({events.length})
          </button>

          <button
            onClick={() => setShowSegments(!showSegments)}
            className={`px-2 py-1 rounded font-medium transition-all ${
              showSegments ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500'
            }`}
          >
            Corridors
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 rounded font-medium transition-all ${
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
          center={activeCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
        >
          {/* Dynamic Fly-To Controller */}
          <MapRecenter center={activeCenter} />

          {/* Standard OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Bharat Electronics'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Road Segment Polylines */}
          {showSegments &&
            roadSegments.map((seg) => {
              let color = '#10b981';
              if (seg.condition_score < 50) color = '#ef4444';
              else if (seg.condition_score < 80) color = '#f59e0b';

              return (
                <Polyline
                  key={seg.segment_id}
                  positions={[
                    [seg.start_lat, seg.start_lng],
                    [seg.end_lat, seg.end_lng],
                  ]}
                  pathOptions={{ color: color, weight: 6, opacity: 0.85 }}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 text-xs min-w-[180px]">
                      <strong className="text-slate-100 block text-sm">{seg.road_name}</strong>
                      <span className="text-[10px] text-slate-400 font-mono block">{seg.segment_id}</span>
                      <div className="flex justify-between border-t border-slate-700 pt-1">
                        <span className="text-slate-400">Condition Score:</span>
                        <strong style={{ color }}>{seg.condition_score}/100</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Potholes / Floods:</span>
                        <span className="font-mono">{seg.pothole_count} / {seg.waterlogging_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Priority:</span>
                        <span className="font-bold">{seg.maintenance_priority}</span>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

          {/* Heatmap Hotspot Circles */}
          {showHeatmap &&
            heatmaps.map((h, i) => (
              <CircleMarker
                key={`heat-${i}`}
                center={[h.lat, h.lng]}
                radius={h.weight * 9}
                pathOptions={{
                  fillColor: h.type === 'POTHOLE' ? '#ef4444' : h.type === 'WATERLOGGING' ? '#38bdf8' : '#eab308',
                  fillOpacity: 0.35,
                  stroke: false,
                }}
              />
            ))}

          {/* User Current Live Location Pin */}
          {userLocation && (
            <>
              <Circle
                center={userLocation}
                radius={25}
                pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.2 }}
              />
              <Marker
                position={userLocation}
                icon={L.divIcon({
                  className: 'user-loc-marker',
                  html: `
                    <div style="background:#0284c7; border:3px solid #ffffff; width:18px; height:18px; border-radius:50%; box-shadow:0 0 12px #38bdf8;"></div>
                  `,
                  iconSize: [18, 18],
                  iconAnchor: [9, 9],
                })}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <strong className="text-sky-400 block">Your Current Location</strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Active Roaming Bus Markers */}
          {showBuses &&
            buses.map((bus) => {
              if (bus.current_lat === null || bus.current_lng === null) return null;
              return (
                <React.Fragment key={bus.bus_id}>
                  {/* Accuracy radius ring */}
                  <Circle
                    center={[bus.current_lat, bus.current_lng]}
                    radius={15}
                    pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.15, weight: 1 }}
                  />
                  <Marker
                    position={[bus.current_lat, bus.current_lng]}
                    icon={createBusIcon(bus.bus_id, bus.bus_id === selectedBusId)}
                    eventHandlers={{
                      click: () => onBusSelect(bus.bus_id),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1.5 text-xs min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <strong className="text-sky-400 font-mono text-sm">{bus.bus_id}</strong>
                          <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            {bus.status}
                          </span>
                        </div>
                        <p className="text-slate-300 font-semibold">{bus.route_name}</p>
                        <div className="text-[11px] text-slate-400 font-mono space-y-0.5 pt-1 border-t border-slate-700">
                          <div>Speed: <strong className="text-slate-200">{bus.speed_kmh} km/h</strong></div>
                          <div>Coordinates: <span className="text-sky-300">{bus.current_lat.toFixed(6)}, {bus.current_lng.toFixed(6)}</span></div>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${bus.current_lat},${bus.current_lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center justify-center space-x-1 w-full bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] py-1 rounded border border-slate-700 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open in Google Maps</span>
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}

          {/* Road Hazard Event Pins with Detailed Physical Address Popups */}
          {showHazards &&
            events.map((ev) => {
              if (!ev.location?.lat || !ev.location?.lng) return null;
              return (
                <Marker
                  key={ev.event_id}
                  position={[ev.location.lat, ev.location.lng]}
                  icon={createHazardIcon(ev.type, ev.severity)}
                  eventHandlers={{
                    click: () => onEventClick(ev),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-2 text-xs min-w-[220px]">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                        <span className="font-bold text-amber-400 text-sm flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-red-400" />
                          {ev.type}
                        </span>
                        <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold border border-red-500/40">
                          {ev.severity}
                        </span>
                      </div>

                      {/* Exact Physical Address */}
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">EXACT ADDRESS:</span>
                        <span className="text-slate-100 font-semibold text-xs leading-tight block">
                          {ev.location.resolved_address || 'Central Transit Corridor, New Delhi'}
                        </span>
                      </div>

                      {/* Precision Coordinates */}
                      <div className="bg-slate-950 p-1.5 rounded font-mono text-[10px] text-slate-300 space-y-0.5">
                        <div className="text-emerald-400">
                          GPS: {ev.location.lat.toFixed(6)}° N, {ev.location.lng.toFixed(6)}° E
                        </div>
                        <div className="text-slate-400">Lock Accuracy: ±{ev.location.accuracy_m || 5.0}m</div>
                        <div className="text-slate-400">Sensor Unit: {ev.bus_id} ({ev.camera_id})</div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1.5 pt-1">
                        <button
                          onClick={() => onEventClick(ev)}
                          className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-1.5 rounded text-[11px] transition-colors"
                        >
                          Inspect Evidence
                        </button>
                        <a
                          href={`https://www.google.com/maps?q=${ev.location.lat},${ev.location.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded transition-colors"
                          title="Open in Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {/* Floating Map Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 space-y-1.5 shadow-xl pointer-events-auto">
          <div className="font-bold text-slate-200 uppercase tracking-wider mb-1">GIS Map Legend</div>
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

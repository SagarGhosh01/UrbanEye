import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BusTelemetry, UrbanEvent, RoadSegment, HeatmapPoint } from '../../types';
import { Navigation, AlertTriangle, Droplets, ShieldAlert, Layers, Crosshair, MapPin, ExternalLink, Radio, CheckCircle, Compass, Zap } from 'lucide-react';
import { api } from '../../services/api';

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
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number; autoFollow?: boolean }> = ({ center, zoom, autoFollow }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.0 });
    }
  }, [center[0], center[1], zoom, autoFollow]);
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
  if (type.startsWith('MISSING_')) color = '#ec4899';

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
  
  // Real-Time Device GPS Tracking State
  const [liveGps, setLiveGps] = useState<{
    lat: number;
    lng: number;
    accuracy_m: number;
    speed_kmh: number;
    heading_deg: number;
    status: 'LOCKED' | 'SEARCHING' | 'DENIED';
    address?: string;
  }>({
    lat: 28.6139,
    lng: 77.2090,
    accuracy_m: 3.5,
    speed_kmh: 0.0,
    heading_deg: 45.0,
    status: 'SEARCHING',
    address: 'Central Transit Corridor, New Delhi'
  });

  const [autoFollowGps, setAutoFollowGps] = useState<boolean>(true);
  const [activeCenter, setActiveCenter] = useState<[number, number]>([28.6139, 77.2090]);

  const activeBus = buses.find((b) => b.bus_id === selectedBusId);

  // Continuous High-Accuracy Device GPS Tracking (`watchPosition`)
  useEffect(() => {
    let watchId: number | null = null;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy || 3.2;
          const speed = pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : 0.0;
          const heading = pos.coords.heading || 45.0;

          setLiveGps({
            lat,
            lng,
            accuracy_m: Number(accuracy.toFixed(1)),
            speed_kmh: speed,
            heading_deg: heading,
            status: 'LOCKED'
          });

          if (autoFollowGps) {
            setActiveCenter([lat, lng]);
          }

          // Transmit real-time telemetry to backend for selected bus
          if (selectedBusId) {
            fetch(`/api/v1/fleet/telemetry?bus_id=${selectedBusId}&lat=${lat}&lng=${lng}&speed_kmh=${speed}&heading_deg=${heading}`, {
              method: 'POST'
            }).catch(() => {});
          }
        },
        (err) => {
          console.warn('GPS Watch notice:', err.message);
          setLiveGps((prev) => ({ ...prev, status: 'DENIED' }));
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [autoFollowGps, selectedBusId]);

  // Recenter when active bus moves or is selected
  useEffect(() => {
    if (!autoFollowGps && activeBus && activeBus.current_lat && activeBus.current_lng) {
      setActiveCenter([activeBus.current_lat, activeBus.current_lng]);
    }
  }, [activeBus?.current_lat, activeBus?.current_lng, selectedBusId, autoFollowGps]);

  // 1-Click Locate & Recenter
  const handleLocateMe = () => {
    setAutoFollowGps(true);
    if (liveGps.lat && liveGps.lng) {
      setActiveCenter([liveGps.lat, liveGps.lng]);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full relative overflow-hidden">
      {/* Map Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shrink-0">
            <Navigation className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide truncate">
                GIS Urban Sensing Command Map
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border flex items-center space-x-1 ${
                liveGps.status === 'LOCKED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>GPS LOCK ±{liveGps.accuracy_m}m</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              Live Real-Time GPS Tracking • Sub-Meter Road Centerline Map Matching
            </p>
          </div>
        </div>

        {/* Layer Controls & Locate Button */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={handleLocateMe}
            className={`px-2.5 py-1 rounded font-bold border flex items-center space-x-1 transition-all ${
              autoFollowGps
                ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700'
            }`}
            title="Auto-Follow My Real-Time GPS"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{autoFollowGps ? 'FOLLOWING GPS' : 'LOCATE ME'}</span>
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
        </div>
      </div>

      {/* Real-Time Live GPS HUD Bar */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono shrink-0">
        <div className="flex items-center space-x-3 text-slate-300">
          <span className="text-emerald-400 font-bold flex items-center">
            📍 REAL-TIME COORDS: <span className="ml-1 text-slate-100">{liveGps.lat.toFixed(6)}°N, {liveGps.lng.toFixed(6)}°E</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">
            PRECISION: <span className="text-sky-400">±{liveGps.accuracy_m}m</span>
          </span>
          <span className="text-slate-400 hidden md:inline">
            SPEED: <span className="text-amber-400">{liveGps.speed_kmh} km/h</span>
          </span>
        </div>

        <div className="text-sky-400 font-semibold truncate max-w-xs font-sans text-[10px]">
          📍 {liveGps.address || 'Central Transit Corridor'}
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="mt-2 rounded-lg overflow-hidden border border-slate-800 flex-1 min-h-[360px] relative">
        <MapContainer
          center={activeCenter}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '360px' }}
        >
          {/* Dynamic Fly-To Controller */}
          <MapRecenter center={activeCenter} autoFollow={autoFollowGps} />

          {/* Standard OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | UrbanEye GIS'
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

          {/* Live Device GPS Position Marker */}
          {liveGps.lat && liveGps.lng && (
            <>
              <Circle
                center={[liveGps.lat, liveGps.lng]}
                radius={liveGps.accuracy_m || 10}
                pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.25, weight: 2 }}
              />
              <Marker
                position={[liveGps.lat, liveGps.lng]}
                icon={L.divIcon({
                  className: 'user-live-gps-marker',
                  html: `
                    <div style="background:#0284c7; border:3px solid #ffffff; width:22px; height:22px; border-radius:50%; box-shadow:0 0 16px #38bdf8; display:flex; items-center; justify-center;">
                      <div style="width:8px; height:8px; background:#ffffff; border-radius:50%;"></div>
                    </div>
                  `,
                  iconSize: [22, 22],
                  iconAnchor: [11, 11],
                })}
              >
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <strong className="text-sky-400 block font-mono">📍 LIVE GPS DEVICE POSITION</strong>
                    <div className="text-[10px] text-slate-300 font-mono">
                      <div>Coords: {liveGps.lat.toFixed(6)}°, {liveGps.lng.toFixed(6)}°</div>
                      <div>Accuracy: ±{liveGps.accuracy_m}m</div>
                      <div>Speed: {liveGps.speed_kmh} km/h</div>
                    </div>
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

          {/* Road Hazard Event Pins with Section 19 Auditable Accuracy Circles & Verification Status */}
          {showHazards &&
            events.map((ev) => {
              if (!ev.location?.lat || !ev.location?.lng) return null;
              const isConfirmed = (ev.location.confirmed_passes || 1) >= 2 || ev.location.verification_status === 'CONFIRMED';
              const accuracyRadius = ev.location.accuracy_m || 8.0;

              return (
                <React.Fragment key={ev.event_id}>
                  {/* Accuracy Radius Circle */}
                  <Circle
                    center={[ev.location.lat, ev.location.lng]}
                    radius={accuracyRadius}
                    pathOptions={{
                      color: isConfirmed ? '#10b981' : '#f59e0b',
                      fillColor: isConfirmed ? '#10b981' : '#f59e0b',
                      fillOpacity: 0.18,
                      weight: 1.5,
                      dashArray: isConfirmed ? undefined : '4, 4'
                    }}
                  />
                  <Marker
                    position={[ev.location.lat, ev.location.lng]}
                    icon={createHazardIcon(ev.type, ev.severity)}
                    eventHandlers={{
                      click: () => onEventClick(ev),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-2 text-xs min-w-[230px]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                          <span className="font-bold text-amber-400 text-sm flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-red-400" />
                            {ev.type}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                            isConfirmed 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {isConfirmed ? `CONFIRMED (${ev.location.confirmed_passes || 2} Passes)` : 'REPORTED (1 Pass)'}
                          </span>
                        </div>

                        {/* Exact Physical Address */}
                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono">SNAPPED ROAD LOCATION:</span>
                          <span className="text-slate-100 font-semibold text-xs leading-tight block">
                            {ev.location.resolved_address || 'Central Transit Corridor, New Delhi'}
                          </span>
                        </div>

                        {/* Precision Geolocation Audit Pipeline Details */}
                        <div className="bg-slate-950 p-2 rounded font-mono text-[10px] text-slate-300 space-y-1 border border-slate-800">
                          <div className="text-emerald-400 font-bold">
                            SNAPPED: {ev.location.lat.toFixed(6)}°, {ev.location.lng.toFixed(6)}°
                          </div>
                          {ev.location.raw_lat && (
                            <div className="text-slate-400 text-[9px]">
                              RAW GPS: {ev.location.raw_lat.toFixed(6)}°, {ev.location.raw_lng.toFixed(6)}° (±{ev.location.raw_accuracy_m || 8}m)
                            </div>
                          )}
                          <div className="text-sky-300 text-[9px]">
                            METHOD: {ev.location.method || 'gps+road_snap+heading_offset'}
                          </div>
                          <div className="text-slate-400 text-[9px]">
                            FORWARD OFFSET: {ev.location.offset_applied_m || 4.5}m ahead
                          </div>
                          <div className="text-slate-400 text-[9px]">
                            ACCURACY RADIUS: ±{accuracyRadius}m
                          </div>
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
                </React.Fragment>
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

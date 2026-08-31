export type UserRole = 'viewer' | 'analyst' | 'admin' | 'law_enforcement_liaison';

export interface LocationData {
  lat: number | null;
  lng: number | null;
  accuracy_m?: number | null;
  status: 'LOCKED' | 'DEGRADED' | 'UNAVAILABLE';
}

export interface EvidenceData {
  thumbnail_base64?: string | null;
  clip_url?: string | null;
}

export interface EventMetadata {
  model_version?: string;
  edge_device_id?: string;
  bounding_boxes?: Array<{
    label: string;
    bbox: number[];
    conf: number;
  }>;
  extra?: Record<string, any>;
}

export interface UrbanEvent {
  event_id: string;
  type: 'POTHOLE' | 'WATERLOGGING' | 'DAMAGED_SIGN' | 'NEAR_MISS' | 'ILLEGAL_PARKING' | 'CONGESTION' | 'ANPR_ALERT';
  confidence: number;
  timestamp: string;
  location: LocationData;
  bus_id: string;
  camera_id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'REVIEWED' | 'DISPATCHED' | 'RESOLVED' | 'DISMISSED';
  evidence: EvidenceData;
  metadata: EventMetadata;
  anpr?: {
    plate: string;
    confidence: number;
  } | null;
}

export interface BusTelemetry {
  bus_id: string;
  registration_no?: string;
  route_name: string;
  status: string;
  current_lat: number | null;
  current_lng: number | null;
  speed_kmh: number;
  heading_deg: number;
  last_seen: string;
}

export interface EdgeDevice {
  device_id: string;
  bus_id: string;
  model_family: string;
  firmware_version: string;
  model_version: string;
  status: 'ONLINE' | 'BUFFERING_OFFLINE' | 'DEGRADED' | 'OFFLINE';
  cpu_usage_pct: number;
  gpu_usage_pct: number;
  temperature_c: number;
  storage_free_gb: number;
  buffered_events_count: number;
  last_heartbeat: string;
}

export interface RoadSegment {
  segment_id: string;
  road_name: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  pothole_count: number;
  waterlogging_count: number;
  condition_score: number;
  maintenance_priority: 'NORMAL' | 'WATCHLIST' | 'URGENT';
  last_inspected: string;
}

export interface ANPRRecord {
  id: string;
  event_id: string;
  registration_no: string;
  ocr_confidence: number;
  vehicle_type: string;
  is_flagged: boolean;
  flag_reason?: string | null;
  timestamp: string;
  bus_id: string;
  lat: number | null;
  lng: number | null;
  evidence_thumbnail?: string | null;
  evidence_clip_url?: string | null;
}

export interface KPISummary {
  active_buses_count: number;
  total_events_today: number;
  potholes_detected: number;
  waterlogging_detected: number;
  near_miss_incidents: number;
  total_vehicles_tracked: number;
  avg_traffic_density_index: number;
  bandwidth_savings_pct: number;
  system_health_status: string;
}

export interface BandwidthReport {
  raw_video_mb_est: number;
  actual_edge_mb: number;
  savings_percentage: number;
  events_transmitted: number;
  network_cost_saved_usd_est: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  type: string;
}

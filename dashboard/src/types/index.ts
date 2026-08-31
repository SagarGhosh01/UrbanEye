export type UserRole = 'viewer' | 'analyst' | 'admin' | 'law_enforcement_liaison';

export interface LocationData {
  lat: number | null;
  lng: number | null;
  accuracy_m?: number | null;
  status: 'LOCKED' | 'DEGRADED' | 'UNAVAILABLE';
  resolved_address?: string | null;
  road_name?: string | null;
  locality?: string | null;
  city?: string | null;
  postal_code?: string | null;
  maps_url?: string | null;
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
  type: 'POTHOLE' | 'WATERLOGGING' | 'DAMAGED_SIGN' | 'NEAR_MISS' | 'ILLEGAL_PARKING' | 'CONGESTION' | 'ANPR_ALERT' | 'ROAD_SURFACE_EROSION';
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

export interface MunicipalTicket {
  ticket_id: string;
  event_id: string;
  hazard_type: string;
  severity: string;
  consensus_score: number;
  sightings_count: number;
  buses_involved: string[];
  location: {
    lat: number | null;
    lng: number | null;
  };
  road_name: string;
  estimated_area_sqm: number;
  estimated_asphalt_m3: number;
  estimated_repair_cost_inr: number;
  sla_deadline_hours: number;
  sha256_hash: string;
  chain_of_custody_signature: string;
  status: string;
  created_at: string;
}

export interface EmissionsReport {
  excess_fuel_consumed_litres: number;
  excess_co2_emitted_kg: number;
  co2_reduction_potential_kg: number;
  economic_fuel_loss_inr: number;
  green_fleet_score: number;
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
  ward_id: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  condition_score: number;
  pothole_count: number;
  waterlogging_count: number;
  maintenance_priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'WATCHLIST';
  last_surveyed: string;
  geometry_geojson?: any;
}

export interface ANPRRecord {
  record_id?: string;
  id: string;
  plate_number?: string;
  registration_no: string;
  confidence?: number;
  ocr_confidence: number;
  is_readable?: boolean;
  bus_id: string;
  vehicle_type: string;
  is_flagged: boolean;
  flag_reason?: string;
  location?: LocationData;
  timestamp: string;
  flag_status?: 'HOTLIST_MATCH' | 'EXPIRED_PUC' | 'CLEAN';
}

export interface KPISummary {
  total_fleet_buses: number;
  active_buses_count: number;
  active_transmitting_nodes: number;
  total_events_detected_today: number;
  total_events_today: number;
  potholes_detected: number;
  waterlogging_detected: number;
  total_vehicles_tracked: number;
  citywide_road_health_index: number;
  anpr_plates_scanned: number;
  bandwidth_reduction_pct: number;
  bandwidth_savings_pct: number;
}

export interface BandwidthReport {
  edge_events_uploaded: number;
  raw_video_bandwidth_mb: number;
  raw_video_mb_est: number;
  edge_metadata_bandwidth_mb: number;
  actual_edge_mb: number;
  bandwidth_savings_pct: number;
  savings_percentage: number;
  network_cost_saved_usd_est: number;
  reduction_ratio: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  weight: number;
  type: string;
}

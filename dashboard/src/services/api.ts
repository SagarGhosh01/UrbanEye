import axios from 'axios';
import { 
  UrbanEvent, 
  BusTelemetry, 
  EdgeDevice, 
  RoadSegment, 
  ANPRRecord, 
  KPISummary, 
  BandwidthReport, 
  HeatmapPoint,
  MunicipalTicket,
  EmissionsReport
} from '../types';

const getApiBase = () => {
  return '/api/v1';
};

const apiClient = axios.create({
  baseURL: getApiBase(),
  timeout: 8000,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBase();
  return config;
});

export const api = {
  // Authentication & token storage
  async login(username: string, password: string) {
    const res = await apiClient.post('/auth/login-json', { username, password });
    if (res.data.access_token) {
      localStorage.setItem('urbaneye_token', res.data.access_token);
      localStorage.setItem('urbaneye_role', res.data.role);
    }
    return res.data;
  },

  getAuthHeader() {
    const token = localStorage.getItem('urbaneye_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Analytics & KPIs
  async getKPIs(): Promise<KPISummary> {
    const res = await apiClient.get('/analytics/kpis');
    return res.data;
  },

  async getHeatmaps(): Promise<HeatmapPoint[]> {
    const res = await apiClient.get('/analytics/heatmaps');
    return res.data;
  },

  async getRoadSegments(): Promise<RoadSegment[]> {
    const res = await apiClient.get('/analytics/road-segments');
    return res.data;
  },

  async getBandwidthReport(): Promise<BandwidthReport> {
    const res = await apiClient.get('/analytics/bandwidth');
    return res.data;
  },

  // Events
  async getEvents(params?: { type?: string; severity?: string; status?: string; bus_id?: string; limit?: number }): Promise<UrbanEvent[]> {
    const res = await apiClient.get('/events', { params });
    return res.data;
  },

  async updateEventStatus(eventId: string, status: string): Promise<any> {
    const res = await apiClient.patch(`/events/${eventId}/status`, { status }, {
      headers: this.getAuthHeader()
    });
    return res.data;
  },

  // Fleet & Hardware
  async getBuses(): Promise<BusTelemetry[]> {
    const res = await apiClient.get('/fleet/buses');
    return res.data;
  },

  async getDevices(): Promise<EdgeDevice[]> {
    const res = await apiClient.get('/fleet/devices');
    return res.data;
  },

  // ANPR Console (Restricted)
  async getANPRRecords(isFlagged?: boolean): Promise<ANPRRecord[]> {
    const res = await apiClient.get('/anpr/records', {
      params: isFlagged !== undefined ? { is_flagged: isFlagged } : {},
      headers: this.getAuthHeader()
    });
    return res.data;
  },

  async flagANPRRecord(anprId: string, reason: string): Promise<any> {
    const res = await apiClient.post(`/anpr/flag/${anprId}`, null, {
      params: { reason },
      headers: this.getAuthHeader()
    });
    return res.data;
  },

  // Simulator Triggers
  async injectHazard(hazardType: string, severity: string = 'HIGH', busId: string = 'BUS-101'): Promise<any> {
    const res = await apiClient.post('/simulator/inject-hazard', null, {
      params: { hazard_type: hazardType, severity, bus_id: busId }
    });
    return res.data;
  },

  async tickFleet(): Promise<any> {
    const res = await apiClient.post('/simulator/tick-fleet');
    return res.data;
  },

  async toggleNetwork(deviceId: string, simulateOffline: boolean): Promise<any> {
    const res = await apiClient.post('/simulator/toggle-network', null, {
      params: { device_id: deviceId, simulate_offline: simulateOffline }
    });
    return res.data;
  },

  // Municipal Tickets & Work-Orders
  async getTickets(): Promise<MunicipalTicket[]> {
    const res = await apiClient.get('/tickets');
    return res.data;
  },

  async generateTicket(req: {
    event_id: string;
    hazard_type: string;
    severity: string;
    lat?: number | null;
    lng?: number | null;
    buses?: string[];
    road_name?: string;
  }): Promise<MunicipalTicket> {
    const res = await apiClient.post('/tickets/generate', req);
    return res.data;
  },

  async getEmissionsReport(totalVehicles: number = 450, totalPotholes: number = 8): Promise<EmissionsReport> {
    const res = await apiClient.get('/tickets/emissions-report', {
      params: { total_vehicles: totalVehicles, total_potholes: totalPotholes }
    });
    return res.data;
  },

  // Grad-CAM Explainability
  async getGradCam(imageBase64: string, bbox?: number[]): Promise<{
    heatmap_base64: string;
    overlay_base64: string;
    saliency_peak_activation: number;
    decision_factors: Array<{ feature: string; weight: number }>;
  }> {
    const res = await apiClient.post('/explainability/generate-gradcam', {
      image_base64: imageBase64,
      bbox: bbox
    });
    return res.data;
  }
};

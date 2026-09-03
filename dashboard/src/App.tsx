import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';

// 19 Module Views
import { CommandCenterView } from './components/dashboard/CommandCenterView';
import { LiveCameraFeed } from './components/vision/LiveCameraFeed';
import { PhoneCameraStreamer } from './components/phone/PhoneCameraStreamer';
import { FleetManagementView } from './components/fleet/FleetManagementView';
import { GISMapView } from './components/map/GISMapView';
import { IncidentManagementView } from './components/incidents/IncidentManagementView';
import { InfrastructureManagementView } from './components/infrastructure/InfrastructureManagementView';
import { TrafficIntelligenceView } from './components/traffic/TrafficIntelligenceView';
import { AIInsightsView } from './components/insights/AIInsightsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { RouteIntelligenceView } from './components/routes/RouteIntelligenceView';
import { FleetCoverageView } from './components/coverage/FleetCoverageView';
import { ANPRInvestigationView } from './components/anpr/ANPRInvestigationView';
import { AlertsCenterView } from './components/alerts/AlertsCenterView';
import { ReportsView } from './components/reports/ReportsView';
import { UserManagementView } from './components/users/UserManagementView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { UserProfileView } from './components/profile/UserProfileView';

import { EventDetailModal } from './components/events/EventDetailModal';
import { PilotDemoControls } from './components/demo/PilotDemoControls';
import { api } from './services/api';
import { realtimeService } from './services/websocket';
import { 
  UrbanEvent, 
  BusTelemetry, 
  EdgeDevice, 
  RoadSegment, 
  ANPRRecord, 
  KPISummary, 
  BandwidthReport, 
  HeatmapPoint, 
  UserRole,
  NavigationTab,
  IncidentItem
} from './types';
import { Smartphone, QrCode } from 'lucide-react';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('transport_authority');
  const [activeTab, setActiveTab] = useState<NavigationTab>('command_center');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const [showPhoneStreamer, setShowPhoneStreamer] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // State
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [buses, setBuses] = useState<BusTelemetry[]>([]);
  const [devices, setDevices] = useState<EdgeDevice[]>([]);
  const [events, setEvents] = useState<UrbanEvent[]>([]);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [heatmaps, setHeatmaps] = useState<HeatmapPoint[]>([]);

  const [selectedBusId, setSelectedBusId] = useState<string>('BUS-102');
  const [inspectingEvent, setInspectingEvent] = useState<UrbanEvent | null>(null);

  // Sample Incidents
  const [incidents] = useState<IncidentItem[]>([
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
      description: 'Severe road pothole detected by 4 buses.'
    },
    {
      incident_id: 'INC-8091',
      type: 'WATERLOGGING_SEVERE',
      severity: 'HIGH',
      status: 'UNDER_REVIEW',
      ai_confidence: 89.6,
      bus_id: 'BUS-105',
      camera_id: 'CAM-FRONT-02',
      location: { lat: 22.5411, lng: 88.3912, road_name: 'Park Circus Connector' },
      timestamp: '2026-09-02 18:25:40',
      assigned_officer: 'Officer Raj Kumar',
      description: 'Waterlogging accumulating across 2 lanes.'
    }
  ]);

  // Load initial data
  const loadData = async () => {
    try {
      const [kpiRes, busRes, devRes, evRes, segRes, heatRes] = await Promise.allSettled([
        api.getKPIs(),
        api.getBuses(),
        api.getDevices(),
        api.getEvents({ limit: 50 }),
        api.getRoadSegments(),
        api.getHeatmaps()
      ]);

      if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value);
      if (busRes.status === 'fulfilled') setBuses(busRes.value);
      if (devRes.status === 'fulfilled') setDevices(devRes.value);
      if (evRes.status === 'fulfilled') setEvents(evRes.value);
      if (segRes.status === 'fulfilled') setRoadSegments(segRes.value);
      if (heatRes.status === 'fulfilled') setHeatmaps(heatRes.value);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRole]);

  // Subscribe to real-time WebSockets
  useEffect(() => {
    const unsubEvents = realtimeService.subscribe('events', (msg) => {
      if (msg.action === 'new_event') {
        const newEv: UrbanEvent = msg.data;
        setEvents((prev) => [newEv, ...prev.slice(0, 49)]);
        setKpis((prev) => prev ? {
          ...prev,
          total_events_today: prev.total_events_today + 1,
          potholes_detected: newEv.type === 'POTHOLE' ? prev.potholes_detected + 1 : prev.potholes_detected,
          waterlogging_detected: newEv.type === 'WATERLOGGING' ? prev.waterlogging_detected + 1 : prev.waterlogging_detected,
        } : null);
      }
    });

    const unsubTelemetry = realtimeService.subscribe('telemetry', (msg) => {
      if (msg.action === 'bus_update') {
        const updated = msg.data;
        setBuses((prev) => prev.map((b) => b.bus_id === updated.bus_id ? { ...b, ...updated } : b));
      }
    });

    return () => {
      unsubEvents();
      unsubTelemetry();
    };
  }, []);

  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    try {
      await api.updateEventStatus(eventId, newStatus);
      setEvents((prev) => prev.map((e) => e.event_id === eventId ? { ...e, status: newStatus as any } : e));
      if (inspectingEvent && inspectingEvent.event_id === eventId) {
        setInspectingEvent({ ...inspectingEvent, status: newStatus as any });
      }
    } catch (e) {
      console.error('Failed to update event status:', e);
    }
  };

  // If in Phone Camera streamer mode, render full-screen streamer
  if (showPhoneStreamer) {
    return <PhoneCameraStreamer onBackToDashboard={() => setShowPhoneStreamer(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. Collapsible Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        currentRole={currentRole}
        onOpenAuth={() => setShowAuthModal(true)}
        unreadAlertsCount={2}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          activeBusesCount={buses.length || 24}
          isConnected={isConnected}
          demoMode={demoMode}
          setDemoMode={setDemoMode}
        />

        <main className="flex-1 p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full">

          {/* Quick Phone Streamer Launcher Bar */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="font-bold text-emerald-400">Mobile Optical Sensor Mode:</span>
              <span className="text-slate-400">Transform any smartphone rear camera into a live bus YOLO sensor node</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPhoneStreamer(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow-md transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Launch Smartphone Bus Camera</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                title="Mobile Wi-Fi Connection QR"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 19 Module Views Render Switcher */}
          {activeTab === 'command_center' && (
            <CommandCenterView
              kpis={kpis}
              buses={buses}
              events={events}
              incidents={incidents}
              onNavigate={setActiveTab}
              onSelectEvent={setInspectingEvent}
              onStartDemo={() => setDemoMode(true)}
            />
          )}

          {activeTab === 'live_bus' && (
            <div className="h-[620px]">
              <LiveCameraFeed
                selectedBusId={selectedBusId}
                onBusSelect={setSelectedBusId}
                buses={buses}
                onOpenPhoneMode={() => setShowPhoneStreamer(true)}
              />
            </div>
          )}

          {activeTab === 'fleet' && (
            <FleetManagementView buses={buses} onNavigate={setActiveTab} />
          )}

          {activeTab === 'gis_map' && (
            <GISMapView
              buses={buses}
              events={events}
              roadSegments={roadSegments}
              heatmaps={heatmaps}
              selectedBusId={selectedBusId}
              onBusSelect={setSelectedBusId}
              onEventClick={setInspectingEvent}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentManagementView currentRole={currentRole} />
          )}

          {activeTab === 'infrastructure' && (
            <InfrastructureManagementView currentRole={currentRole} />
          )}

          {activeTab === 'traffic' && (
            <TrafficIntelligenceView />
          )}

          {activeTab === 'ai_insights' && (
            <AIInsightsView onNavigate={setActiveTab} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'routes' && (
            <RouteIntelligenceView onNavigate={setActiveTab} />
          )}

          {activeTab === 'coverage' && (
            <FleetCoverageView />
          )}

          {activeTab === 'anpr' && (
            <ANPRInvestigationView currentRole={currentRole} />
          )}

          {activeTab === 'alerts' && (
            <AlertsCenterView onNavigate={setActiveTab} />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'users' && (
            <UserManagementView currentRole={currentRole} />
          )}

          {activeTab === 'audit_logs' && (
            <AuditLogsView />
          )}

          {activeTab === 'settings' && (
            <SystemSettingsView />
          )}

          {activeTab === 'profile' && (
            <UserProfileView currentRole={currentRole} onOpenAuth={() => setShowAuthModal(true)} />
          )}
        </main>
      </div>

      {/* Auth & Role Gateway Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
      />

      {/* QR Connect Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="p-3 bg-sky-500/10 rounded-full border border-sky-500/30 w-14 h-14 mx-auto flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-sky-400" />
            </div>
            <h3 className="font-bold text-slate-100 text-lg">Use Smartphone as Mobile Bus Camera</h3>
            <p className="text-xs text-slate-400">
              Open your mobile browser on local Wi-Fi and navigate to:
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-emerald-400 font-bold select-all">
              https://10.16.41.204:5173
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Evidence Inspection Modal */}
      {inspectingEvent && (
        <EventDetailModal
          event={inspectingEvent}
          onClose={() => setInspectingEvent(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

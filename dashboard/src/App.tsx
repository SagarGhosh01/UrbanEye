import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { FleetOverviewCards } from './components/fleet/FleetOverviewCards';
import { LiveCameraFeed } from './components/vision/LiveCameraFeed';
import { GISMap } from './components/map/GISMap';
import { EventTimeline } from './components/events/EventTimeline';
import { EventDetailModal } from './components/events/EventDetailModal';
import { RoadConditionBoard } from './components/analytics/RoadConditionBoard';
import { BandwidthSavingsGauge } from './components/analytics/BandwidthSavingsGauge';
import { ANPRReviewConsole } from './components/anpr/ANPRReviewConsole';
import { FleetDeviceHealth } from './components/fleet/FleetDeviceHealth';
import { PilotDemoControls } from './components/demo/PilotDemoControls';
import { PhoneCameraStreamer } from './components/phone/PhoneCameraStreamer';
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
  UserRole 
} from './types';
import { Eye, ShieldAlert, Cpu, Activity, Smartphone, QrCode } from 'lucide-react';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'main' | 'anpr' | 'devices' | 'analytics'>('main');
  const [showPhoneStreamer, setShowPhoneStreamer] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // State
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [buses, setBuses] = useState<BusTelemetry[]>([]);
  const [devices, setDevices] = useState<EdgeDevice[]>([]);
  const [events, setEvents] = useState<UrbanEvent[]>([]);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [heatmaps, setHeatmaps] = useState<HeatmapPoint[]>([]);
  const [bandwidthReport, setBandwidthReport] = useState<BandwidthReport | null>(null);
  const [anprRecords, setAnprRecords] = useState<ANPRRecord[]>([]);

  const [selectedBusId, setSelectedBusId] = useState<string>('BUS-101');
  const [inspectingEvent, setInspectingEvent] = useState<UrbanEvent | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      const [kpiRes, busRes, devRes, evRes, segRes, heatRes, bwRes] = await Promise.allSettled([
        api.getKPIs(),
        api.getBuses(),
        api.getDevices(),
        api.getEvents({ limit: 50 }),
        api.getRoadSegments(),
        api.getHeatmaps(),
        api.getBandwidthReport()
      ]);

      if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value);
      if (busRes.status === 'fulfilled') setBuses(busRes.value);
      if (devRes.status === 'fulfilled') setDevices(devRes.value);
      if (evRes.status === 'fulfilled') setEvents(evRes.value);
      if (segRes.status === 'fulfilled') setRoadSegments(segRes.value);
      if (heatRes.status === 'fulfilled') setHeatmaps(heatRes.value);
      if (bwRes.status === 'fulfilled') setBandwidthReport(bwRes.value);

      if (currentRole === 'law_enforcement_liaison' || currentRole === 'admin') {
        try {
          const anprRes = await api.getANPRRecords();
          setAnprRecords(anprRes);
        } catch (e) {
          // Gated
        }
      }
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

  const handleFlagANPR = async (anprId: string, reason: string) => {
    try {
      await api.flagANPRRecord(anprId, reason);
      setAnprRecords((prev) => prev.map((r) => r.id === anprId ? { ...r, is_flagged: true, flag_reason: reason } : r));
    } catch (e) {
      console.error('Failed to flag ANPR record:', e);
    }
  };

  // If in Phone Camera mode, render the full-screen Phone Streamer
  if (showPhoneStreamer) {
    return <PhoneCameraStreamer onBackToDashboard={() => setShowPhoneStreamer(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeBusesCount={buses.length || 5}
        isConnected={isConnected}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
      />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-4">
        {/* Pilot Demo Mode Panel */}
        {demoMode && <PilotDemoControls onRefresh={loadData} />}

        {/* Top Fleet KPI Cards */}
        <FleetOverviewCards kpis={kpis} />

        {/* View Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'main'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>GIS Map & Live Vision</span>
            </button>

            <button
              onClick={() => setActiveTab('anpr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'anpr'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ANPR & Incident Console</span>
            </button>

            <button
              onClick={() => setActiveTab('devices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'devices'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Edge Hardware Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Municipal Road Quality</span>
            </button>
          </div>

          {/* Phone as Bus Camera Launcher */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPhoneStreamer(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch Phone Bus Camera</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title="Connect Mobile via Wi-Fi"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        {activeTab === 'main' && (
          <div className="space-y-4">
            {/* Primary Grid: GIS Map + Live Camera */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 h-[460px]">
                <GISMap
                  buses={buses}
                  events={events}
                  roadSegments={roadSegments}
                  heatmaps={heatmaps}
                  selectedBusId={selectedBusId}
                  onBusSelect={setSelectedBusId}
                  onEventClick={setInspectingEvent}
                />
              </div>

              <div className="lg:col-span-5 h-[460px]">
                <LiveCameraFeed
                  selectedBusId={selectedBusId}
                  onBusSelect={setSelectedBusId}
                  buses={buses}
                  onOpenPhoneMode={() => setShowPhoneStreamer(true)}
                />
              </div>
            </div>

            {/* Secondary Grid: Event Timeline & Road Index & Bandwidth Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 h-[380px]">
                <EventTimeline
                  events={events}
                  onSelectEvent={setInspectingEvent}
                />
              </div>

              <div className="lg:col-span-4 h-[380px]">
                <RoadConditionBoard
                  segments={roadSegments}
                />
              </div>

              <div className="lg:col-span-3 h-[380px]">
                <BandwidthSavingsGauge
                  report={bandwidthReport}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anpr' && (
          <div className="h-[600px]">
            <ANPRReviewConsole
              records={anprRecords}
              currentRole={currentRole}
              onFlagRecord={handleFlagANPR}
            />
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="h-[600px]">
            <FleetDeviceHealth
              devices={devices}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <RoadConditionBoard segments={roadSegments} />
            </div>
            <div className="lg:col-span-4">
              <BandwidthSavingsGauge report={bandwidthReport} />
            </div>
          </div>
        )}
      </main>

      {/* QR Code / Wi-Fi Connect Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="p-3 bg-sky-500/10 rounded-full border border-sky-500/30 w-14 h-14 mx-auto flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-sky-400" />
            </div>
            <h3 className="font-bold text-slate-100 text-lg">Use Your Phone as a Bus Camera</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open your phone's browser on the same Wi-Fi network and navigate to the address below. Your phone's rear camera and GPS will feed live directly into the YOLOv8 ML engine!
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-emerald-400 select-all space-y-1">
              <div className="text-xs text-slate-400">Wi-Fi Network Address:</div>
              <div className="font-bold text-base text-emerald-400">
                http://10.16.41.204:5173
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Or simply click <strong>"Launch Phone Bus Camera"</strong> on this device if your webcam/camera is connected!
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
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

import React, { useState, useEffect } from 'react';
import { syncWorker } from './src/services/SyncWorker';
import { inferenceEngine, OnDeviceDetection } from './src/services/InferenceEngine';

export const MobileUrbanEyeApp: React.FC = () => {
  const [deviceId, setDeviceId] = useState<string>('DEV-PHONE-90812');
  const [busRegNo, setBusRegNo] = useState<string>('RJ-14-PA-1001');
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [gpsStatus, setGpsStatus] = useState<string>('LOCKED (3.2m ACCURACY)');
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [recentDetections, setRecentDetections] = useState<any[]>([]);

  useEffect(() => {
    // Initial onboarding setup
    syncWorker.setConfig('http://10.16.41.204:8000', 'token_demo');

    // Simulate continuous 1-second on-device optical inference loop
    const interval = setInterval(async () => {
      if (isRecording) {
        const detections: OnDeviceDetection[] = await inferenceEngine.processFrame(null);
        if (detections.length > 0) {
          const det = detections[0];
          const newEv = {
            client_event_id: `MOB-${Date.now()}`,
            device_id: deviceId,
            bus_reg_no: busRegNo,
            hazard_type: det.hazard_type,
            confidence: det.confidence,
            gps: { lat: 26.9124, lng: 75.7873, accuracy: 3.2 },
            heading: 145.2,
            speed: 28.4,
            timestamp: new Date().toISOString(),
            measurements: det.measurements
          };
          syncWorker.enqueueEvent(newEv);
          setQueuedCount(syncWorker.getQueueCount());
          setRecentDetections((prev) => [newEv, ...prev.slice(0, 9)]);

          // Flush batch
          const res = await syncWorker.flushBatch();
          if (res.accepted > 0) {
            setQueuedCount(syncWorker.getQueueCount());
          }
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRecording, deviceId, busRegNo]);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', background: '#090d16', color: '#f1f5f9', minHeight: '100vh' }}>
      <div style={{ background: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, color: '#38bdf8' }}>📱 UrbanEye Mobile v2.0 (Android Driver HUD)</h1>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0 0' }}>
          On-Device Real-Time Neural Inference • Zero Frame Uploads
        </p>
      </div>

      {/* Driver Status Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 20 }}>
        <div style={{ background: '#0f172a', padding: 15, borderRadius: 12, border: '1px solid #334155' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>BOUND BUS REGISTRATION</span>
          <h2 style={{ margin: '5px 0 0 0', fontSize: 16, color: '#f59e0b' }}>{busRegNo}</h2>
        </div>

        <div style={{ background: '#0f172a', padding: 15, borderRadius: 12, border: '1px solid #334155' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>DEVICE UUID</span>
          <h2 style={{ margin: '5px 0 0 0', fontSize: 14, color: '#38bdf8' }}>{deviceId}</h2>
        </div>

        <div style={{ background: '#0f172a', padding: 15, borderRadius: 12, border: '1px solid #334155' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>GPS LOCK STATUS</span>
          <h2 style={{ margin: '5px 0 0 0', fontSize: 14, color: '#10b981' }}>{gpsStatus}</h2>
        </div>

        <div style={{ background: '#0f172a', padding: 15, borderRadius: 12, border: '1px solid #334155' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>OFFLINE QUEUE COUNT</span>
          <h2 style={{ margin: '5px 0 0 0', fontSize: 16, color: '#a855f7' }}>{queuedCount} Events</h2>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setIsRecording(!isRecording)}
          style={{
            padding: '12px 24px',
            borderRadius: 12,
            border: 'none',
            fontWeight: 'bold',
            color: '#fff',
            background: isRecording ? '#ef4444' : '#10b981',
            cursor: 'pointer'
          }}
        >
          {isRecording ? '⏹ Stop On-Device Sensor' : '▶ Start On-Device Sensor'}
        </button>
      </div>

      {/* Detections Log */}
      <div style={{ background: '#0f172a', padding: 20, borderRadius: 16, border: '1px solid #334155' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: 14, color: '#e2e8f0' }}>⚡ Recent Local On-Device Hazard Detections</h3>
        {recentDetections.map((det) => (
          <div key={det.client_event_id} style={{ padding: 12, background: '#1e293b', borderRadius: 8, marginBottom: 8, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#f43f5e' }}>{det.hazard_type}</strong>
              <span style={{ color: '#94a3b8', marginLeft: 10 }}>Confidence: {(det.confidence * 100).toFixed(1)}%</span>
              <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 3 }}>
                Lat: {det.gps.lat}, Lng: {det.gps.lng} • Bus: {det.bus_reg_no}
              </div>
            </div>
            <span style={{ fontSize: 10, background: '#10b98120', color: '#10b981', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>
              SYNCED
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileUrbanEyeApp;

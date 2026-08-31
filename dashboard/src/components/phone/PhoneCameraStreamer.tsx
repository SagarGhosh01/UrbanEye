import React, { useState, useEffect, useRef } from 'react';
import { Camera, Navigation, RefreshCw, Zap, Shield, Play, Square, Smartphone } from 'lucide-react';

interface Props {
  onBackToDashboard?: () => void;
}

export const PhoneCameraStreamer: React.FC<Props> = ({ onBackToDashboard }) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [busId, setBusId] = useState<string>('BUS-101');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number | null; lng: number | null; accuracy: number | null; speed: number | null }>({
    lat: null,
    lng: null,
    accuracy: null,
    speed: null,
  });
  const [latestInference, setLatestInference] = useState<{
    latency_ms: number;
    detections_count: number;
    plates: string[];
    potholes_count: number;
  }>({
    latency_ms: 0,
    detections_count: 0,
    plates: [],
    potholes_count: 0,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<number | null>(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Camera access denied or unavailable. Please grant camera permission.');
    }
  };

  // Watch GPS Geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed ? pos.coords.speed * 3.6 : 0,
          });
        },
        (err) => {
          console.warn('Geolocation warning:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Frame Capture & Inference Loop
  useEffect(() => {
    if (isStreaming) {
      captureIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (!blob) return;

          const formData = new FormData();
          formData.append('file', blob, 'frame.jpg');
          formData.append('bus_id', busId);
          if (gpsLocation.lat !== null && gpsLocation.lng !== null) {
            formData.append('lat', gpsLocation.lat.toString());
            formData.append('lng', gpsLocation.lng.toString());
            formData.append('accuracy_m', (gpsLocation.accuracy || 5.0).toString());
            formData.append('speed_kmh', (gpsLocation.speed || 0.0).toString());
          }

          try {
            const res = await fetch('http://localhost:8000/api/v1/phone/process-frame', {
              method: 'POST',
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              setLatestInference({
                latency_ms: data.latency_ms || 0,
                detections_count: data.detections?.length || 0,
                plates: data.anpr_results?.map((p: any) => p.plate) || [],
                potholes_count: data.hazards?.length || 0,
              });
            }
          } catch (e) {
            // Inference error
          }
        }, 'image/jpeg', 0.7);
      }, 120); // ~8 FPS transmission rate for optimal latency
    } else {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isStreaming, busId, gpsLocation]);

  const toggleStreaming = () => {
    if (isStreaming) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsStreaming(false);
    } else {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono selection:bg-sky-500 selection:text-white">
      {/* Top Phone HUD */}
      <header className="bg-slate-900/90 border-b border-slate-800 p-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wider">BEL MOBILE BUS EDGE</h1>
            <p className="text-[10px] text-slate-400">Phone-as-Bus Camera • Real YOLOv8 & OCR Stream</p>
          </div>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            ← Command Center
          </button>
        )}
      </header>

      {/* Main Viewfinder */}
      <main className="flex-1 p-3 flex flex-col space-y-3 max-w-2xl mx-auto w-full">
        {/* Video Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-800 aspect-[4/3] shadow-2xl flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* If not streaming, display start button */}
          {!isStreaming && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 bg-sky-500/10 rounded-full border border-sky-500/30 mb-4">
                <Camera className="w-10 h-10 text-sky-400" />
              </div>
              <h2 className="text-base font-bold text-slate-100 mb-1">Turn this Phone into a Bus Front Camera</h2>
              <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
                Mount your phone on the bus windshield or hold it pointing towards the road. Live video and GPS coordinates will be streamed to the central AI platform.
              </p>
              <button
                onClick={startCamera}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/30 flex items-center space-x-2 transition-all transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START LIVE BUS CAMERA</span>
              </button>
            </div>
          )}

          {/* Live In-Camera HUD Overlay */}
          {isStreaming && (
            <>
              {/* Top Left Status */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] space-y-0.5">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>TRANSMITTING • {busId}</span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  LATENCY: <span className="text-sky-400 font-bold">{latestInference.latency_ms}ms</span>
                </div>
              </div>

              {/* Top Right GPS Badge */}
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-right">
                <div className="flex items-center justify-end space-x-1.5 text-slate-300">
                  <Navigation className="w-3 h-3 text-sky-400" />
                  <span>{gpsLocation.lat ? 'GPS LOCKED' : 'SEARCHING GPS...'}</span>
                </div>
                {gpsLocation.lat && (
                  <div className="text-slate-400 text-[9px] font-mono">
                    {gpsLocation.lat.toFixed(5)}, {gpsLocation.lng?.toFixed(5)} (±{gpsLocation.accuracy?.toFixed(0)}m)
                  </div>
                )}
              </div>

              {/* Bottom Target Reticle */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">LIVE DETECTIONS</span>
                  <span className="font-bold text-emerald-400">
                    {latestInference.detections_count} Objects • {latestInference.potholes_count} Potholes
                  </span>
                </div>

                {latestInference.plates.length > 0 && (
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">SCANNED PLATE</span>
                    <span className="font-bold text-amber-400">{latestInference.plates[0]}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Camera & Sensor Controls */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Bus Assignment</span>
            <select
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none"
            >
              <option value="BUS-101">BUS-101 (Route 419: Connaught Place)</option>
              <option value="BUS-102">BUS-102 (Route 522: AIIMS)</option>
              <option value="BUS-204">BUS-204 (Route 764: Airport T3)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
                if (isStreaming) startCamera();
              }}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Flip Camera ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
            </button>

            <button
              onClick={toggleStreaming}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                isStreaming
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isStreaming ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isStreaming ? 'STOP STREAM' : 'START STREAM'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

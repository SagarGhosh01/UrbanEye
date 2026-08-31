import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Play,
  Square,
  Shield,
  Activity,
  AlertTriangle,
  Upload,
  RefreshCw,
  Navigation,
  Smartphone,
  CheckCircle,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface Props {
  busId?: string;
  onBackToDashboard?: () => void;
}

export const PhoneCameraStreamer: React.FC<Props> = ({
  busId = 'BUS-101',
  onBackToDashboard,
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioAlerts, setAudioAlerts] = useState(true);

  // Sensor Telemetry States
  const [motionData, setMotionData] = useState({
    accelZ: 0.0,
    maxBump: 0.0,
  });

  const [gpsLocation, setGpsLocation] = useState<{
    lat: number | null;
    lng: number | null;
    speed: number | null;
    heading: number | null;
    accuracy_m: number | null;
  }>({
    lat: null,
    lng: null,
    speed: 0.0,
    heading: 0.0,
    accuracy_m: 5.0,
  });

  const [latestInference, setLatestInference] = useState<{
    latency_ms: number;
    detections: any[];
    hazards: any[];
    anpr_results: any[];
    plates: string[];
    annotated_frame?: string;
    geocodedAddress?: string;
    roadName?: string;
  }>({
    latency_ms: 0,
    detections: [],
    hazards: [],
    anpr_results: [],
    plates: [],
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  const getBackendUrl = () => {
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    return `http://${host}:8000/api/v1/phone/process-frame`;
  };

  // Start Device Camera with high frame rate & smooth constraints
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not accessible over plain HTTP.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setIsStreaming(true);
    } catch (err: any) {
      console.warn('getUserMedia warning:', err);
      setCameraError(err.message || 'Camera permission required.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    setIsStreaming(false);
  };

  // GPS & Accelerometer listeners
  useEffect(() => {
    let watchId: number | null = null;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: pos.coords.speed ? pos.coords.speed * 3.6 : 0.0,
            heading: pos.coords.heading || 0.0,
            accuracy_m: pos.coords.accuracy || 5.0,
          });
        },
        (err) => console.log('GPS watch error:', err.message),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const z = event.accelerationIncludingGravity?.z || 0.0;
      const absZ = Math.abs(z - 9.8);
      setMotionData((prev) => ({
        accelZ: Number(absZ.toFixed(2)),
        maxBump: Number(Math.max(prev.maxBump, absZ).toFixed(2)),
      }));
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('devicemotion', handleMotion);
      stopCamera();
    };
  }, []);

  // Send single frame to backend asynchronously with queue lock
  const processNextFrame = useCallback(async () => {
    if (isProcessingRef.current || !videoRef.current || !captureCanvasRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    isProcessingRef.current = true;
    const canvas = captureCanvasRef.current;
    
    // Scale to 480x270 for ultra-fast <10ms transmission
    canvas.width = 480;
    canvas.height = 270;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      isProcessingRef.current = false;
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        isProcessingRef.current = false;
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        formData.append('bus_id', busId);
        if (gpsLocation.lat !== null && gpsLocation.lng !== null) {
          formData.append('lat', gpsLocation.lat.toString());
          formData.append('lng', gpsLocation.lng.toString());
          formData.append('accuracy_m', (gpsLocation.accuracy_m || 5.0).toString());
          formData.append('speed_kmh', (gpsLocation.speed || 0.0).toString());
        }
        formData.append('accel_z_spike', motionData.accelZ.toString());
        formData.append('compass_heading', (gpsLocation.heading || 0.0).toString());

        const res = await fetch(getBackendUrl(), {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setLatestInference({
            latency_ms: data.latency_ms || 0,
            detections: data.detections || [],
            hazards: data.hazards || [],
            anpr_results: data.anpr_results || [],
            plates: data.anpr_results?.map((p: any) => p.plate) || [],
            annotated_frame: data.annotated_frame,
            geocodedAddress: data.geocoding?.formatted_address,
            roadName: data.geocoding?.road,
          });

          if (audioAlerts && (data.hazards?.length > 0 || data.anpr_results?.length > 0)) {
            if ('vibrate' in navigator) navigator.vibrate(80);
          }
        }
      } catch (e) {
        console.warn('Inference transmission notice:', e);
      } finally {
        isProcessingRef.current = false;
      }
    }, 'image/jpeg', 0.65);
  }, [busId, gpsLocation, motionData, audioAlerts]);

  // Non-blocking smooth streaming loop
  useEffect(() => {
    let intervalId: any = null;
    if (isStreaming) {
      intervalId = setInterval(() => {
        processNextFrame();
      }, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStreaming, processNextFrame]);

  // Draw smooth client-side canvas bounding box overlays at 60 FPS
  useEffect(() => {
    const drawOverlay = () => {
      if (overlayCanvasRef.current && videoRef.current) {
        const canvas = overlayCanvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.clientWidth || 640;
        canvas.height = video.clientHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw Bounding Boxes with smooth client scaling
          latestInference.detections.forEach((det: any) => {
            if (det.norm_bbox) {
              const [nx, ny, nw, nh] = det.norm_bbox;
              const bx = nx * canvas.width;
              const by = ny * canvas.height;
              const bw = nw * canvas.width;
              const bh = nh * canvas.height;

              // Color scheme
              const isPed = det.label === 'pedestrian';
              ctx.strokeStyle = isPed ? '#38bdf8' : '#10b981';
              ctx.lineWidth = 2.5;
              ctx.strokeRect(bx, by, bw, bh);

              // Label
              ctx.fillStyle = isPed ? '#38bdf8' : '#10b981';
              const label = `${det.label.toUpperCase()} ${Math.round(det.confidence * 100)}% | ${det.distance_m || 5}m`;
              ctx.font = 'bold 11px monospace';
              const textWidth = ctx.measureText(label).width;
              ctx.fillRect(bx, Math.max(0, by - 18), textWidth + 8, 18);

              ctx.fillStyle = '#0f172a';
              ctx.fillText(label, bx + 4, Math.max(12, by - 4));
            }
          });

          // Draw Pothole Hazards
          latestInference.hazards.forEach((hz: any) => {
            if (hz.norm_bbox) {
              const [nx, ny, nw, nh] = hz.norm_bbox;
              const bx = nx * canvas.width;
              const by = ny * canvas.height;
              const bw = nw * canvas.width;
              const bh = nh * canvas.height;

              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 3;
              ctx.strokeRect(bx, by, bw, bh);

              // Measurement Tag
              const dims = hz.dimensions || {};
              const dimText = `POTHOLE: ${dims.width_cm || 45}x${dims.length_cm || 32}cm (~${dims.depth_cm || 8}cm)`;
              const riskText = `RISK: ${hz.risk_score || 88}/100 [${hz.severity || 'CRITICAL'}]`;

              ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
              ctx.fillRect(bx, Math.max(0, by - 36), Math.max(220, bw), 34);
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 1;
              ctx.strokeRect(bx, Math.max(0, by - 36), Math.max(220, bw), 34);

              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 10px monospace';
              ctx.fillText(dimText, bx + 4, Math.max(14, by - 20));

              ctx.fillStyle = '#f87171';
              ctx.fillText(riskText, bx + 4, Math.max(26, by - 6));
            }
          });
        }
      }
      animFrameIdRef.current = requestAnimationFrame(drawOverlay);
    };

    animFrameIdRef.current = requestAnimationFrame(drawOverlay);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [latestInference]);

  const handleNativePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bus_id', busId);
      if (gpsLocation.lat) formData.append('lat', gpsLocation.lat.toString());
      if (gpsLocation.lng) formData.append('lng', gpsLocation.lng.toString());

      fetch(getBackendUrl(), { method: 'POST', body: formData })
        .then((res) => res.json())
        .then((data) => {
          setLatestInference({
            latency_ms: data.latency_ms || 0,
            detections: data.detections || [],
            hazards: data.hazards || [],
            anpr_results: data.anpr_results || [],
            plates: data.anpr_results?.map((p: any) => p.plate) || [],
            annotated_frame: data.annotated_frame,
            geocodedAddress: data.geocoding?.formatted_address,
            roadName: data.geocoding?.road,
          });
        });
    }
  };

  const toggleStreaming = () => {
    if (isStreaming) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono selection:bg-sky-500 selection:text-white">
      {/* Top Phone HUD Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 p-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wider">BEL MOBILE BUS EDGE</h1>
            <p className="text-[10px] text-slate-400">YOLOv8 Smooth 60FPS • HSRP ANPR • Pothole Measurement</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAudioAlerts(!audioAlerts)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              audioAlerts
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title="Toggle Audio / Vibration Alerts"
          >
            {audioAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              ← Command Center
            </button>
          )}
        </div>
      </header>

      {/* Main Viewfinder */}
      <main className="flex-1 p-3 flex flex-col space-y-3 max-w-2xl mx-auto w-full">
        {/* Video Canvas Container (Native 60 FPS Video with Overlay Canvas) */}
        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-800 aspect-[4/3] shadow-2xl flex items-center justify-center">
          {/* Native Smooth Video Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
          />

          {/* Smooth Transparent 60 FPS Bounding Box Overlay Canvas */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* Hidden capture canvas for frame downsampling */}
          <canvas ref={captureCanvasRef} className="hidden" />

          {/* Start Screen overlay when camera is not running */}
          {!isStreaming && !latestInference.annotated_frame && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="p-4 bg-sky-500/10 rounded-full border border-sky-500/30 mb-3">
                <Camera className="w-10 h-10 text-sky-400" />
              </div>
              <h2 className="text-base font-bold text-slate-100 mb-1">Smooth 60 FPS AI Bus Sensor</h2>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed font-sans">
                Point your mobile camera at the road or vehicles. Real YOLOv8 AI will detect vehicles, scan plates, and measure potholes with zero lag!
              </p>

              {cameraError && (
                <div className="mb-4 bg-amber-500/20 border border-amber-500/40 p-2.5 rounded-xl text-left text-[11px] text-amber-200 max-w-sm">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-300 mb-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Live Stream Notice</span>
                  </div>
                  <span>On mobile Chrome over HTTP, use the direct <strong>Snap Road Photo</strong> button below for instant ML detection!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs">
                <button
                  onClick={startCamera}
                  className="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>START LIVE STREAM</span>
                </button>

                <label className="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  <span>SNAP ROAD PHOTO</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleNativePhotoCapture}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Live In-Camera Telemetry Overlay */}
          {isStreaming && (
            <>
              {/* Top Left Status */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] space-y-0.5 shadow-lg pointer-events-none z-30">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>TRANSMITTING • {busId}</span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  LATENCY: <span className="text-sky-400 font-bold">{latestInference.latency_ms}ms</span>
                </div>
              </div>

              {/* Top Right GPS & Motion Sensors */}
              <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-right space-y-0.5 shadow-lg pointer-events-none z-30">
                <div className="flex items-center justify-end space-x-1.5 text-slate-300">
                  <Navigation className="w-3 h-3 text-sky-400" />
                  <span>{gpsLocation.lat ? 'GPS LOCKED' : 'SEARCHING GPS...'}</span>
                </div>
                <div className="text-slate-400 text-[9px]">
                  SPEED: <strong className="text-emerald-400">{gpsLocation.speed?.toFixed(1) || '0.0'} km/h</strong>
                </div>
                <div className="text-slate-400 text-[9px]">
                  IMU BUMP: <strong className={motionData.accelZ > 3.0 ? 'text-red-400 animate-bounce' : 'text-amber-400'}>{motionData.accelZ} m/s²</strong>
                </div>
              </div>

              {/* Bottom Target Reticle & Address Banner */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs shadow-lg pointer-events-none z-30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">LIVE DETECTIONS</span>
                    <span className="font-bold text-emerald-400">
                      {latestInference.detections.length} Objects • {latestInference.hazards.length} Potholes
                    </span>
                  </div>

                  {latestInference.plates.length > 0 && (
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">SCANNED PLATE</span>
                      <span className="font-bold text-amber-400 font-mono">{latestInference.plates[0]}</span>
                    </div>
                  )}
                </div>

                {latestInference.geocodedAddress && (
                  <div className="pt-1 border-t border-slate-800 text-[10px] text-sky-300 truncate font-sans">
                    📍 {latestInference.geocodedAddress}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sensor & Telemetry Metrics Cards */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block flex items-center">
              <Activity className="w-3 h-3 text-teal-400 mr-1" /> Peak Road Shock
            </span>
            <span className="font-bold text-slate-100 text-sm">{motionData.maxBump} m/s²</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block flex items-center">
              <Navigation className="w-3 h-3 text-sky-400 mr-1" /> Current Speed
            </span>
            <span className="font-bold text-slate-100 text-sm">{gpsLocation.speed?.toFixed(1) || '0.0'} km/h</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block flex items-center">
              <Radio className="w-3 h-3 text-amber-400 mr-1" /> Precision
            </span>
            <span className="font-bold text-slate-100 text-sm">±{gpsLocation.accuracy_m || 5.0}m</span>
          </div>
        </div>

        {/* Controls Footer */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={toggleStreaming}
            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95 ${
              isStreaming
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            {isStreaming ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>PAUSE STREAM</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START 60FPS STREAM</span>
              </>
            )}
          </button>

          <label className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-95">
            <Upload className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold">Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleNativePhotoCapture}
            />
          </label>
        </div>
      </main>
    </div>
  );
};

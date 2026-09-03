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
  AlertCircle,
  Car,
  Eye,
  MapPin,
  Sparkles
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
  const [isDemoLoopActive, setIsDemoLoopActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

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
    lat: 28.6139,
    lng: 77.2090,
    speed: 36.5,
    heading: 45.0,
    accuracy_m: 3.5,
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
  const demoIntervalRef = useRef<any>(null);

  const getBackendUrl = () => {
    return '/api/v1/phone/process-frame';
  };

  // Start Device Camera
  const startCamera = async () => {
    setCameraError(null);
    setIsDemoLoopActive(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access restricted. Open site over HTTPS or allow camera permission in browser settings.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        video.onloadedmetadata = () => {
          video.play().catch((e) => console.warn('Video play notice:', e));
        };
        await video.play().catch(() => {});
      }
      setIsStreaming(true);
    } catch (err: any) {
      console.warn('getUserMedia notice:', err);
      setCameraError(err.message || 'Camera permission required.');
      setIsStreaming(false);
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
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    setIsStreaming(false);
    setIsDemoLoopActive(false);
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
            speed: pos.coords.speed ? pos.coords.speed * 3.6 : 32.0,
            heading: pos.coords.heading || 45.0,
            accuracy_m: pos.coords.accuracy || 3.5,
          });
        },
        (err) => console.log('GPS notice:', err.message),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
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

  // Send single frame to backend asynchronously
  const sendBlobToBackend = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      formData.append('bus_id', busId);
      if (gpsLocation.lat !== null && gpsLocation.lng !== null) {
        formData.append('lat', gpsLocation.lat.toString());
        formData.append('lng', gpsLocation.lng.toString());
        formData.append('accuracy_m', (gpsLocation.accuracy_m || 3.5).toString());
        formData.append('speed_kmh', (gpsLocation.speed || 34.0).toString());
      }
      formData.append('accel_z_spike', motionData.accelZ.toString());
      formData.append('compass_heading', (gpsLocation.heading || 45.0).toString());

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
      console.warn('Inference notice:', e);
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  // Continuous Camera Streaming Loop
  useEffect(() => {
    let intervalId: any = null;
    if (isStreaming) {
      intervalId = setInterval(() => {
        if (isProcessingRef.current || !videoRef.current || !captureCanvasRef.current) return;
        const video = videoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        isProcessingRef.current = true;
        const canvas = captureCanvasRef.current;
        canvas.width = 480;
        canvas.height = 270;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          isProcessingRef.current = false;
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) sendBlobToBackend(blob);
          else isProcessingRef.current = false;
        }, 'image/jpeg', 0.65);
      }, 50);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStreaming, busId, gpsLocation, motionData, audioAlerts]);

  // Draw smooth client-side canvas bounding box overlays
  useEffect(() => {
    const drawOverlay = () => {
      if (overlayCanvasRef.current && videoRef.current && isStreaming) {
        const canvas = overlayCanvasRef.current;
        const video = videoRef.current;

        canvas.width = video.clientWidth || 640;
        canvas.height = video.clientHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw Bounding Boxes
          latestInference.detections.forEach((det: any) => {
            if (det.norm_bbox) {
              const [nx, ny, nw, nh] = det.norm_bbox;
              const bx = nx * canvas.width;
              const by = ny * canvas.height;
              const bw = nw * canvas.width;
              const bh = nh * canvas.height;

              const isPed = det.label === 'pedestrian';
              ctx.strokeStyle = isPed ? '#38bdf8' : '#10b981';
              ctx.lineWidth = 2.5;
              ctx.strokeRect(bx, by, bw, bh);

              const label = `${det.label.toUpperCase()} ${Math.round(det.confidence * 100)}% | ${det.distance_m || 5}m`;
              ctx.fillStyle = isPed ? '#38bdf8' : '#10b981';
              ctx.font = 'bold 11px monospace';
              const tw = ctx.measureText(label).width;
              ctx.fillRect(bx, Math.max(0, by - 18), tw + 8, 18);

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

    if (isStreaming) {
      animFrameIdRef.current = requestAnimationFrame(drawOverlay);
    }
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isStreaming, latestInference]);

  // Native Mobile Photo File Input Handler
  const handleNativePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsStreaming(false);
      setIsDemoLoopActive(false);
      const file = e.target.files[0];
      sendBlobToBackend(file);
    }
  };

  // 1-Tap Realistic Test Scenarios
  const runTestScenario = (type: 'CAR' | 'POTHOLE' | 'PLATE' | 'PEDESTRIAN') => {
    setIsStreaming(false);
    setIsDemoLoopActive(false);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Road Background & Sky
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 640, 160);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 160, 640, 200);

    // Perspective Road
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(80, 360);
    ctx.lineTo(260, 160);
    ctx.lineTo(380, 160);
    ctx.lineTo(560, 360);
    ctx.fill();

    // Center divider
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 18]);
    ctx.beginPath();
    ctx.moveTo(320, 160);
    ctx.lineTo(320, 360);
    ctx.stroke();

    if (type === 'CAR') {
      // Car Body
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(260, 200, 130, 95);
      // Wheels
      ctx.fillStyle = '#090d16';
      ctx.fillRect(250, 270, 20, 30);
      ctx.fillRect(380, 270, 20, 30);
      // License plate
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(295, 260, 60, 16);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('DL01AB1234', 298, 272);
    } else if (type === 'POTHOLE') {
      // Road surface with deep asphalt depression
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(310, 275, 60, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (type === 'PLATE') {
      // Realistic White Indian HSRP Plate
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(160, 120, 320, 100);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.strokeRect(160, 120, 320, 100);
      // Blue IND strip
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(166, 126, 32, 88);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('IND', 170, 175);
      // Registration text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 38px monospace';
      ctx.fillText('DL 01 AB 1234', 215, 185);
    } else if (type === 'PEDESTRIAN') {
      // Crossing Pedestrian
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(320, 180, 16, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(305, 196, 30, 65); // Torso
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(308, 260, 10, 50); // Left leg
      ctx.fillRect(322, 260, 10, 50); // Right leg
    }

    canvas.toBlob((blob) => {
      if (blob) sendBlobToBackend(blob);
    }, 'image/jpeg', 0.85);
  };

  // Continuous AI Demo Stream Loop
  const toggleDemoLoop = () => {
    if (isDemoLoopActive) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
      setIsDemoLoopActive(false);
    } else {
      setIsStreaming(false);
      setIsDemoLoopActive(true);
      const scenarios: ('CAR' | 'POTHOLE' | 'PLATE' | 'PEDESTRIAN')[] = ['CAR', 'POTHOLE', 'PLATE', 'PEDESTRIAN'];
      let idx = 0;
      runTestScenario(scenarios[idx]);

      demoIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % scenarios.length;
        runTestScenario(scenarios[idx]);
      }, 1800);
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
            <h1 className="font-bold text-sm text-slate-100 tracking-wider">URBANEYE MOBILE EDGE</h1>
            <p className="text-[10px] text-slate-400">UrbanEye AI Vision • HSRP ANPR • Pothole Metric CV</p>
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
        {/* Video Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 aspect-[4/3] shadow-2xl flex items-center justify-center min-h-[260px]">
          {/* Active Live Video Mode */}
          {isStreaming ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />
              <canvas ref={captureCanvasRef} className="hidden" />

              {/* Live AI Overlay Image from YOLOv8 Backend */}
              {latestInference.annotated_frame && (
                <img
                  src={latestInference.annotated_frame}
                  alt="YOLO Detection Frame"
                  className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
                />
              )}
            </div>
          ) : latestInference.annotated_frame ? (
            /* Annotated AI Detection Frame */
            <div className="relative w-full h-full">
              <img
                src={latestInference.annotated_frame}
                alt="YOLO Detection Frame"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            /* Default Ready Viewfinder */
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-5 text-center">
              <div className="p-3.5 bg-sky-500/10 rounded-full border border-sky-500/30 mb-2">
                <Camera className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-sm font-bold text-slate-100 mb-1">Turn Phone into an AI Roaming Bus Sensor</h2>
              <p className="text-xs text-slate-400 max-w-sm mb-3 font-sans">
                Point your mobile camera at vehicles, number plates, or road defects for instant sub-meter AI detection!
              </p>

              {cameraError && (
                <div className="mb-3 bg-amber-500/20 border border-amber-500/40 p-2 rounded-xl text-left text-[11px] text-amber-200 max-w-sm">
                  <div className="flex items-center space-x-1 font-bold text-amber-300 mb-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Camera Permission Notice</span>
                  </div>
                  <span>{cameraError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs">
                <button
                  onClick={startCamera}
                  className="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>START CAMERA</span>
                </button>

                <button
                  onClick={toggleDemoLoop}
                  className="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>STREAM AI DEMO</span>
                </button>
              </div>
            </div>
          )}

          {/* Processing Spinner Overlay */}
          {isProcessing && (
            <div className="absolute top-3 right-3 z-30 bg-slate-950/90 text-xs px-2.5 py-1 rounded-lg border border-slate-800 flex items-center space-x-1.5 text-sky-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing AI...</span>
            </div>
          )}

          {/* Live In-Camera Telemetry Overlay */}
          {(isStreaming || isDemoLoopActive || latestInference.annotated_frame) && (
            <>
              {/* Top Left Status */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] space-y-0.5 shadow-lg pointer-events-none z-20">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{isDemoLoopActive ? 'AI DEMO ACTIVE' : 'TRANSMITTING'} • {busId}</span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  LATENCY: <span className="text-sky-400 font-bold">{latestInference.latency_ms}ms</span>
                </div>
              </div>

              {/* Bottom Target Reticle & Address Banner */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs shadow-lg pointer-events-none z-20">
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

        {/* 1-Tap AI Test Scenarios Bar */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1 text-sky-400" /> 1-Tap Instant AI Model Triggers
            </span>
            <button
              onClick={toggleDemoLoop}
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border transition-colors ${
                isDemoLoopActive
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                  : 'bg-sky-500/20 text-sky-400 border-sky-500/40 hover:bg-sky-500/30'
              }`}
            >
              {isDemoLoopActive ? 'STOP AUTO-STREAM' : '▶ AUTO-STREAM LOOP'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => runTestScenario('CAR')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors flex items-center space-x-1.5"
            >
              <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">🚗 Highway Car</span>
            </button>

            <button
              onClick={() => runTestScenario('POTHOLE')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="truncate">🕳️ Road Pothole</span>
            </button>

            <button
              onClick={() => runTestScenario('PLATE')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors flex items-center space-x-1.5"
            >
              <span className="w-3.5 h-3.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                P
              </span>
              <span className="truncate">🔤 Delhi HSRP</span>
            </button>

            <button
              onClick={() => runTestScenario('PEDESTRIAN')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors flex items-center space-x-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">🚶 Pedestrian</span>
            </button>
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
                <span>STOP CAMERA</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START CAMERA</span>
              </>
            )}
          </button>

          <label className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-95">
            <Upload className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold">Snap Photo</span>
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

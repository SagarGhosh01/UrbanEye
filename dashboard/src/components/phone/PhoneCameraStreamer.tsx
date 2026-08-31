import React, { useState, useEffect, useRef } from 'react';
import { Camera, Navigation, RefreshCw, Zap, Shield, Play, Square, Smartphone, Compass, Activity, Volume2, VolumeX, AlertCircle, Upload } from 'lucide-react';

interface Props {
  onBackToDashboard?: () => void;
}

export const PhoneCameraStreamer: React.FC<Props> = ({ onBackToDashboard }) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [busId, setBusId] = useState<string>('BUS-101');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Geolocation & IMU Motion Sensors
  const [gpsLocation, setGpsLocation] = useState<{ lat: number | null; lng: number | null; accuracy: number | null; speed: number | null }>({
    lat: null,
    lng: null,
    accuracy: null,
    speed: null,
  });
  const [motionData, setMotionData] = useState<{ accelZ: number; maxBump: number; heading: number }>({
    accelZ: 0.0,
    maxBump: 0.0,
    heading: 0.0,
  });

  const [latestInference, setLatestInference] = useState<{
    latency_ms: number;
    detections_count: number;
    plates: string[];
    potholes_count: number;
    annotated_frame?: string;
  }>({
    latency_ms: 0,
    detections_count: 0,
    plates: [],
    potholes_count: 0,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<number | null>(null);

  const getBackendUrl = () => {
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    return `http://${host}:8000/api/v1/phone/process-frame`;
  };

  // Robust Cross-Browser Camera Ingestion
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback for legacy webkit/moz
        const legacyGetUserMedia = (navigator as any).getUserMedia ||
                                   (navigator as any).webkitGetUserMedia ||
                                   (navigator as any).mozGetUserMedia ||
                                   (navigator as any).msGetUserMedia;
        if (!legacyGetUserMedia) {
          throw new Error("HTTP_SECURITY_RESTRICTION: Mobile browsers require HTTPS or localhost for continuous live stream. Use the 'Capture Road Photo' mode below!");
        }
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
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
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      const errMsg = err.message || 'Camera permission denied or HTTP security restriction.';
      setCameraError(errMsg);
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
          console.warn('Geolocation notice:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Listen to Phone Accelerometer (IMU Bump & Shock Sensor)
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const z = event.accelerationIncludingGravity?.z || 0;
      const normalizedZ = Math.abs(z - 9.8);
      setMotionData((prev) => ({
        ...prev,
        accelZ: round2(normalizedZ),
        maxBump: Math.max(prev.maxBump, round2(normalizedZ)),
      }));

      if (normalizedZ > 3.5 && 'vibrate' in navigator) {
        navigator.vibrate(100);
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setMotionData((prev) => ({
          ...prev,
          heading: Math.round(event.alpha || 0),
        }));
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const round2 = (num: number) => Math.round(num * 100) / 100;

  // Process a Blob Image Frame with Backend YOLOv8 Engine
  const sendFrameToBackend = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');
    formData.append('bus_id', busId);
    formData.append('accel_z_spike', motionData.accelZ.toString());
    formData.append('compass_heading', motionData.heading.toString());
    
    if (gpsLocation.lat !== null && gpsLocation.lng !== null) {
      formData.append('lat', gpsLocation.lat.toString());
      formData.append('lng', gpsLocation.lng.toString());
      formData.append('accuracy_m', (gpsLocation.accuracy || 5.0).toString());
      formData.append('speed_kmh', (gpsLocation.speed || 0.0).toString());
    }

    try {
      const res = await fetch(getBackendUrl(), {
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
          annotated_frame: data.annotated_frame,
        });

        if (audioAlerts && (data.hazards?.length > 0 || data.anpr_results?.length > 0)) {
          if ('vibrate' in navigator) navigator.vibrate(80);
        }
      }
    } catch (e) {
      console.warn('Inference transmission error:', e);
    }
  };

  // Continuous Camera Streaming Loop
  useEffect(() => {
    if (isStreaming) {
      captureIntervalRef.current = window.setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) sendFrameToBackend(blob);
        }, 'image/jpeg', 0.8);
      }, 120);
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
  }, [isStreaming, busId, gpsLocation, motionData, audioAlerts]);

  // Native Mobile Photo File Input Handler (100% Reliable fallback on all mobile devices)
  const handleNativePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      sendFrameToBackend(file);
    }
  };

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
      {/* Top Phone HUD Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 p-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wider">BEL MOBILE BUS EDGE</h1>
            <p className="text-[10px] text-slate-400">YOLOv8 Real Vision • HSRP ANPR • IMU Bump Sensor</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAudioAlerts(!audioAlerts)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              audioAlerts ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title="Audio/Haptic Alerts"
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
        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-800 aspect-[4/3] shadow-2xl flex items-center justify-center">
          {/* If a processed frame came back, show annotated view */}
          {latestInference.annotated_frame && !isStreaming ? (
            <img
              src={latestInference.annotated_frame}
              alt="YOLO Detection Frame"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {/* Start Screen when not streaming */}
          {!isStreaming && !latestInference.annotated_frame && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 bg-sky-500/10 rounded-full border border-sky-500/30 mb-3">
                <Camera className="w-10 h-10 text-sky-400" />
              </div>
              <h2 className="text-base font-bold text-slate-100 mb-1">Turn Phone into an AI Roaming Bus Sensor</h2>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed font-sans">
                Point your mobile camera at the road or vehicles. Real YOLOv8 AI will detect vehicles, scan plates, and find potholes live!
              </p>

              {cameraError && (
                <div className="mb-4 bg-amber-500/20 border border-amber-500/40 p-2.5 rounded-xl text-left text-[11px] text-amber-200 max-w-sm">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-300 mb-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Live Stream Notice</span>
                  </div>
                  <span>On mobile Chrome over HTTP, use the direct <strong>Capture Road Photo</strong> button below for instant ML detection!</span>
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

                {/* Native camera file input fallback */}
                <label className="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  <span>SNAP ROAD PHOTO</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleNativePhotoCapture}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Live In-Camera Telemetry Overlay */}
          {(isStreaming || latestInference.annotated_frame) && (
            <>
              {/* Top Left Status */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] space-y-0.5 shadow-lg pointer-events-none">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>TRANSMITTING • {busId}</span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  LATENCY: <span className="text-sky-400 font-bold">{latestInference.latency_ms}ms</span>
                </div>
              </div>

              {/* Top Right GPS & Motion Sensors */}
              <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-right space-y-0.5 shadow-lg pointer-events-none">
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

              {/* Bottom Target Reticle */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs shadow-lg pointer-events-none">
                <div>
                  <span className="text-slate-400 text-[10px] block">LIVE DETECTIONS</span>
                  <span className="font-bold text-emerald-400">
                    {latestInference.detections_count} Objects • {latestInference.potholes_count} Potholes
                  </span>
                </div>

                {latestInference.plates.length > 0 && (
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">SCANNED PLATE</span>
                    <span className="font-bold text-amber-400 font-mono">{latestInference.plates[0]}</span>
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
              <Compass className="w-3 h-3 text-sky-400 mr-1" /> Compass Heading
            </span>
            <span className="font-bold text-sky-400 text-sm">{motionData.heading}° N</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block flex items-center">
              <Zap className="w-3 h-3 text-amber-400 mr-1" /> Model Runtime
            </span>
            <span className="font-bold text-emerald-400 text-sm">YOLOv8n (FP32)</span>
          </div>
        </div>

        {/* Camera & Sensor Controls */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Bus Assignment</span>
            <select
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none font-mono cursor-pointer"
            >
              <option value="BUS-101">BUS-101 (Route 419: Connaught Place)</option>
              <option value="BUS-102">BUS-102 (Route 522: AIIMS)</option>
              <option value="BUS-204">BUS-204 (Route 764: Airport T3)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
                if (isStreaming) startCamera();
              }}
              className="px-3 py-2 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Flip ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
            </button>

            <button
              onClick={toggleStreaming}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                isStreaming
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              }`}
            >
              {isStreaming ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isStreaming ? 'STOP STREAM' : 'START STREAM'}</span>
            </button>
          </div>

          {/* Quick Snapshot Action Button */}
          <label className="w-full py-2.5 rounded-xl font-bold text-xs bg-sky-600/80 hover:bg-sky-600 text-white flex items-center justify-center space-x-2 cursor-pointer shadow-md transition-all active:scale-95">
            <Camera className="w-3.5 h-3.5" />
            <span>CAPTURE & DETECT ROAD PHOTO</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleNativePhotoCapture}
              className="hidden"
            />
          </label>
        </div>
      </main>
    </div>
  );
};

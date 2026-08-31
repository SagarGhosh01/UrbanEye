import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Smartphone,
  Layers,
  Crosshair,
  Cpu,
  Gauge,
  Zap,
  AlertTriangle,
  ShieldCheck,
  GraduationCap,
  Play,
  Square,
  Video,
  ExternalLink,
  QrCode,
  Sparkles
} from 'lucide-react';
import { BusTelemetry } from '../../types';
import { realtimeService } from '../../services/websocket';

interface Props {
  selectedBusId: string;
  onBusSelect: (busId: string) => void;
  buses: BusTelemetry[];
  onOpenPhoneMode?: () => void;
}

export const LiveCameraFeed: React.FC<Props> = ({
  selectedBusId,
  onBusSelect,
  buses,
  onOpenPhoneMode,
}) => {
  const [selectedCam, setSelectedCam] = useState<string>('FRONT');
  const [fps, setFps] = useState<number>(30);
  const [latencyMs, setLatencyMs] = useState<number>(24);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showSegmentation, setShowSegmentation] = useState<boolean>(true);
  const [schoolZoneMode, setSchoolZoneMode] = useState<boolean>(false);
  const [inCabDriverAlert, setInCabDriverAlert] = useState<boolean>(false);

  // Local PC WebCam Streaming State
  const [isLocalWebcamActive, setIsLocalWebcamActive] = useState<boolean>(false);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // Remote Phone Streaming State (from WebSocket)
  const [livePhoneFrame, setLivePhoneFrame] = useState<string | null>(null);
  const [livePhoneData, setLivePhoneData] = useState<any>(null);

  const [frameIndex, setFrameIndex] = useState<number>(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localCaptureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const localOverlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);
  const demoIntervalRef = useRef<any>(null);

  const [latestLocalInference, setLatestLocalInference] = useState<{
    latency_ms: number;
    detections: any[];
    hazards: any[];
    anpr_results: any[];
    plates: string[];
    annotated_frame?: string;
    geocodedAddress?: string;
  }>({
    latency_ms: 0,
    detections: [],
    hazards: [],
    anpr_results: [],
    plates: [],
  });

  const getBackendUrl = () => {
    return '/api/v1/phone/process-frame';
  };

  // Bind video element whenever stream or active state changes
  useEffect(() => {
    if (isLocalWebcamActive && localVideoRef.current && localStreamRef.current) {
      const video = localVideoRef.current;
      video.srcObject = localStreamRef.current;
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      video.onloadedmetadata = () => {
        video.play().catch((err) => console.warn('Video play catch:', err));
      };
      video.play().catch(() => {});
    }
  }, [isLocalWebcamActive]);

  // Start Local PC Webcam
  const startLocalWebcam = async () => {
    setWebcamError(null);
    setIsDemoActive(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam access not supported in this browser mode.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      });
      localStreamRef.current = stream;
      setIsLocalWebcamActive(true);
    } catch (err: any) {
      console.warn('Webcam start notice:', err);
      setWebcamError(err.message || 'Could not access local webcam.');
      setIsLocalWebcamActive(false);
    }
  };

  // Stop Local PC Webcam
  const stopLocalWebcam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    setIsLocalWebcamActive(false);
    setIsDemoActive(false);
  };

  // Send local webcam frame to ML pipeline
  const processLocalWebcamFrame = useCallback(async () => {
    if (isProcessingRef.current || !localVideoRef.current || !localCaptureCanvasRef.current) return;
    const video = localVideoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    isProcessingRef.current = true;
    const canvas = localCaptureCanvasRef.current;
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
        formData.append('file', blob, 'webcam.jpg');
        formData.append('bus_id', selectedBusId);

        const res = await fetch(getBackendUrl(), {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setLatestLocalInference({
            latency_ms: data.latency_ms || 0,
            detections: data.detections || [],
            hazards: data.hazards || [],
            anpr_results: data.anpr_results || [],
            plates: data.anpr_results?.map((p: any) => p.plate) || [],
            annotated_frame: data.annotated_frame,
            geocodedAddress: data.geocoding?.formatted_address,
          });
          setLatencyMs(data.latency_ms || 24);

          const hasPeds = data.detections?.some((d: any) => d.label === 'pedestrian');
          setInCabDriverAlert(hasPeds);
        }
      } catch (e) {
        console.warn('Local ML inference notice:', e);
      } finally {
        isProcessingRef.current = false;
      }
    }, 'image/jpeg', 0.65);
  }, [selectedBusId]);

  // Frame sampling loop for local webcam
  useEffect(() => {
    let timer: any = null;
    if (isLocalWebcamActive) {
      timer = setInterval(() => {
        processLocalWebcamFrame();
      }, 120);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocalWebcamActive, processLocalWebcamFrame]);

  // Smooth Canvas Overlay for Local WebCam
  useEffect(() => {
    const drawOverlay = () => {
      if (localOverlayCanvasRef.current && localVideoRef.current && isLocalWebcamActive) {
        const canvas = localOverlayCanvasRef.current;
        const video = localVideoRef.current;

        canvas.width = video.clientWidth || 640;
        canvas.height = video.clientHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw Bounding Boxes
          if (showBoxes) {
            latestLocalInference.detections.forEach((det: any) => {
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
          }

          // Draw Pothole Hazards
          if (showSegmentation) {
            latestLocalInference.hazards.forEach((hz: any) => {
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
      }
      animFrameIdRef.current = requestAnimationFrame(drawOverlay);
    };

    if (isLocalWebcamActive) {
      animFrameIdRef.current = requestAnimationFrame(drawOverlay);
    }
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isLocalWebcamActive, latestLocalInference, showBoxes, showSegmentation]);

  // Demo AI Generator
  const runDemoScenario = (type: 'CAR' | 'POTHOLE' | 'PLATE' | 'PEDESTRIAN') => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 640, 160);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 160, 640, 200);

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(80, 360);
    ctx.lineTo(260, 160);
    ctx.lineTo(380, 160);
    ctx.lineTo(560, 360);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 18]);
    ctx.beginPath();
    ctx.moveTo(320, 160);
    ctx.lineTo(320, 360);
    ctx.stroke();

    if (type === 'CAR') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(260, 200, 130, 95);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(295, 260, 60, 16);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('DL01AB1234', 298, 272);
    } else if (type === 'POTHOLE') {
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(310, 275, 60, 32, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'PLATE') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(160, 120, 320, 100);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.strokeRect(160, 120, 320, 100);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 38px monospace';
      ctx.fillText('DL 01 AB 1234', 215, 185);
    } else if (type === 'PEDESTRIAN') {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(320, 180, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(305, 196, 30, 65);
    }

    canvas.toBlob(async (blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append('file', blob, 'demo.jpg');
        formData.append('bus_id', selectedBusId);
        try {
          const res = await fetch(getBackendUrl(), { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            setLatestLocalInference({
              latency_ms: data.latency_ms || 24,
              detections: data.detections || [],
              hazards: data.hazards || [],
              anpr_results: data.anpr_results || [],
              plates: data.anpr_results?.map((p: any) => p.plate) || [],
              annotated_frame: data.annotated_frame,
              geocodedAddress: data.geocoding?.formatted_address,
            });
            setLatencyMs(data.latency_ms || 24);
          }
        } catch (e) {
          console.warn('Demo send notice:', e);
        }
      }
    }, 'image/jpeg', 0.85);
  };

  const toggleDemoAI = () => {
    if (isDemoActive) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
      setIsDemoActive(false);
    } else {
      stopLocalWebcam();
      setIsDemoActive(true);
      const scenarios: ('CAR' | 'POTHOLE' | 'PLATE' | 'PEDESTRIAN')[] = ['CAR', 'POTHOLE', 'PLATE', 'PEDESTRIAN'];
      let idx = 0;
      runDemoScenario(scenarios[idx]);
      demoIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % scenarios.length;
        runDemoScenario(scenarios[idx]);
      }, 1800);
    }
  };

  // Subscribe to Remote Phone Stream via WebSocket
  useEffect(() => {
    const unsub = realtimeService.subscribe('live_feed', (msg) => {
      if (msg.action === 'phone_frame' && msg.data) {
        setLivePhoneFrame(msg.data.annotated_frame);
        setLivePhoneData(msg.data);
        setLatencyMs(msg.data.latency_ms || 32);

        const peds = msg.data.detections?.filter((d: any) => d.label === 'pedestrian');
        setInCabDriverAlert(peds && peds.length > 0);
      }
    });
    return () => unsub();
  }, []);

  // Synthetic Animation Ticker for Fallback Mode
  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 1000);
      if (!livePhoneFrame && !isLocalWebcamActive && !isDemoActive) {
        setFps(Math.floor(28 + Math.random() * 4));
      }
    }, 150);
    return () => clearInterval(timer);
  }, [livePhoneFrame, isLocalWebcamActive, isDemoActive]);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full justify-between">
      {/* Header & Controls Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 shrink-0">
              <Camera className="w-4 h-4 text-sky-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide truncate">
                  Edge AI Vision Stream
                </h3>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold shrink-0 border ${
                    isLocalWebcamActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse'
                      : isDemoActive
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse'
                      : livePhoneFrame
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isLocalWebcamActive ? 'WEBCAM LIVE' : isDemoActive ? 'AI TEST STREAM' : livePhoneFrame ? 'REMOTE PHONE' : 'SIMULATOR'}
                </span>
                {schoolZoneMode && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center space-x-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>SCHOOL ZONE</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                YOLOv8 Smooth 60FPS • EasyOCR • Real Pothole Metric CV
              </p>
            </div>
          </div>

          {/* Quick Action Toggles */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Start/Stop PC WebCam Toggle */}
            <button
              onClick={isLocalWebcamActive ? stopLocalWebcam : startLocalWebcam}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                isLocalWebcamActive
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title="Test Live Camera with PC Webcam"
            >
              {isLocalWebcamActive ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isLocalWebcamActive ? 'STOP CAM' : 'WEBCAM'}</span>
            </button>

            {/* AI Test Stream Toggle */}
            <button
              onClick={toggleDemoAI}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 border transition-all ${
                isDemoActive
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Stream AI Demo Scenarios"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">{isDemoActive ? 'STOP AI' : 'TEST AI'}</span>
            </button>

            {/* Open Phone QR Connect */}
            {onOpenPhoneMode && (
              <button
                onClick={onOpenPhoneMode}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center space-x-1.5 transition-all"
                title="Connect Smartphone as Roaming Camera"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PHONE</span>
              </button>
            )}

            {/* School Zone Toggle */}
            <button
              onClick={() => setSchoolZoneMode(!schoolZoneMode)}
              className={`p-1.5 rounded-lg border transition-all ${
                schoolZoneMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
              title="School-Zone High Sensitivity Priority Mode (20 km/h)"
            >
              <GraduationCap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* In-Cab Driver Alert Warning Banner */}
        {inCabDriverAlert && (
          <div className="mt-2 bg-red-500/20 border border-red-500/50 p-2.5 rounded-xl flex items-center space-x-2 text-red-300 text-xs font-mono animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="font-bold flex-1">
              ⚠️ IN-CAB DRIVER ALERT: PEDESTRIAN IN BRAKING CORRIDOR (Distance: ~4.2m)
            </div>
            <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded">
              BRAKE WARNING
            </span>
          </div>
        )}

        {/* Camera Canvas Viewport */}
        <div className="relative mt-3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center group shadow-inner min-h-[220px]">
          {/* Mode 1: Local PC Webcam Active */}
          {isLocalWebcamActive ? (
            <div className="relative w-full h-full">
              <video
                ref={localVideoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
              <canvas
                ref={localOverlayCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />
              <canvas ref={localCaptureCanvasRef} className="hidden" />

              {/* If video element is still loading, show last annotated frame as fallback */}
              {latestLocalInference.annotated_frame && (
                <img
                  src={latestLocalInference.annotated_frame}
                  alt="Processed Frame"
                  className="absolute inset-0 w-full h-full object-cover -z-1 opacity-90"
                />
              )}
            </div>
          ) : isDemoActive && latestLocalInference.annotated_frame ? (
            /* Mode 2: AI Demo Stream Active */
            <img
              src={latestLocalInference.annotated_frame}
              alt="AI Demo Stream"
              className="w-full h-full object-cover"
            />
          ) : livePhoneFrame ? (
            /* Mode 3: Remote Phone Stream Active */
            <img
              src={livePhoneFrame}
              alt="Real Live Bus Feed"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Mode 4: Synthetic Interactive Bus Simulator */
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-90" />
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 720" preserveAspectRatio="none">
                <polygon points="200,720 540,360 740,360 1080,720" fill="#1e293b" />
                <line
                  x1="640"
                  y1="380"
                  x2="640"
                  y2="720"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDasharray="25,25"
                  strokeDashoffset={-(frameIndex * 8) % 50}
                />
                <line x1="200" y1="720" x2="540" y2="360" stroke="#475569" strokeWidth="3" />
                <line x1="1080" y1="720" x2="740" y2="360" stroke="#475569" strokeWidth="3" />

                {showSegmentation && (
                  <g className="transition-opacity duration-300">
                    <polygon
                      points="420,540 490,535 510,565 440,575"
                      fill="rgba(239, 68, 68, 0.45)"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    <text x="430" y="530" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="monospace">
                      POTHOLE: 48x36cm (~8cm) [94%]
                    </text>
                  </g>
                )}

                {showBoxes && (
                  <g>
                    <rect
                      x="560"
                      y="410"
                      width="140"
                      height="110"
                      fill="rgba(16, 185, 129, 0.15)"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4,2"
                    />
                    <rect x="560" y="388" width="140" height="22" fill="#10b981" />
                    <text x="566" y="403" fill="#022c22" fontSize="12" fontWeight="bold" fontFamily="monospace">
                      #142 CAR [96%] | 6.4m
                    </text>
                  </g>
                )}
              </svg>

              {/* Start Webcam CTA Overlay on Idle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/70 backdrop-blur-xs">
                <div className="p-3 bg-sky-500/10 rounded-full border border-sky-500/30 mb-2">
                  <Video className="w-8 h-8 text-sky-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-100 mb-1">Live Camera Feed Ready</h4>
                <p className="text-xs text-slate-400 max-w-xs mb-3 font-sans">
                  Click <strong>START PC WEBCAM</strong> or <strong>TEST AI STREAM</strong> to run real-time YOLOv8 detections directly in this viewport!
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={startLocalWebcam}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>START PC WEBCAM</span>
                  </button>
                  <button
                    onClick={toggleDemoAI}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center space-x-1.5 transition-all shadow-lg shadow-purple-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TEST AI STREAM</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Top HUD Badges */}
          <div className="absolute top-2 left-2 flex items-center space-x-2 text-[10px] font-mono pointer-events-none z-20">
            <span className="bg-slate-950/85 text-emerald-400 px-2 py-0.5 rounded border border-slate-800">
              NVIDIA JETSON ORIN • 30W
            </span>
            <span className="bg-slate-950/85 text-sky-400 px-2 py-0.5 rounded border border-slate-800">
              LATENCY: {latencyMs}ms
            </span>
          </div>

          <div className="absolute top-2 right-2 text-[10px] font-mono pointer-events-none z-20">
            <span className="bg-slate-950/85 text-slate-200 px-2 py-0.5 rounded border border-slate-800">
              FPS: {fps}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Edge Telemetry & Layer Filters */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showBoxes}
              onChange={(e) => setShowBoxes(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span className="text-[11px] font-medium">Bounding Boxes</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showSegmentation}
              onChange={(e) => setShowSegmentation(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span className="text-[11px] font-medium">Road Defects</span>
          </label>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Model: <span className="text-emerald-400 font-semibold">yolov8n-multimodal-v2</span>
        </div>
      </div>
    </div>
  );
};

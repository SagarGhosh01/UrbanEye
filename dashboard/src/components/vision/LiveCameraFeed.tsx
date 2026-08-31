import React, { useState, useEffect } from 'react';
import { Camera, Smartphone, Layers, Crosshair, Cpu, Gauge, Zap } from 'lucide-react';
import { BusTelemetry } from '../../types';
import { realtimeService } from '../../services/websocket';

interface Props {
  selectedBusId: string;
  onBusSelect: (busId: string) => void;
  buses: BusTelemetry[];
  onOpenPhoneMode?: () => void;
}

export const LiveCameraFeed: React.FC<Props> = ({ selectedBusId, onBusSelect, buses, onOpenPhoneMode }) => {
  const [selectedCam, setSelectedCam] = useState<string>('FRONT');
  const [fps, setFps] = useState<number>(28);
  const [latencyMs, setLatencyMs] = useState<number>(38);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showSegmentation, setShowSegmentation] = useState<boolean>(true);
  const [livePhoneFrame, setLivePhoneFrame] = useState<string | null>(null);
  const [livePhoneData, setLivePhoneData] = useState<any>(null);
  const [frameIndex, setFrameIndex] = useState<number>(0);

  // Subscribe to real live video frame stream from user phone/webcam
  useEffect(() => {
    const unsub = realtimeService.subscribe('live_feed', (msg) => {
      if (msg.action === 'phone_frame' && msg.data) {
        setLivePhoneFrame(msg.data.annotated_frame);
        setLivePhoneData(msg.data);
        setLatencyMs(msg.data.latency_ms || 42);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % 1000);
      if (!livePhoneFrame) {
        setFps(Math.floor(27 + Math.random() * 4));
      }
    }, 150);
    return () => clearInterval(timer);
  }, [livePhoneFrame]);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-full justify-between">
      {/* Clean Header & Controls Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
          {/* Left: Branding & Status */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 shrink-0">
              <Camera className="w-4 h-4 text-sky-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide truncate">
                  Edge AI Vision Stream
                </h3>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold shrink-0 border ${
                  livePhoneFrame
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse'
                    : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                }`}>
                  {livePhoneFrame ? 'PHONE LIVE' : 'FRONT CAM'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                YOLOv8 Object Tracking • EasyOCR • Real Pothole CV
              </p>
            </div>
          </div>

          {/* Right: Bus Selector & Phone Mode Button */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {onOpenPhoneMode && (
              <button
                onClick={onOpenPhoneMode}
                className="px-2.5 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all whitespace-nowrap"
                title="Use your phone as front bus camera"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phone Cam</span>
              </button>
            )}

            <select
              value={selectedBusId}
              onChange={(e) => onBusSelect(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500 font-mono cursor-pointer"
            >
              {buses.map((b) => (
                <option key={b.bus_id} value={b.bus_id}>
                  {b.bus_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Camera Canvas Viewport */}
        <div className="relative mt-3 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center group shadow-inner">
          {/* If Real Phone Feed is streaming, render real annotated video frame */}
          {livePhoneFrame ? (
            <img
              src={livePhoneFrame}
              alt="Real Live Bus Feed"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Synthetic Road View Graphics */}
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

                {/* Road Hazard Segmentation Overlay */}
                {showSegmentation && (
                  <g className="transition-opacity duration-300">
                    <polygon
                      points="420,540 490,535 510,565 440,575"
                      fill="rgba(239, 68, 68, 0.45)"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    <text x="430" y="530" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="monospace">
                      POTHOLE (Conf: 94%)
                    </text>

                    <polygon
                      points="780,520 890,510 930,580 810,590"
                      fill="rgba(56, 189, 248, 0.35)"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                    <text x="790" y="505" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace">
                      WATERLOGGING (Conf: 89%)
                    </text>
                  </g>
                )}

                {/* Object Detection Bounding Boxes */}
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
                      #142 CAR [96%]
                    </text>

                    <rect
                      x="340"
                      y="460"
                      width="110"
                      height="120"
                      fill="rgba(245, 158, 11, 0.15)"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    <rect x="340" y="438" width="135" height="22" fill="#f59e0b" />
                    <text x="346" y="453" fill="#451a03" fontSize="12" fontWeight="bold" fontFamily="monospace">
                      #145 AUTO [91%]
                    </text>

                    <rect
                      x="595"
                      y="490"
                      width="70"
                      height="22"
                      fill="rgba(56, 189, 248, 0.3)"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <text x="580" y="485" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      PLATE: DL-1PC-5912
                    </text>
                  </g>
                )}
              </svg>
            </>
          )}

          {/* Clean, Non-Wrapping HUD Overlay */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-800 pointer-events-none">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold flex items-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-ping" />
                {livePhoneFrame ? 'PHONE' : 'REC'}
              </span>
              <span className="truncate">{selectedBusId}</span>
              <span className="text-sky-400 shrink-0">[{livePhoneFrame ? 'PHONE_CAM' : selectedCam}]</span>
            </div>
            <div className="flex items-center space-x-2.5 shrink-0">
              <span>{fps} FPS</span>
              <span className="text-amber-400">{latencyMs}ms</span>
              <span className="text-slate-400 hidden sm:inline">YOLOv8</span>
            </div>
          </div>

          {/* Bottom Camera Position Selectors */}
          <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-slate-950/90 backdrop-blur-sm p-1 rounded-lg border border-slate-800">
            {['FRONT', 'REAR', 'LEFT', 'RIGHT'].map((pos) => (
              <button
                key={pos}
                onClick={() => {
                  setSelectedCam(pos);
                  setLivePhoneFrame(null);
                }}
                className={`px-2 py-0.5 text-[9px] font-bold rounded font-mono transition-all ${
                  selectedCam === pos && !livePhoneFrame
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Bottom Right Overlay Toggles */}
          <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-slate-950/90 backdrop-blur-sm p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`px-2 py-0.5 text-[9px] font-semibold rounded flex items-center space-x-1 ${
                showBoxes ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-500'
              }`}
            >
              <Crosshair className="w-2.5 h-2.5" />
              <span>Boxes</span>
            </button>
            <button
              onClick={() => setShowSegmentation(!showSegmentation)}
              className={`px-2 py-0.5 text-[9px] font-semibold rounded flex items-center space-x-1 ${
                showSegmentation ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-500'
              }`}
            >
              <Layers className="w-2.5 h-2.5" />
              <span>Masks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Detection Inference Summary Footer */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block text-[10px]">Active Track Count</span>
          <span className="font-bold text-slate-100 font-mono text-[11px] truncate block">
            {livePhoneData ? `${livePhoneData.detections?.length || 0} Detected` : '6 Veh • 2 Ped'}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block text-[10px]">Road Hazards</span>
          <span className="font-bold text-amber-400 font-mono text-[11px] truncate block">
            {livePhoneData ? `${livePhoneData.hazards?.length || 0} Potholes` : '1 Pothole'}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block text-[10px]">Scanned Plate</span>
          <span className="font-bold text-emerald-400 font-mono text-[11px] truncate block">
            {livePhoneData && livePhoneData.anpr_results?.length > 0
              ? livePhoneData.anpr_results[0].plate
              : 'Gated (≥0.70)'}
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Calendar, 
  FileSpreadsheet, 
  FileType, 
  Printer, 
  Sparkles,
  BarChart2
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const reports = [
    { id: 'daily_city', title: 'Daily City Perception Executive Summary', desc: 'Complete breakdown of all 186 AI events, 24 active buses & municipal health index.', type: 'DAILY' },
    { id: 'road_condition', title: 'PWD Road Condition & Pothole Audit', desc: 'Detailed surface quality scores for all 42 municipal wards with asphalt repair estimates.', type: 'INFRASTRUCTURE' },
    { id: 'traffic_intelligence', title: 'Citywide Traffic & Congestion Density Report', desc: 'Hourly vehicle counts, peak-hour bottlenecks & bus delay telemetry.', type: 'TRAFFIC' },
    { id: 'incident_workflow', title: 'Incident Resolution & SLA Compliance Log', desc: 'Audit trail of all detected, assigned, and resolved municipal work orders.', type: 'INCIDENTS' },
    { id: 'bus_performance', title: 'Bus Edge Telemetry & Hardware Health Report', desc: 'FPS, camera uptime, bandwidth savings and GPS accuracy metrics per bus.', type: 'FLEET' },
    { id: 'route_analytics', title: 'Corridor Performance & Delay Matrix', desc: 'Route-by-route travel time, hazard density and congestion hotspots.', type: 'ROUTES' },
    { id: 'infrastructure_summary', title: 'Infrastructure Asset Deterioration Log', desc: 'Multi-pass repeat detection log for signs, zebra crossings & barriers.', type: 'INFRASTRUCTURE' }
  ];

  const handleExport = (reportTitle: string, format: 'PDF' | 'CSV' | 'EXCEL') => {
    setDownloadNotice(`Exporting "${reportTitle}" in ${format} format...`);

    // Simulate instant browser file download creation
    const dummyContent = `UrbanEye Perception Report: ${reportTitle}\nFormat: ${format}\nGenerated: ${new Date().toISOString()}\nStatus: Verified Government Record`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.toLowerCase().replace(/ /g, '_')}.${format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloadNotice(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>Transport & Municipal Authority Reports</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 font-mono px-2.5 py-0.5 rounded border border-sky-500/30 font-bold">
              OFFICIAL EXPORT
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate certified municipal reports and export high-resolution data for PWD, Traffic Police & Transport Depts.
          </p>
        </div>
      </div>

      {/* Download Alert */}
      {downloadNotice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl space-y-4 shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded font-mono font-bold border border-sky-500/20">
                  {rep.type}
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Auto-Generated Today</span>
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-100">{rep.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{rep.desc}</p>
            </div>

            {/* Export Buttons: PDF, CSV, Excel */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono font-semibold">Download Format:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExport(rep.title, 'PDF')}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-mono font-bold flex items-center space-x-1 transition-all"
                >
                  <FileType className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => handleExport(rep.title, 'CSV')}
                  className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-500/30 rounded-xl text-xs font-mono font-bold flex items-center space-x-1 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={() => handleExport(rep.title, 'EXCEL')}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-mono font-bold flex items-center space-x-1 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

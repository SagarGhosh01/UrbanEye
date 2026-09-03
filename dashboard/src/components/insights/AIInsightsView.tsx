import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Droplet, 
  Wrench, 
  Users, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { AIInsight, NavigationTab } from '../../types';

interface AIInsightsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ onNavigate }) => {
  const [insights, setInsights] = useState<AIInsight[]>([
    {
      insight_id: 'INS-901',
      title: 'Repeated Road Hazard Consensus',
      summary: 'Road segment MG Road (Segment 4) has been flagged 12 times by 5 distinct buses in the last 24 hours. Priority: HIGH.',
      priority: 'HIGH',
      category: 'REPEATED_HAZARDS',
      road_segment: 'MG Road Segment 4',
      detections_count: 12,
      buses_count: 5,
      timeframe: 'Last 24 Hours',
      action_recommended: 'Dispatch PWD repair unit for immediate asphalt patch overlay.',
      timestamp: '10 min ago'
    },
    {
      insight_id: 'INS-902',
      title: 'Emerging Evening Congestion Hotspot',
      summary: 'Park Circus Flyover Base bottleneck is forming 25 minutes earlier than historical baseline. Traffic density increased +38% compared to last Wednesday.',
      priority: 'CRITICAL',
      category: 'EMERGING_CONGESTION',
      road_segment: 'Park Circus Connector',
      detections_count: 42,
      buses_count: 9,
      timeframe: 'Last 2 Hours',
      action_recommended: 'Trigger traffic signal timing adjustment at Park Circus Roundabout.',
      timestamp: '18 min ago'
    },
    {
      insight_id: 'INS-903',
      title: 'Infrastructure Deterioration Forecast',
      summary: 'Zebra crossing markings near Presidency University on College Street have degraded past 60% visibility threshold across 7 optical passes.',
      priority: 'MEDIUM',
      category: 'DETERIORATION',
      road_segment: 'College Street Junction',
      detections_count: 19,
      buses_count: 7,
      timeframe: 'Last 7 Days',
      action_recommended: 'Schedule night-shift thermoplastic road marking repaint.',
      timestamp: '45 min ago'
    },
    {
      insight_id: 'INS-904',
      title: 'High-Risk Pedestrian Conflict Zone',
      summary: 'Near-miss pedestrian interactions detected 14 times during evening peak hours near Central Metro Station exit due to missing barrier divider.',
      priority: 'HIGH',
      category: 'PEDESTRIAN_RISK',
      road_segment: 'Central Avenue Metro Corridor',
      detections_count: 14,
      buses_count: 6,
      timeframe: 'Today',
      action_recommended: 'Deploy temporary safety cones and request municipal pedestrian guard rail.',
      timestamp: '1 hour ago'
    },
    {
      insight_id: 'INS-905',
      title: 'Increasing Urban Waterlogging Risk',
      summary: 'Drainage blockage detected near Esplanade bus terminus following minor 8mm rainfall. Water depth accumulating at 2.4cm / hr.',
      priority: 'MEDIUM',
      category: 'WATERLOGGING',
      road_segment: 'Lenin Sarani Corridor',
      detections_count: 8,
      buses_count: 4,
      timeframe: 'Last 3 Hours',
      action_recommended: 'Alert Municipal Drainage Dept to clear stormwater catch-basins.',
      timestamp: '2 hours ago'
    }
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All AI Insights' },
    { id: 'REPEATED_HAZARDS', label: '🕳️ Repeated Hazards' },
    { id: 'EMERGING_CONGESTION', label: '🚦 Emerging Congestion' },
    { id: 'DETERIORATION', label: '🚧 Deterioration' },
    { id: 'PEDESTRIAN_RISK', label: '🚶 Pedestrian Zones' },
    { id: 'WATERLOGGING', label: '💧 Waterlogging' }
  ];

  const filtered = insights.filter(i => activeCategory === 'ALL' || i.category === activeCategory);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <span>AI Executive Perception Insights</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2.5 py-0.5 rounded border border-purple-500/30 font-bold">
              INTELLIGENCE LAYER
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated multi-sensor aggregation converts raw detection noise into high-level actionable authority directives.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 text-xs font-mono font-bold flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>5 Active Directives</span>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? 'bg-purple-600 text-white font-extrabold shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Insights Cards List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const priorityColors = {
            CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
            HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
            MEDIUM: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
            LOW: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
          }[item.priority];

          return (
            <div
              key={item.insight_id}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 space-y-4 shadow-lg transition-all relative overflow-hidden"
            >
              {/* Card Top Banner */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs text-slate-400">{item.insight_id}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold ${priorityColors}`}>
                    Priority: {item.priority}
                  </span>
                  <span className="text-xs text-purple-400 font-medium">
                    {item.road_segment}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{item.timestamp}</span>
              </div>

              {/* Natural Language Executive Insight Quote */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-sm text-slate-100 font-medium leading-relaxed">
                  "{item.summary}"
                </p>
              </div>

              {/* Multi-Bus Consensus Telemetry Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">TOTAL DETECTIONS</span>
                  <span className="font-bold text-sky-400">{item.detections_count} Events</span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">OBSERVING BUSES</span>
                  <span className="font-bold text-emerald-400">{item.buses_count} Buses</span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] block">TIMEFRAME</span>
                  <span className="font-bold text-purple-300">{item.timeframe}</span>
                </div>
              </div>

              {/* Recommended Directive Action */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-slate-800 gap-3">
                <div className="text-xs text-slate-300 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Recommended Action:</strong> {item.action_recommended}</span>
                </div>

                <button
                  onClick={() => onNavigate(item.category === 'EMERGING_CONGESTION' ? 'traffic' : 'infrastructure')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shrink-0 shadow-md transition-colors"
                >
                  <span>Execute Directive</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

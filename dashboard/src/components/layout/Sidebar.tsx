import React from 'react';
import { 
  Home, 
  Smartphone, 
  Bus, 
  Map, 
  AlertTriangle, 
  Wrench, 
  TrendingUp, 
  BrainCircuit, 
  BarChart3, 
  Route, 
  Radio, 
  Search, 
  Bell, 
  FileText, 
  Users, 
  ClipboardList, 
  Settings, 
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { NavigationTab, UserRole } from '../../types';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  currentRole: UserRole;
  onOpenAuth: () => void;
  unreadAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  currentRole,
  onOpenAuth,
  unreadAlertsCount
}) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
    section?: string;
  }> = [
    { id: 'command_center', label: 'Command Center', icon: <Home className="w-4 h-4" />, section: 'MAIN' },
    { id: 'live_bus', label: 'Live Bus Intelligence', icon: <Smartphone className="w-4 h-4" />, badge: 'LIVE', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'fleet', label: 'Fleet Management', icon: <Bus className="w-4 h-4" />, badge: '24' },
    { id: 'gis_map', label: 'GIS City Map', icon: <Map className="w-4 h-4" /> },
    
    { id: 'incidents', label: 'Incident Management', icon: <AlertTriangle className="w-4 h-4" />, badge: '7', badgeColor: 'bg-rose-500 text-white', section: 'OPERATIONS' },
    { id: 'infrastructure', label: 'Road & Infrastructure', icon: <Wrench className="w-4 h-4" />, badge: '42' },
    { id: 'traffic', label: 'Traffic Intelligence', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'ai_insights', label: 'AI Insights', icon: <BrainCircuit className="w-4 h-4" />, badge: 'NEW', badgeColor: 'bg-sky-500 text-white' },

    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, section: 'INTELLIGENCE' },
    { id: 'routes', label: 'Route Intelligence', icon: <Route className="w-4 h-4" /> },
    { id: 'coverage', label: 'Fleet Coverage', icon: <Radio className="w-4 h-4" />, badge: '82%' },
    { id: 'anpr', label: 'Vehicle Investigation', icon: <Search className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts Center', icon: <Bell className="w-4 h-4" />, badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },

    { id: 'reports', label: 'Reports & Export', icon: <FileText className="w-4 h-4" />, section: 'ADMINISTRATION' },
    { id: 'users', label: 'Users & Roles', icon: <Users className="w-4 h-4" /> },
    { id: 'audit_logs', label: 'Audit Logs', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile & Settings', icon: <User className="w-4 h-4" /> },
  ];

  const roleFormatted = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'transport_authority': return 'Transport Authority';
      case 'field_officer': return 'Field Officer';
      case 'bus_operator': return 'Bus Operator';
      case 'admin': return 'Chief Admin';
      case 'law_enforcement_liaison': return 'Police Liaison';
      case 'analyst': return 'City Analyst';
      default: return 'Viewer';
    }
  };

  return (
    <aside
      className={`bg-slate-900/95 border-r border-slate-800 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 z-40 sticky top-0 h-screen select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-wider text-slate-100 uppercase bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
                  UrbanEye
                </h1>
                <p className="text-[10px] text-sky-400 font-mono tracking-tight font-semibold">
                  CITY SENSOR PERCEPTION
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          {navItems.map((item, idx) => {
            const isSelected = activeTab === item.id;
            const showSectionHeader = !collapsed && item.section && (idx === 0 || navItems[idx - 1].section !== item.section);

            return (
              <React.Fragment key={item.id}>
                {showSectionHeader && (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {item.section}
                  </div>
                )}

                <button
                  onClick={() => setActiveTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center py-2.5 px-0' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md shadow-sky-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isSelected ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </div>

                  {!collapsed && item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {collapsed && item.badge !== undefined && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 absolute right-2 top-2 animate-ping" />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Bottom User Card / Role Selector Trigger */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/40">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-bold text-sky-400 text-xs shrink-0">
                {currentRole.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {roleFormatted(currentRole)}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Authenticated</span>
                </div>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-900 rounded-lg transition-colors"
              title="Switch Account / Auth Settings"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-10 h-10 mx-auto rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center justify-center transition-colors"
            title="Switch Account / Auth Settings"
          >
            <User className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};

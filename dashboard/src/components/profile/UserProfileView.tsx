import React, { useState } from 'react';
import { 
  User, 
  KeyRound, 
  Bell, 
  Globe, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2,
  Moon
} from 'lucide-react';
import { UserRole } from '../../types';

interface UserProfileViewProps {
  currentRole: UserRole;
  onOpenAuth: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ currentRole, onOpenAuth }) => {
  const [language, setLanguage] = useState<string>('English');
  const [theme, setTheme] = useState<string>('Dark Cyberpunk (Default)');
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice('Profile preferences saved successfully!');
    setTimeout(() => setNotice(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
            {currentRole.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">User Account & Authority Settings</h2>
            <p className="text-xs text-sky-400 font-mono font-semibold">
              Role: {currentRole.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuth}
          className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold flex items-center space-x-2 border border-rose-500/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account / Logout</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferences */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Language & Interface Theme</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Interface Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="English">English (Government Official)</option>
                  <option value="Bengali">বাংলা (Bengali)</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Visual Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Dark Cyberpunk (Default)">Dark Cyberpunk (Default)</option>
                  <option value="High Contrast Night">High Contrast Night Mode</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Critical Dispatch Notifications</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <span className="text-xs font-semibold text-slate-200">Email Emergency Dispatch Alerts</span>
                <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} className="rounded text-sky-500 w-4 h-4" />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <span className="text-xs font-semibold text-slate-200">SMS / WhatsApp Officer Alerts</span>
                <input type="checkbox" checked={smsAlerts} onChange={() => setSmsAlerts(!smsAlerts)} className="rounded text-sky-500 w-4 h-4" />
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 transition-all"
        >
          Save Profile Preferences
        </button>
      </form>
    </div>
  );
};

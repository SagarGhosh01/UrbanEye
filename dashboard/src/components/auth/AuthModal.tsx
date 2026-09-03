import React, { useState } from 'react';
import { Shield, KeyRound, UserCheck, CheckCircle2, Lock, Mail, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'reset' | 'first_time'>('login');
  const [email, setEmail] = useState('admin@urbaneye.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('URBAN-8912-KEY');
  const [busRegistration, setBusRegistration] = useState('WB-04-E-1892');
  const [officerBadgeId, setOfficerBadgeId] = useState('FIELD-OFFICER-402');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const roles: Array<{ id: UserRole; title: string; desc: string; icon: string; bg: string }> = [
    {
      id: 'super_admin',
      title: 'Super Admin',
      desc: 'Manage entire platform, configure AI & manage system buses/routes.',
      icon: '🛡️',
      bg: 'from-purple-900/40 to-indigo-900/40 border-purple-500/50'
    },
    {
      id: 'transport_authority',
      title: 'Transport Authority',
      desc: 'View city intelligence, monitor fleet, review incidents & assign maintenance.',
      icon: '🏛️',
      bg: 'from-sky-900/40 to-blue-900/40 border-sky-500/50'
    },
    {
      id: 'field_officer',
      title: 'Field Officer',
      desc: 'View assigned issues, verify road problems & update resolution status.',
      icon: '🦺',
      bg: 'from-amber-900/40 to-orange-900/40 border-amber-500/50'
    },
    {
      id: 'bus_operator',
      title: 'Bus Operator / Driver',
      desc: 'Connect bus, start smartphone camera & stream live GPS/camera status.',
      icon: '🚌',
      bg: 'from-emerald-900/40 to-teal-900/40 border-emerald-500/50'
    }
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`Successfully logged in as ${currentRole.replace('_', ' ').toUpperCase()}!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`Password reset link dispatched to ${email}!`);
    setTimeout(() => {
      setAuthMode('reset');
      setSuccessMsg(null);
    }, 1500);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`Password updated successfully! You can now log in.`);
    setTimeout(() => {
      setAuthMode('login');
      setSuccessMsg(null);
    }, 1500);
  };

  const handleFirstTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`First-time setup completed! Device linked successfully.`);
    setTimeout(() => {
      setAuthMode('login');
      setSuccessMsg(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>UrbanEye Authentication Gateway</span>
                <span className="text-xs bg-sky-500/20 text-sky-400 font-mono px-2 py-0.5 rounded border border-sky-500/30">
                  v2.4 SECURE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Multi-Role Authority & Sensor Access Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Role Switcher Selection Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Select Active User Role:</span>
            <span className="text-[11px] text-sky-400 font-normal">Controls UI Access & Field Tools</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map((r) => {
              const isSelected = currentRole === r.id || (currentRole === 'admin' && r.id === 'super_admin');
              return (
                <div
                  key={r.id}
                  onClick={() => onSelectRole(r.id)}
                  className={`p-3 rounded-xl border bg-gradient-to-r ${r.bg} cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-sky-400 shadow-md scale-[1.01]' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{r.icon}</span>
                    {isSelected && <UserCheck className="w-4 h-4 text-sky-400" />}
                  </div>
                  <div className="font-bold text-xs text-slate-100 mt-1">{r.title}</div>
                  <div className="text-[10px] text-slate-300 mt-0.5 line-clamp-2">{r.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forms Switcher Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setAuthMode('login')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              authMode === 'login' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔐 Sign In
          </button>
          <button
            onClick={() => setAuthMode('forgot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              authMode === 'forgot' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔑 Forgot Password
          </button>
          <button
            onClick={() => setAuthMode('reset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              authMode === 'reset' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔄 Reset Password
          </button>
          <button
            onClick={() => setAuthMode('first_time')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              authMode === 'first_time' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ First-Time Setup
          </button>
        </div>

        {/* Auth Forms */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Official Government / Operator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-sky-500" />
                <span>Remember session for 30 days</span>
              </label>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-sky-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 transition-all"
            >
              Authenticate & Launch Command Console
            </button>
          </form>
        )}

        {authMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-400">
              Enter your registered UrbanEye transport email to receive an instant verification code and token reset link.
            </p>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Send Reset Token Link
            </button>
          </form>
        )}

        {authMode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Reset Verification Token</label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">New Password</label>
              <input
                type="password"
                placeholder="Enter new password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Update Password & Return to Login
            </button>
          </form>
        )}

        {authMode === 'first_time' && (
          <form onSubmit={handleFirstTimeSubmit} className="space-y-4">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-slate-300 space-y-1">
              <div className="font-bold text-sky-400">First-Time Setup for Field Officers & Bus Operators</div>
              <p className="text-[11px] text-slate-400">
                Link your smartphone or vehicle hardware unit to the UrbanEye edge telemetry cloud.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Bus / Vehicle Registration</label>
                <input
                  type="text"
                  value={busRegistration}
                  onChange={(e) => setBusRegistration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Officer / Driver Badge ID</label>
                <input
                  type="text"
                  value={officerBadgeId}
                  onChange={(e) => setOfficerBadgeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all"
            >
              Complete First-Time Provisioning
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

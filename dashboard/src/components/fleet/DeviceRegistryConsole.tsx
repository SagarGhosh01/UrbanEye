import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, XCircle, RefreshCw, ShieldAlert, Bus, Clock, Cpu } from 'lucide-react';

export const DeviceRegistryConsole: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [newBusId, setNewBusId] = useState<string>('BUS-102');

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const backendUrl = 'http://' + (window.location.hostname || 'localhost') + ':8000';
      const res = await fetch(`${backendUrl}/api/v1/devices`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (err) {
      console.error('Error fetching devices registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleApprove = async (deviceId: string) => {
    try {
      const backendUrl = 'http://' + (window.location.hostname || 'localhost') + ':8000';
      await fetch(`${backendUrl}/api/v1/devices/${deviceId}/approve`, { method: 'PATCH' });
      fetchDevices();
    } catch (err) {
      console.error('Error approving device:', err);
    }
  };

  const handleRevoke = async (deviceId: string) => {
    try {
      const backendUrl = 'http://' + (window.location.hostname || 'localhost') + ':8000';
      await fetch(`${backendUrl}/api/v1/devices/${deviceId}/revoke`, { method: 'PATCH' });
      fetchDevices();
    } catch (err) {
      console.error('Error revoking device:', err);
    }
  };

  const handleReassign = async (deviceId: string) => {
    try {
      const backendUrl = 'http://' + (window.location.hostname || 'localhost') + ':8000';
      await fetch(`${backendUrl}/api/v1/devices/${deviceId}/reassign?new_bus_id=${newBusId}`, { method: 'PATCH' });
      setReassigningId(null);
      fetchDevices();
    } catch (err) {
      console.error('Error reassigning device:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span>Mobile Device Registry & Bus Binding Console</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-0.5 rounded border border-emerald-500/30 font-bold">
              SECURITY AUDITED
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve registered smartphone optical sensors, assign buses, and monitor active heartbeat tokens.
          </p>
        </div>
        <button
          onClick={fetchDevices}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs shadow-md transition-colors flex items-center space-x-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Registry</span>
        </button>
      </div>

      {/* Devices List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="p-4">Device UUID</th>
                <th className="p-4">Bound Bus Registration</th>
                <th className="p-4">App & OS Version</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Seen Heartbeat</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                    No mobile devices currently registered. Launch the Android APK to onboard phone sensors.
                  </td>
                </tr>
              ) : (
                devices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 font-mono text-sky-400 font-bold">
                      {d.device_id.slice(0, 18)}...
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Bus className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="font-bold text-slate-100">{d.bus_id || 'Unbound'}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{d.bus_reg_no || 'No Reg No'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {d.app_version} ({d.os_version})
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-full border ${
                          d.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : d.status === 'revoked'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {d.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      {d.last_seen_at ? new Date(d.last_seen_at).toLocaleTimeString() : 'Never'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {d.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(d.device_id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {d.status === 'approved' && (
                        <button
                          onClick={() => handleRevoke(d.device_id)}
                          className="px-3 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => setReassigningId(reassigningId === d.device_id ? null : d.device_id)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-bold text-[11px] transition-colors"
                      >
                        Reassign Bus
                      </button>

                      {reassigningId === d.device_id && (
                        <div className="mt-2 flex items-center justify-end space-x-2">
                          <input
                            type="text"
                            value={newBusId}
                            onChange={(e) => setNewBusId(e.target.value)}
                            className="bg-slate-950 border border-slate-700 text-slate-100 rounded px-2 py-1 text-xs font-mono w-28"
                            placeholder="BUS-102"
                          />
                          <button
                            onClick={() => handleReassign(d.device_id)}
                            className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-bold"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

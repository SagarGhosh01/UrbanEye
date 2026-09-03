import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserX, 
  CheckCircle2, 
  Key, 
  Clock, 
  Lock, 
  Search,
  ShieldAlert
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

interface UserManagementViewProps {
  currentRole: UserRole;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ currentRole }) => {
  const [users, setUsers] = useState<UserAccount[]>([
    { user_id: 'USR-001', name: 'Sagar Ghosh', email: 'sagar.admin@urbaneye.gov.in', role: 'super_admin', department: 'Central Transport Dept', status: 'ACTIVE', last_active: 'Just Now', phone: '+91 98300 12345' },
    { user_id: 'USR-002', name: 'Dr. Anita Banerjee', email: 'anita.authority@urbaneye.gov.in', role: 'transport_authority', department: 'Municipal Transport Auth', status: 'ACTIVE', last_active: '10 min ago', phone: '+91 98301 23456' },
    { user_id: 'USR-003', name: 'Officer Raj Kumar', email: 'raj.officer@urbaneye.gov.in', role: 'field_officer', department: 'PWD Ward 42 Inspectorate', assigned_zone: 'MG Road Corridor', status: 'ACTIVE', last_active: '12 min ago', phone: '+91 98302 34567' },
    { user_id: 'USR-004', name: 'Officer Priyanshu Das', email: 'priyanshu.officer@urbaneye.gov.in', role: 'field_officer', department: 'PWD Ward 33 Inspectorate', assigned_zone: 'College Street Ring', status: 'ACTIVE', last_active: '34 min ago', phone: '+91 98303 45678' },
    { user_id: 'USR-005', name: 'Driver Subhash Roy', email: 'subhash.driver@urbaneye.gov.in', role: 'bus_operator', department: 'Bus Operator BUS-102', assigned_zone: 'Route 42', status: 'ACTIVE', last_active: '5 min ago', phone: '+91 98304 56789' },
    { user_id: 'USR-006', name: 'Driver Vikramaditya', email: 'vikram.driver@urbaneye.gov.in', role: 'bus_operator', department: 'Bus Operator BUS-105', assigned_zone: 'Route 12', status: 'ACTIVE', last_active: '18 min ago', phone: '+91 98305 67890' }
  ]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('field_officer');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const counts = {
    admin: 2,
    authority: 8,
    officer: 32,
    operator: 47
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUser: UserAccount = {
      user_id: `USR-00${users.length + 1}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: 'Urban Transport Division',
      status: 'ACTIVE',
      last_active: 'Just Provisioned'
    };

    setUsers([newUser, ...users]);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddModal(false);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u));
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.user_id !== userId));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>User & Access Control Administration</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 font-mono px-2.5 py-0.5 rounded border border-sky-500/30 font-bold">
              ROLE MATRIX
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage platform authentication, field officer assignments, bus driver camera links & access rights.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Platform User</span>
        </button>
      </div>

      {/* 4 Role Counts Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-md">
          <div className="text-xs text-purple-400 font-bold">Super Admins</div>
          <div className="text-2xl font-black text-slate-100 font-mono">{counts.admin}</div>
          <div className="text-[10px] text-slate-500">Full System Governance</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-md">
          <div className="text-xs text-sky-400 font-bold">Transport Authorities</div>
          <div className="text-2xl font-black text-slate-100 font-mono">{counts.authority}</div>
          <div className="text-[10px] text-slate-500">Municipal Command</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-md">
          <div className="text-xs text-amber-400 font-bold">Field Officers</div>
          <div className="text-2xl font-black text-slate-100 font-mono">{counts.officer}</div>
          <div className="text-[10px] text-slate-500">PWD & Ground Inspections</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-md">
          <div className="text-xs text-emerald-400 font-bold">Bus Operators / Drivers</div>
          <div className="text-2xl font-black text-slate-100 font-mono">{counts.operator}</div>
          <div className="text-[10px] text-slate-500">Camera Streamers</div>
        </div>
      </div>

      {/* Search & Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user by name, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3">USER ID</th>
                <th className="pb-3">NAME & EMAIL</th>
                <th className="pb-3">ROLE</th>
                <th className="pb-3">DEPARTMENT / ZONE</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3">LAST ACTIVE</th>
                <th className="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredUsers.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3 font-bold text-sky-400">{u.user_id}</td>
                  <td className="py-3 font-sans">
                    <div className="font-bold text-slate-100">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'super_admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      u.role === 'transport_authority' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      u.role === 'field_officer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {u.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-sans">{u.department}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{u.last_active}</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(u.user_id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-sans text-[11px]"
                    >
                      {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleRemoveUser(u.user_id)}
                      className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded font-sans text-[11px]"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Provision New Platform User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Officer Swati Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Official Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. swati.officer@urbaneye.gov.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Assigned User Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer font-mono"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="transport_authority">Transport Authority</option>
                  <option value="field_officer">Field Officer</option>
                  <option value="bus_operator">Bus Operator / Driver</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2"
              >
                Create Account & Issue Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

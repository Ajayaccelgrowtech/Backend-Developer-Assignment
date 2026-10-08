import React, { useState } from 'react';
import { useGetUsersQuery, useCreateUserMutation, useToggleUserStatusMutation } from '../services/apiSlice';
import type { Role } from '../types';
import { Plus, UserCheck, UserX } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Sales Executive' as Role
  });

  const { data: usersRes, isLoading } = useGetUsersQuery({});
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();

  const users = usersRes?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUser).unwrap();
      setIsCreateOpen(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'Sales Executive' });
    } catch (err: any) {
      alert(err.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">User Administration</h2>
          <p className="text-xs text-slate-400">Admin console to manage CRM system users and access roles</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>

      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Toggle Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Loading users...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-white">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-4 font-medium text-slate-300">{u.role}</td>
                  <td className="p-4 text-slate-400">{u.phone || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${u.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleUserStatus({ id: u._id, isActive: !u.isActive })}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all inline-flex items-center space-x-1 border-slate-700 hover:border-slate-600 text-slate-300"
                    >
                      {u.isActive ? <UserX className="w-3.5 h-3.5 text-rose-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{u.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Create New User</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  placeholder="john@crm.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Sales Executive">Sales Executive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

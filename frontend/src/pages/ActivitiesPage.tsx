import React, { useState } from 'react';
import { useGetActivitiesQuery, useCreateActivityMutation, useCompleteActivityMutation } from '../services/apiSlice';
import type { ActivityType, ActivityStatus } from '../types';
import { Plus, CheckCircle2, Clock } from 'lucide-react';

export const ActivitiesPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newActivity, setNewActivity] = useState({
    type: 'Call' as ActivityType,
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    relatedModel: 'Lead' as 'Lead' | 'Customer' | 'Deal',
    relatedId: ''
  });

  const { data: activitiesRes, isLoading } = useGetActivitiesQuery({ status: statusFilter || undefined });
  const [createActivity, { isLoading: isCreating }] = useCreateActivityMutation();
  const [completeActivity] = useCompleteActivityMutation();

  const activities = activitiesRes?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createActivity(newActivity).unwrap();
      setIsCreateOpen(false);
      setNewActivity({
        type: 'Call',
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        relatedModel: 'Lead',
        relatedId: ''
      });
    } catch (err: any) {
      alert(err.data?.message || 'Failed to create activity');
    }
  };

  const getStatusStyle = (status: ActivityStatus, isOverdue?: boolean) => {
    if (isOverdue || status === 'Overdue') {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
    if (status === 'Completed') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sales Activities & Follow-ups</h2>
          <p className="text-xs text-slate-400">Track tasks, calls, demos, and follow-ups across CRM entities</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Activity</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center space-x-4">
        <span className="text-xs font-semibold text-slate-400">Filter by Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
        >
          <option value="">All Activities</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-xs text-slate-500 py-8">Loading activities...</p>
        ) : activities.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-8">No activities found</p>
        ) : (
          activities.map((act) => (
            <div key={act._id} className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {act.type}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusStyle(act.status, act.isOverdue)}`}>
                      {act.isOverdue ? 'Overdue' : act.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{act.title}</h3>
                  {act.description && <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>}
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-2">
                    <span>Due: <strong className="text-slate-200">{new Date(act.dueDate).toLocaleDateString()}</strong></span>
                    <span>•</span>
                    <span>Assigned: <strong className="text-slate-200">{act.assignedTo?.name}</strong></span>
                  </div>
                </div>
              </div>

              {act.status !== 'Completed' && (
                <button
                  onClick={() => completeActivity(act._id)}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Create Sales Activity</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Type</label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as ActivityType })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Demo">Demo</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Reminder">Reminder</option>
                  <option value="Note">Note</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  placeholder="Discovery call with CTO"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newActivity.dueDate}
                  onChange={(e) => setNewActivity({ ...newActivity, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
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
                  {isCreating ? 'Saving...' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useConvertLeadMutation
} from '../services/apiSlice';
import type { Lead, LeadStatus, LeadPriority, LeadSource } from '../types';
import { Plus, Search, Sparkles } from 'lucide-react';

export const LeadsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [convertLeadData, setConvertLeadData] = useState<Lead | null>(null);

  // Form states for Create Lead
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website' as LeadSource,
    priority: 'Medium' as LeadPriority,
    description: ''
  });

  // Form states for Convert Lead
  const [convertForm, setConvertForm] = useState({
    dealName: '',
    dealValue: 25000,
    probability: 60,
    expectedClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const { data: leadsRes, isLoading } = useGetLeadsQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined
  });

  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [convertLead, { isLoading: isConverting }] = useConvertLeadMutation();

  const leads = leadsRes?.data || [];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead(newLead).unwrap();
      setIsCreateOpen(false);
      setNewLead({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        priority: 'Medium',
        description: ''
      });
    } catch (err: any) {
      alert(err.data?.message || 'Failed to create lead');
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertLeadData) return;
    try {
      await convertLead({
        id: convertLeadData._id,
        ...convertForm
      }).unwrap();
      setConvertLeadData(null);
    } catch (err: any) {
      alert(err.data?.message || 'Failed to convert lead');
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Contacted': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Qualified': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Converted': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Lost': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Lead Management</h2>
          <p className="text-xs text-slate-400">Track, qualify, and convert leads into active deals</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Lead</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search leads by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Lead Name</th>
                <th className="p-4">Company</th>
                <th className="p-4">Source</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Assigned Exec</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Loading leads...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No leads found matching filters</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-white">{lead.name}</p>
                      <p className="text-[11px] text-slate-400">{lead.email}</p>
                    </td>
                    <td className="p-4 text-slate-300">{lead.company || '-'}</td>
                    <td className="p-4 text-slate-400">{lead.source}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
                        lead.priority === 'High' ? 'text-rose-400 bg-rose-500/10' : lead.priority === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-slate-500/10'
                      }`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {lead.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="p-4 text-right">
                      {!lead.isConverted && lead.status !== 'Converted' ? (
                        <button
                          onClick={() => {
                            setConvertLeadData(lead);
                            setConvertForm((prev) => ({ ...prev, dealName: `${lead.company || lead.name} Deal` }));
                          }}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all inline-flex items-center space-x-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Convert Lead</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-purple-400 font-medium italic">Converted</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Create New Lead</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  placeholder="Apex Financials"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  placeholder="contact@apex.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company</label>
                  <input
                    type="text"
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value as LeadSource })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>
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
                  {isCreating ? 'Saving...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead Modal */}
      {convertLeadData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Convert Lead to Customer & Deal</h3>
            </div>
            <p className="text-xs text-slate-400">
              Converting <strong className="text-white">{convertLeadData.name}</strong> will create a Customer record and a Deal record in a single ACID transaction.
            </p>

            <form onSubmit={handleConvertSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Name</label>
                <input
                  type="text"
                  required
                  value={convertForm.dealName}
                  onChange={(e) => setConvertForm({ ...convertForm, dealName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={convertForm.dealValue}
                    onChange={(e) => setConvertForm({ ...convertForm, dealValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={convertForm.probability}
                    onChange={(e) => setConvertForm({ ...convertForm, probability: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Closing Date</label>
                <input
                  type="date"
                  required
                  value={convertForm.expectedClosingDate}
                  onChange={(e) => setConvertForm({ ...convertForm, expectedClosingDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setConvertLeadData(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold"
                >
                  {isConverting ? 'Converting...' : 'Execute Conversion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

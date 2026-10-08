import React, { useState } from 'react';
import { useGetDealsQuery, useUpdateDealStageMutation } from '../services/apiSlice';
import type { Deal, DealStage } from '../types';
import { ShieldAlert } from 'lucide-react';

export const DealsPage: React.FC = () => {
  const { data: dealsRes, isLoading } = useGetDealsQuery({});
  const [updateDealStage, { isLoading: isUpdating }] = useUpdateDealStageMutation();

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [targetStage, setTargetStage] = useState<DealStage>('Won');
  const [lossReason, setLossReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const deals = dealsRes?.data || [];
  const stages: DealStage[] = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;
    setErrorMsg('');

    try {
      await updateDealStage({
        id: selectedDeal._id,
        stage: targetStage,
        lossReason: targetStage === 'Lost' ? lossReason : undefined
      }).unwrap();
      setSelectedDeal(null);
      setLossReason('');
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to update deal stage');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Sales Deals Kanban Pipeline</h2>
        <p className="text-xs text-slate-400">Manage pipeline stages & enforce business rules for deal closure</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

          const stageColors: Record<DealStage, string> = {
            Qualification: 'border-blue-500/30 bg-blue-500/5',
            Discovery: 'border-indigo-500/30 bg-indigo-500/5',
            Proposal: 'border-purple-500/30 bg-purple-500/5',
            Negotiation: 'border-amber-500/30 bg-amber-500/5',
            Won: 'border-emerald-500/30 bg-emerald-500/5',
            Lost: 'border-rose-500/30 bg-rose-500/5'
          };

          return (
            <div key={stage} className={`p-3.5 rounded-2xl glass-panel border ${stageColors[stage]} flex flex-col min-h-[500px]`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-bold text-white">{stage}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  {stageDeals.length}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mb-3">
                ${stageTotal.toLocaleString()}
              </p>

              <div className="space-y-3 flex-1">
                {isLoading ? (
                  <p className="text-[11px] text-slate-500 text-center pt-8">Loading deals...</p>
                ) : stageDeals.length === 0 ? (
                  <p className="text-[11px] text-slate-600 text-center pt-8 italic">No deals in stage</p>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal._id}
                      onClick={() => {
                        setSelectedDeal(deal);
                        setTargetStage(deal.stage);
                        setErrorMsg('');
                      }}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer shadow-md group"
                    >
                      <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {deal.name}
                      </p>
                      <p className="text-sm font-extrabold text-emerald-400 mt-1">
                        ${deal.value.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                        <span>Prob: {deal.probability}%</span>
                        <span className="text-slate-300 font-medium">{deal.assignedTo?.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Change Modal with Business Logic Validation */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Update Stage for "{selectedDeal.name}"</h3>
            <p className="text-xs text-slate-400">
              Current Stage: <span className="font-semibold text-indigo-300">{selectedDeal.stage}</span> • Value: <span className="text-emerald-400 font-bold">${selectedDeal.value.toLocaleString()}</span>
            </p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleStageSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select New Stage</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value as DealStage)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  {stages.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {targetStage === 'Lost' && (
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1">Reason for Losing Deal (Required)</label>
                  <textarea
                    required
                    rows={3}
                    value={lossReason}
                    onChange={(e) => setLossReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-rose-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    placeholder="e.g. Competitor offered lower pricing or client postponed budget..."
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDeal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                >
                  {isUpdating ? 'Updating...' : 'Confirm Stage Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

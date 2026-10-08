import React from 'react';
import { useGetTeamPerformanceQuery } from '../services/apiSlice';
import { Trophy } from 'lucide-react';

export const TeamPerformancePage: React.FC = () => {
  const { data: perfRes, isLoading } = useGetTeamPerformanceQuery();
  const performance = perfRes?.data?.performance || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Sales Team Performance</h2>
        <p className="text-xs text-slate-400">Executive leaderboards, won revenue, and conversion metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="col-span-full text-center text-xs text-slate-500 py-8">Loading performance data...</p>
        ) : performance.length === 0 ? (
          <p className="col-span-full text-center text-xs text-slate-500 py-8">No team performance data found</p>
        ) : (
          performance.map((item, idx) => (
            <div key={item.executive.id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.executive.name}</h3>
                    <p className="text-[11px] text-slate-400">{item.executive.email}</p>
                  </div>
                </div>
                <Trophy className={`w-5 h-5 ${idx === 0 ? 'text-amber-400' : 'text-slate-600'}`} />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium">Closed Revenue</span>
                  <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                    ${item.closedRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium">Conversion Rate</span>
                  <p className="text-base font-extrabold text-indigo-300 mt-0.5">
                    {item.conversionRatePercentage}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Leads: <strong className="text-white">{item.assignedLeads}</strong></span>
                <span>Converted: <strong className="text-emerald-400">{item.convertedLeads}</strong></span>
                <span>Won Deals: <strong className="text-indigo-300">{item.wonDeals}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

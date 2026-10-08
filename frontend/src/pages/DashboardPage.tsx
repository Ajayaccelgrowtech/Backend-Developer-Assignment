import React from 'react';
import {
  useGetOverviewMetricsQuery,
  useGetPipelineMetricsQuery,
  useGetActivitiesQuery,
  useCompleteActivityMutation
} from '../services/apiSlice';
import {
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  DollarSign,
  Layers
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data: overviewRes, isLoading: isOverviewLoading } = useGetOverviewMetricsQuery();
  const { data: pipelineRes } = useGetPipelineMetricsQuery();
  const { data: activitiesRes } = useGetActivitiesQuery({ status: 'Pending', limit: 5 });
  const [completeActivity] = useCompleteActivityMutation();

  const metrics = overviewRes?.data;
  const pipeline = pipelineRes?.data?.pipeline || [];
  const activities = activitiesRes?.data || [];

  if (isOverviewLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-pulse flex flex-col items-center space-y-3">
          <div className="h-8 w-32 bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-64 bg-slate-800/60 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Sales Analytics Dashboard</h2>
        <p className="text-xs text-slate-400">Real-time CRM metrics & sales pipeline breakdown</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Leads</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{metrics?.totalLeads || 0}</p>
          <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{metrics?.convertedLeads || 0} Converted</span>
            <span>•</span>
            <span>{metrics?.newLeads || 0} New</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Won Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">
            ${(metrics?.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Expected: <span className="text-indigo-300 font-medium">${(metrics?.expectedRevenue || 0).toLocaleString()}</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Conversion Rate</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {metrics?.conversionRatePercentage || 0}%
          </p>
          <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-400">
            <span>{metrics?.totalCustomers || 0} Active Customers</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Overdue Activities</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">{metrics?.overdueActivities || 0}</p>
          <p className="text-[11px] text-slate-400 mt-2">
            {metrics?.pendingActivities || 0} Total Pending Follow-ups
          </p>
        </div>
      </div>

      {/* Main Content Split: Sales Pipeline + Overdue Action List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Pipeline Stages */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Sales Pipeline Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400">{metrics?.openDeals || 0} Open Deals</span>
          </div>

          <div className="space-y-3">
            {pipeline.map((item) => {
              const maxVal = Math.max(...pipeline.map((p) => p.totalValue), 1);
              const percentage = Math.round((item.totalValue / maxVal) * 100);

              const stageColors: Record<string, string> = {
                Qualification: 'from-blue-600 to-indigo-600',
                Discovery: 'from-indigo-600 to-purple-600',
                Proposal: 'from-purple-600 to-pink-600',
                Negotiation: 'from-amber-600 to-orange-600',
                Won: 'from-emerald-600 to-teal-600',
                Lost: 'from-rose-600 to-red-600'
              };

              return (
                <div key={item.stage} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">{item.stage}</span>
                    <div className="space-x-3">
                      <span className="text-slate-400">{item.count} deals</span>
                      <span className="font-bold text-white">${item.totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stageColors[item.stage] || 'from-indigo-500 to-purple-500'} transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Items Widget */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Pending Follow-ups</h3>
          </div>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No pending follow-up activities!</p>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                      {act.type}
                    </span>
                    <p className="text-xs font-semibold text-white">{act.title}</p>
                    <p className="text-[10px] text-slate-400">Due: {new Date(act.dueDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => completeActivity(act._id)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                    title="Mark Completed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

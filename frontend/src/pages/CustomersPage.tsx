import React from 'react';
import { useGetCustomersQuery } from '../services/apiSlice';
import { Search, Building2, Mail, Phone, Calendar } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const { data: customersRes, isLoading } = useGetCustomersQuery({ search: search || undefined });
  const customers = customersRes?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Customer Directory</h2>
        <p className="text-xs text-slate-400">Converted customer accounts and historical lead relationships</p>
      </div>

      <div className="p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search customers by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="col-span-full text-center text-xs text-slate-500 py-8">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="col-span-full text-center text-xs text-slate-500 py-8">No customers found</p>
        ) : (
          customers.map((cust) => (
            <div key={cust._id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{cust.name}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-indigo-300 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{cust.company || 'Individual Account'}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {cust.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cust.email}</span>
                </div>
                {cust.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cust.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Joined: {new Date(cust.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Exec: <strong className="text-slate-200">{cust.assignedTo?.name}</strong></span>
                <span className="text-purple-400 font-medium">Converted Lead</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

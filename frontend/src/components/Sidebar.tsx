import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  LayoutDashboard,
  Users,
  Target,
  BadgeDollarSign,
  CalendarCheck,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Sales Manager', 'Sales Executive'] },
    { to: '/leads', label: 'Leads', icon: Target, roles: ['Admin', 'Sales Manager', 'Sales Executive'] },
    { to: '/deals', label: 'Deals Pipeline', icon: BadgeDollarSign, roles: ['Admin', 'Sales Manager', 'Sales Executive'] },
    { to: '/customers', label: 'Customers', icon: Users, roles: ['Admin', 'Sales Manager', 'Sales Executive'] },
    { to: '/activities', label: 'Activities', icon: CalendarCheck, roles: ['Admin', 'Sales Manager', 'Sales Executive'] },
    { to: '/performance', label: 'Team Performance', icon: TrendingUp, roles: ['Admin', 'Sales Manager'] },
    { to: '/users', label: 'User Admin', icon: ShieldAlert, roles: ['Admin'] }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 glass-panel min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Sales Navigation
        </div>

        {navItems
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </div>

      <div className="p-3.5 rounded-2xl glass-card border border-indigo-500/20 bg-gradient-to-b from-indigo-900/10 to-slate-900/40 text-center">
        <p className="text-xs font-semibold text-indigo-300">Live Backend Connected</p>
        <p className="text-[10px] text-slate-400 mt-1">RTK Query + REST API v1</p>
      </div>
    </aside>
  );
};

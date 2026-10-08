import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store';
import { LogOut, Briefcase } from 'lucide-react';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Sales Manager':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 glass-panel sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            CRM Sales Core
          </h1>
          <p className="text-xs text-slate-400">Enterprise Sales Management System</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-medium text-slate-200">{user.name}</p>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => dispatch(logout())}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

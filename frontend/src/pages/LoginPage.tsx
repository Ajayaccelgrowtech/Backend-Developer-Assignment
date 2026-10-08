import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useSeedDatabaseMutation } from '../services/apiSlice';
import { setCredentials } from '../store/authSlice';
import { Briefcase, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@crm.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [errorMsg, setErrorMsg] = useState('');
  const [seedMsg, setSeedMsg] = useState('');

  const [login, { isLoading }] = useLoginMutation();
  const [seedDatabase, { isLoading: isSeeding }] = useSeedDatabaseMutation();
  const dispatch = useDispatch();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSeedMsg('');

    try {
      const res = await login({ email, password }).unwrap();
      if (res.success && res.data) {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.tokens.accessToken,
            refreshToken: res.data.tokens.refreshToken
          })
        );
      }
    } catch (err: any) {
      // Auto-seed attempt if cloud database is fresh/empty
      try {
        await seedDatabase().unwrap();
        const retryRes = await login({ email, password }).unwrap();
        if (retryRes.success && retryRes.data) {
          dispatch(
            setCredentials({
              user: retryRes.data.user,
              accessToken: retryRes.data.tokens.accessToken,
              refreshToken: retryRes.data.tokens.refreshToken
            })
          );
          return;
        }
      } catch (seedErr: any) {
        // Fallback error message
      }
      setErrorMsg(err.data?.message || 'Login failed. Please verify credentials or seed cloud database.');
    }
  };

  const handleManualSeed = async () => {
    setErrorMsg('');
    setSeedMsg('');
    try {
      const res = await seedDatabase().unwrap();
      setSeedMsg(res.message || 'Database seeded successfully! You can now log in.');
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to seed database.');
    }
  };

  const autofillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">CRM Sales Management</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to access your sales workspace</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {seedMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium">
            {seedMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="user@crm.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSeeding}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>{isLoading || isSeeding ? 'Authenticating & Seeding...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Seed Credentials Auto-fill */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-slate-400">Quick Auto-Fill Demo Accounts:</p>
            <button
              onClick={handleManualSeed}
              disabled={isSeeding}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isSeeding ? 'Seeding...' : 'Seed Database'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => autofillDemo('admin@crm.com', 'AdminPassword123!')}
              className="px-2.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-[11px] font-medium transition-all flex flex-col items-center justify-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 mb-1" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => autofillDemo('manager@crm.com', 'ManagerPassword123!')}
              className="px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-[11px] font-medium transition-all flex flex-col items-center justify-center"
            >
              <UserCheck className="w-3.5 h-3.5 mb-1" />
              <span>Manager</span>
            </button>
            <button
              onClick={() => autofillDemo('alex.exec@crm.com', 'ExecPassword123!')}
              className="px-2.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 text-[11px] font-medium transition-all flex flex-col items-center justify-center"
            >
              <Briefcase className="w-3.5 h-3.5 mb-1" />
              <span>Exec</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

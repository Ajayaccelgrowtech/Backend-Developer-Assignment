import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { DealsPage } from './pages/DealsPage';
import { CustomersPage } from './pages/CustomersPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { TeamPerformancePage } from './pages/TeamPerformancePage';
import { UsersPage } from './pages/UsersPage';

export const App: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/performance" element={<TeamPerformancePage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;

import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard';
import HospitalAdminDashboard from './pages/HospitalAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

const AUTH_KEY = 'vaxbook_auth';

function loadAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}

function saveAuth(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export default function App() {
  const [auth, setAuth] = useState(() => loadAuth());

  useEffect(() => {
    if (auth) saveAuth(auth); else clearAuth();
  }, [auth]);

  const handleAuthSuccess = (data) => {
    // data = { token, user, hospital?, onboarding? }
    setAuth(data);
  };

  const handleLogout = () => setAuth(null);

  if (!auth) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const { user, hospital, onboarding } = auth;

  if (user?.role === 'super_admin') {
    return <SuperAdminDashboard user={user} onLogout={handleLogout} />;
  }

  if (user?.role === 'hospital_admin') {
    return <HospitalAdminDashboard user={user} hospital={hospital} onboarding={onboarding} onLogout={handleLogout} />;
  }

  return <PatientDashboard user={user} onLogout={handleLogout} />;
}
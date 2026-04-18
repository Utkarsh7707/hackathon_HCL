import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard';
import HospitalAdminDashboard from './pages/HospitalAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import DocumentUploadPage from './pages/DocumentUploadPage';

const AUTH_KEY = 'vaxbook_auth';

function loadAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}

export default function App() {
  const [auth, setAuth] = useState(() => loadAuth());

  useEffect(() => {
    if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    else localStorage.removeItem(AUTH_KEY);
  }, [auth]);

  const handleAuthSuccess = (data) => setAuth(data);
  const handleLogout = () => setAuth(null);

  // after document upload succeeds, update verification state in auth
  const handleUploadSuccess = (verificationData) => {
    setAuth((prev) => ({
      ...prev,
      verification: { ...prev.verification, ...verificationData },
    }));
  };

  if (!auth) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const { user, hospital, verification } = auth;

  if (user?.role === 'super_admin') {
    return <SuperAdminDashboard auth={auth} user={user} onLogout={handleLogout} />;
  }

  if (user?.role === 'hospital_admin') {
    // route to document upload if docs haven't been submitted yet
    if (!verification?.documentsSubmitted) {
      return <DocumentUploadPage auth={auth} onUploadSuccess={handleUploadSuccess} />;
    }
    return <HospitalAdminDashboard user={user} hospital={hospital} verification={verification} onLogout={handleLogout} />;
  }

  return <PatientDashboard user={user} onLogout={handleLogout} />;
}

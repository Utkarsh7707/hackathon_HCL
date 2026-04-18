import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import PatientBookingDashboard from './pages/PatientBookingDashboard';
import HospitalAdminDashboard from './pages/HospitalAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import DocumentUploadPage from './pages/DocumentUploadPage';
import { hospitalAdminApi } from './api/hospitalAdmin';

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

  const handleAuthSuccess  = (data) => setAuth(data);
  const handleLogout       = () => setAuth(null);

  const handleUploadSuccess = (verificationData) => {
    setAuth((prev) => ({ ...prev, verification: { ...prev.verification, ...verificationData } }));
  };

  // called by the "Check Status" button on the waiting screen —
  // re-fetches live verification state and patches auth without a full re-login
  const handleRefreshStatus = async () => {
    if (!auth?.token) return;
    try {
      const res = await hospitalAdminApi.getMyStatus(auth.token);
      setAuth((prev) => ({
        ...prev,
        hospital:     res.data.hospital,
        verification: res.data.verification,
      }));
    } catch {
      // silently ignore — user can logout and re-login if needed
    }
  };

  if (!auth) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const { user, hospital, verification } = auth;

  if (user?.role === 'super_admin') {
    return <SuperAdminDashboard auth={auth} user={user} onLogout={handleLogout} />;
  }

  if (user?.role === 'hospital_admin') {
    if (!verification?.documentsSubmitted) {
      return <DocumentUploadPage auth={auth} onUploadSuccess={handleUploadSuccess} />;
    }
    return (
      <HospitalAdminDashboard
        user={user}
        hospital={hospital}
        verification={verification}
        token={auth.token}
        onLogout={handleLogout}
        onRefresh={handleRefreshStatus}
      />
    );
  }

  return <PatientBookingDashboard user={user} token={auth.token} onLogout={handleLogout} />;
}

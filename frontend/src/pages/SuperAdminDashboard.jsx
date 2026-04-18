import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  ClipboardList, CheckCircle2, XCircle, Building2,
  Search, MapPin, Hash, CalendarDays, ChevronDown,
  Eye, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import StatCard from '../components/shared/StatCard';

/* ─── mock data ─── */
const MOCK_APPLICATIONS = [
  { id: '1', hospitalName: 'Sunrise Multi-Specialty Hospital', adminName: 'Dr. Arjun Mehta',    city: 'Mumbai',    pincode: '400054', regNumber: 'MH-HOS-2024-99901', submittedAt: '2 hrs ago',   status: 'pending' },
  { id: '2', hospitalName: 'Green Valley Clinic',              adminName: 'Dr. Sneha Patil',    city: 'Pune',      pincode: '411001', regNumber: 'MH-HOS-2024-99902', submittedAt: '5 hrs ago',   status: 'pending' },
  { id: '3', hospitalName: 'Capital Medical Centre',           adminName: 'Dr. Rajiv Anand',    city: 'New Delhi', pincode: '110001', regNumber: 'DL-HOS-2024-00341', submittedAt: '1 day ago',   status: 'pending' },
  { id: '4', hospitalName: 'Orchid Healthcare',                adminName: 'Dr. Fatima Khan',    city: 'Bengaluru', pincode: '560001', regNumber: 'KA-HOS-2024-02291', submittedAt: '2 days ago',  status: 'pending' },
  { id: '5', hospitalName: 'Lifeline Super Speciality',        adminName: 'Dr. Kiran Reddy',    city: 'Hyderabad', pincode: '500001', regNumber: 'TS-HOS-2024-03101', submittedAt: '3 days ago',  status: 'approved' },
  { id: '6', hospitalName: 'Metro Health Hub',                 adminName: 'Dr. Priya Joshi',    city: 'Chennai',   pincode: '600001', regNumber: 'TN-HOS-2024-01881', submittedAt: '4 days ago',  status: 'approved' },
  { id: '7', hospitalName: 'CareFirst Hospital',               adminName: 'Dr. Sameer Gupta',   city: 'Kolkata',   pincode: '700001', regNumber: 'WB-HOS-2024-03201', submittedAt: '5 days ago',  status: 'rejected' },
];

const STATUS_STYLE = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

/* ─── confirm modal ─── */
function ConfirmModal({ action, hospital, onConfirm, onCancel }) {
  const modalRef = useRef(null);
  const isApprove = action === 'approve';

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { scale: 0.88, opacity: 0, y: 16 },
      { scale: 1, opacity: 1, y: 0, duration: 0.28, ease: 'back.out(1.8)' }
    );
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${isApprove ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {isApprove ? <CheckCircle2 size={24} className="text-emerald-600" /> : <XCircle size={24} className="text-red-600" />}
        </div>
        <div className="text-center space-y-1">
          <p className="font-bold text-slate-800">{isApprove ? 'Approve Application?' : 'Reject Application?'}</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            {isApprove
              ? `"${hospital}" will be approved and go live on the platform.`
              : `"${hospital}" will be rejected. The admin will be notified.`
            }
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all ${isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isApprove ? 'Yes, Approve' : 'Yes, Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard({ user, onLogout }) {
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending');
  const [confirm, setConfirm] = useState(null); // { action, id, hospitalName }
  const listRef = useRef(null);

  const counts = {
    pending:  applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    total:    applications.length,
  };

  const visible = applications.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      a.hospitalName.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.regNumber.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (!listRef.current) return;
    const rows = listRef.current.querySelectorAll('[data-row]');
    gsap.fromTo(rows,
      { x: -16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
    );
  }, [filter, search]);

  const applyDecision = (id, newStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    setConfirm(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} pageTitle="Super Admin" onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* greeting */}
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's what needs your attention today.</p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Pending Approval"  value={counts.pending}  icon={ClipboardList}  color="amber"   delay={0}    trend="up" trendLabel={`${counts.pending} new`} />
          <StatCard label="Approved"          value={counts.approved} icon={CheckCircle2}   color="emerald" delay={0.06} />
          <StatCard label="Rejected"          value={counts.rejected} icon={XCircle}        color="red"     delay={0.12} />
          <StatCard label="Total Registered"  value={counts.total}    icon={Building2}      color="blue"    delay={0.18} />
        </div>

        {/* applications panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* panel header */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-slate-800 text-sm">Hospital Applications</h2>
              <p className="text-xs text-slate-500 mt-0.5">{visible.length} matching records</p>
            </div>

            {/* search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hospital, city, reg no…"
                className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-slate-50"
              />
            </div>

            {/* filter tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {['pending', 'approved', 'rejected', 'all'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    filter === f ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* list */}
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <ShieldCheck size={36} className="opacity-30" />
              <p className="text-sm font-medium">No {filter} applications</p>
            </div>
          ) : (
            <ul ref={listRef} className="divide-y divide-slate-100">
              {visible.map((app) => (
                <li key={app.id} data-row className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                    {/* hospital info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">{app.hospitalName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLE[app.status]}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={10} />{app.city}, {app.pincode}</span>
                        <span className="flex items-center gap-1"><Hash size={10} />{app.regNumber}</span>
                        <span className="flex items-center gap-1"><CalendarDays size={10} />Submitted {app.submittedAt}</span>
                      </div>
                      <p className="text-xs text-slate-400">Admin: {app.adminName}</p>
                    </div>

                    {/* actions */}
                    {app.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setConfirm({ action: 'approve', id: app.id, hospitalName: app.hospitalName })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button
                          onClick={() => setConfirm({ action: 'reject', id: app.id, hospitalName: app.hospitalName })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}

                    {app.status !== 'pending' && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all shrink-0">
                        <Eye size={12} /> View
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {confirm && (
        <ConfirmModal
          action={confirm.action}
          hospital={confirm.hospitalName}
          onConfirm={() => applyDecision(confirm.id, confirm.action === 'approve' ? 'approved' : 'rejected')}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

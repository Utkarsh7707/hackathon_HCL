import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  ClipboardList, CheckCircle2, XCircle, Building2,
  Search, MapPin, Hash, CalendarDays, Eye,
  ShieldCheck, Loader2, RefreshCw, FileImage,
  AlertCircle, X, ChevronDown,
} from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import StatCard from '../components/shared/StatCard';
import { superAdminApi } from '../api/superAdmin';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:4000';

const STATUS_STYLE = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  suspended:'bg-slate-100 text-slate-700 border-slate-300',
};

/* ─── document viewer modal ─── */
function DocModal({ verification, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { scale: 0.88, opacity: 0, y: 16 },
      { scale: 1, opacity: 1, y: 0, duration: 0.28, ease: 'back.out(1.8)' }
    );
  }, []);

  const docUrl = (filename) => filename ? `${API_BASE}/uploads/${filename}` : null;
  const isPdf  = (u) => u?.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <p className="font-bold text-slate-800 text-sm">{verification.hospital?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">Reg. {verification.hospitalRegistrationNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* admin info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Admin name', verification.admin?.name],
              ['Email',      verification.admin?.email],
              ['Phone',      verification.admin?.phone ?? '—'],
              ['City',       `${verification.hospital?.city}, ${verification.hospital?.pincode}`],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-medium">{k}</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{v}</p>
              </div>
            ))}
          </div>

          {/* documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Submitted Documents</h3>
            {[
              { label: 'Admin ID Proof',              url: docUrl(verification.adminIdProofUrl) },
              { label: 'Registration Certificate',    url: docUrl(verification.registrationCertificateUrl) },
            ].map(({ label, url }) => (
              <div key={label} className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">{label}</p>
                {url ? (
                  isPdf(url) ? (
                    <a href={url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-600 hover:underline bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <FileImage size={14} /> Open PDF document
                    </a>
                  ) : (
                    <a href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt={label} className="w-full rounded-xl border border-slate-200 object-contain max-h-56 bg-slate-50 hover:opacity-90 transition-opacity" />
                    </a>
                  )
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 border border-dashed border-slate-200">
                    <FileImage size={14} /> Not uploaded
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── confirm action modal ─── */
function ConfirmModal({ action, hospital, notes, onNotesChange, onConfirm, onCancel, loading }) {
  const ref = useRef(null);
  const isApprove = action === 'approve';
  const isReject = action === 'reject';
  const isBlacklist = action === 'blacklist';
  const isUnblacklist = action === 'unblacklist';

  useEffect(() => {
    gsap.fromTo(ref.current,
      { scale: 0.88, opacity: 0, y: 16 },
      { scale: 1, opacity: 1, y: 0, duration: 0.28, ease: 'back.out(1.8)' }
    );
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div ref={ref} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${isApprove || isUnblacklist ? 'bg-emerald-100' : isBlacklist ? 'bg-slate-200' : 'bg-red-100'}`}>
          {isApprove || isUnblacklist
            ? <CheckCircle2 size={24} className="text-emerald-600" />
            : <XCircle size={24} className={isBlacklist ? 'text-slate-700' : 'text-red-600'} />
          }
        </div>
        <div className="text-center space-y-1">
          <p className="font-bold text-slate-800">
            {isApprove && 'Approve Hospital?'}
            {isReject && 'Reject Application?'}
            {isBlacklist && 'Blacklist Hospital?'}
            {isUnblacklist && 'Restore Hospital Access?'}
          </p>
          <p className="text-sm text-slate-500">{hospital}</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            Review notes {(isApprove || isUnblacklist) ? '(optional)' : '(required)'}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={
              isApprove ? 'Any notes for the hospital admin…'
                : isReject ? 'Reason for rejection (will be shown to admin)…'
                  : isBlacklist ? 'Reason for blacklisting (access will be revoked)…'
                    : 'Reason for restoring access…'
            }
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || ((isReject || isBlacklist) && !notes.trim())}
            className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5
              ${isApprove || isUnblacklist
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : isBlacklist
                  ? 'bg-slate-700 hover:bg-slate-800'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
          >
            {loading ? <><Loader2 size={13} className="animate-spin" /> Processing…</> :
              isApprove ? 'Approve' : isReject ? 'Reject' : isBlacklist ? 'Blacklist' : 'Restore'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── main dashboard ─── */
export default function SuperAdminDashboard({ auth, user, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [fetching, setFetching]         = useState(true);
  const [fetchError, setFetchError]     = useState(null);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('pending');
  const [viewDoc, setViewDoc]           = useState(null);
  const [confirm, setConfirm]           = useState(null); // { action, id, hospitalName }
  const [notes, setNotes]               = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const listRef = useRef(null);
  const token   = auth?.token;

  const fetchData = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const res = await superAdminApi.getVerifications(token, 'all');
      setApplications(res.data ?? []);
    } catch (err) {
      setFetchError(err?.message ?? 'Failed to load applications');
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!listRef.current || fetching) return;
    const rows = listRef.current.querySelectorAll('[data-row]');
    gsap.fromTo(rows,
      { x: -16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
    );
  }, [filter, search, fetching]);

  const counts = {
    pending:  applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    suspended: applications.filter((a) => a.status === 'suspended').length,
    total:    applications.length,
  };

  const visible = applications.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      a.hospital?.name?.toLowerCase().includes(q) ||
      a.hospital?.city?.toLowerCase().includes(q) ||
      a.hospitalRegistrationNumber?.toLowerCase().includes(q) ||
      a.admin?.name?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleDecide = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (['approve', 'reject'].includes(confirm.action)) {
        await superAdminApi.decide(token, confirm.id, confirm.action, notes);
      } else if (confirm.action === 'blacklist') {
        await superAdminApi.blacklist(token, confirm.id, notes);
      } else if (confirm.action === 'unblacklist') {
        await superAdminApi.unblacklist(token, confirm.id, notes);
      }

      setApplications((prev) =>
        prev.map((a) => {
          if (a.id !== confirm.id) return a;

          let nextStatus = a.status;
          if (confirm.action === 'approve') nextStatus = 'approved';
          if (confirm.action === 'reject') nextStatus = 'rejected';
          if (confirm.action === 'blacklist') nextStatus = 'suspended';
          if (confirm.action === 'unblacklist') nextStatus = 'approved';

          return { ...a, status: nextStatus, reviewNotes: notes };
        })
      );
      setConfirm(null);
      setNotes('');
    } catch (err) {
      // keep modal open and show error in notes area
      setNotes((n) => n + '\n[Error: ' + (err?.message ?? 'failed') + ']');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} pageTitle="Super Admin" onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        <div>
          <h1 className="text-xl font-extrabold text-slate-800">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Review hospital applications and manage platform access.</p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Pending Review"  value={counts.pending}  icon={ClipboardList}  color="amber"   delay={0} />
          <StatCard label="Approved"        value={counts.approved} icon={CheckCircle2}   color="emerald" delay={0.06} />
          <StatCard label="Rejected"        value={counts.rejected} icon={XCircle}        color="red"     delay={0.12} />
          <StatCard label="Blacklisted"     value={counts.suspended} icon={AlertCircle}   color="slate"   delay={0.18} />
        </div>

        {/* applications panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-slate-800 text-sm">Hospital Applications</h2>
              <p className="text-xs text-slate-500 mt-0.5">{visible.length} matching records</p>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hospital, admin, reg no…"
                className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-slate-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['pending', 'approved', 'rejected', 'suspended', 'all'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${filter === f ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all" title="Refresh">
                <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* body */}
          {fetching ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
              <Loader2 size={18} className="animate-spin" /> Loading applications…
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-500">
              <AlertCircle size={28} className="opacity-60" />
              <p className="text-sm font-medium">{fetchError}</p>
              <button onClick={fetchData} className="text-xs text-blue-600 hover:underline">Retry</button>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <ShieldCheck size={36} className="opacity-30" />
              <p className="text-sm font-medium">No {filter} applications</p>
            </div>
          ) : (
            <ul ref={listRef} className="divide-y divide-slate-100">
              {visible.map((app) => (
                <li key={app.id} data-row className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">{app.hospital?.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLE[app.status]}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={10} />{app.hospital?.city}, {app.hospital?.pincode}</span>
                        <span className="flex items-center gap-1"><Hash size={10} />{app.hospitalRegistrationNumber}</span>
                        <span className="flex items-center gap-1"><CalendarDays size={10} />
                          {new Date(app.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Admin: {app.admin?.name} · {app.admin?.email}</p>
                      {app.status === 'rejected' && app.reviewNotes && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle size={10} /> {app.reviewNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => setViewDoc(app)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                      >
                        <Eye size={12} /> Documents
                      </button>

                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setConfirm({ action: 'approve', id: app.id, hospitalName: app.hospital?.name }); setNotes(''); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button
                            onClick={() => { setConfirm({ action: 'reject', id: app.id, hospitalName: app.hospital?.name }); setNotes(''); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </>
                      )}

                      {(app.status === 'approved' || app.status === 'pending' || app.status === 'rejected') && (
                        <button
                          onClick={() => { setConfirm({ action: 'blacklist', id: app.id, hospitalName: app.hospital?.name }); setNotes(''); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all"
                        >
                          <XCircle size={12} /> Blacklist
                        </button>
                      )}

                      {app.status === 'suspended' && (
                        <button
                          onClick={() => { setConfirm({ action: 'unblacklist', id: app.id, hospitalName: app.hospital?.name }); setNotes(''); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                        >
                          <CheckCircle2 size={12} /> Restore Access
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {viewDoc && <DocModal verification={viewDoc} onClose={() => setViewDoc(null)} />}

      {confirm && (
        <ConfirmModal
          action={confirm.action}
          hospital={confirm.hospitalName}
          notes={notes}
          onNotesChange={setNotes}
          onConfirm={handleDecide}
          onCancel={() => { setConfirm(null); setNotes(''); }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

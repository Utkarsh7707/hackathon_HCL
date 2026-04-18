import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Clock, CheckCircle2, XCircle, AlertTriangle,
  Users, Sun, Sunset, PackageCheck, BarChart3,
  LogOut, RefreshCw, LayoutDashboard, Syringe, CalendarDays,
} from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import StatCard from '../components/shared/StatCard';
import InventoryTab from '../components/hospital-admin/InventoryTab';
import AvailabilityTab from '../components/hospital-admin/AvailabilityTab';
import BookingsTab from '../components/hospital-admin/BookingsTab';

/* ─── docs not yet uploaded ─── */
function DocsPendingState({ hospitalName, onLogout }) {
  const cardRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div ref={cardRef} className="bg-white rounded-2xl border border-blue-200 shadow-sm max-w-sm w-full p-8 space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">
          <Syringe size={28} className="text-blue-600" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg">Complete Your Profile</h2>
          <p className="text-sm text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{hospitalName}</span> is registered. Upload your verification documents to proceed.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-red-500 hover:border-red-100 transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}

/* ─── pending / rejected states ─── */
function PendingState({ hospitalName, onLogout, onRefresh }) {
  const [checking, setChecking] = useState(false);
  const cardRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  const handleRefresh = async () => {
    setChecking(true);
    await onRefresh?.();
    setChecking(false);
  };

  const steps = [
    { label: 'Application Submitted',      done: true  },
    { label: 'Document Verification',      done: true  },
    { label: 'Super Admin Review',         done: false, active: true },
    { label: 'Platform Onboarding',        done: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div ref={cardRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Clock size={32} className="text-amber-600" />
          </div>
          <div className="text-center">
            <h2 className="font-extrabold text-slate-800 text-lg">Application Under Review</h2>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{hospitalName}</span> is being reviewed by our team.
            </p>
          </div>
        </div>

        {/* timeline */}
        <ol className="space-y-0">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10
                  ${step.done ? 'bg-emerald-500' : step.active ? 'bg-amber-400 ring-4 ring-amber-100' : 'bg-slate-200'}`}>
                  {step.done
                    ? <CheckCircle2 size={14} className="text-white" />
                    : <div className={`w-2 h-2 rounded-full ${step.active ? 'bg-white' : 'bg-slate-400'}`} />
                  }
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-0.5 h-8 mt-0.5 ${step.done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </div>
              <div className="pb-8 pt-0.5 last:pb-0">
                <p className={`text-sm font-semibold ${step.done ? 'text-emerald-700' : step.active ? 'text-amber-700' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                {step.active && <p className="text-xs text-slate-400 mt-0.5">Usually takes 24–48 hours</p>}
              </div>
            </li>
          ))}
        </ol>

        <p className="text-xs text-center text-slate-400 bg-slate-50 rounded-xl p-3">
          Log out and back in after approval to access your full dashboard.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all disabled:opacity-60"
          >
            <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking…' : 'Check Status'}
          </button>
          <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-red-500 hover:border-red-100 transition-all"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectedState({ hospitalName, reviewNotes, onLogout }) {
  const cardRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div ref={cardRef} className="bg-white rounded-2xl border border-red-200 shadow-sm max-w-md w-full p-8 space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
            <XCircle size={32} className="text-red-600" />
          </div>
          <div className="text-center">
            <h2 className="font-extrabold text-slate-800 text-lg">Verification Failed</h2>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{hospitalName}</span>'s application was not approved.
            </p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} /> Reason from Super Admin
          </p>
          <p className="text-sm text-red-600 leading-relaxed">
            {reviewNotes?.trim()
              ? reviewNotes
              : 'Your application did not meet the verification requirements. Please contact support for more information.'}
          </p>
        </div>
        <p className="text-xs text-center text-slate-400 bg-slate-50 rounded-xl p-3">
          If you believe this is an error, contact <span className="font-semibold text-slate-600">support@vaxbook.in</span>
        </p>
        <button
          onClick={onLogout}
          className="w-full py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

function BlacklistedState({ hospitalName, reviewNotes, onLogout }) {
  const cardRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div ref={cardRef} className="bg-white rounded-2xl border border-slate-300 shadow-sm max-w-md w-full p-8 space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center">
            <XCircle size={32} className="text-slate-700" />
          </div>
          <div className="text-center">
            <h2 className="font-extrabold text-slate-800 text-lg">Hospital Blacklisted</h2>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{hospitalName}</span> is blacklisted for now.
            </p>
          </div>
        </div>

        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} /> Message from Super Admin
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {reviewNotes?.trim() || 'Your hospital access has been temporarily suspended by the super admin.'}
          </p>
        </div>

        <p className="text-xs text-center text-slate-400 bg-slate-50 rounded-xl p-3">
          Contact support or super admin to restore access.
        </p>

        <button
          onClick={onLogout}
          className="w-full py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'overview',     label: 'Overview',     icon: LayoutDashboard },
  { id: 'inventory',    label: 'Inventory',    icon: Syringe         },
  { id: 'availability', label: 'Availability', icon: CalendarDays    },
  { id: 'bookings',     label: 'Bookings',     icon: Users           },
];

/* ─── approved full dashboard ─── */
function ApprovedDashboard({ user, hospital, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const mainRef  = useRef(null);
  const tabRef   = useRef(null);

  useEffect(() => {
    gsap.fromTo(mainRef.current?.querySelectorAll('[data-animate]'),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  useEffect(() => {
    if (!tabRef.current) return;
    gsap.fromTo(tabRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
    );
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} pageTitle="Hospital Dashboard" onLogout={onLogout} />

      <main ref={mainRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* hospital identity bar */}
        <div data-animate className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-extrabold text-slate-800">{hospital?.name ?? 'Your Hospital'}</h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={10} /> Approved &amp; Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{hospital?.city} · {hospital?.pincode} · Reg: {hospital?.registrationNumber}</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-100 transition-all shrink-0">
            <BarChart3 size={13} /> Analytics
          </button>
        </div>

        {/* stats row */}
        <div data-animate className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Bookings"     value="—"  icon={Users}       color="blue"    delay={0} />
          <StatCard label="Morning Slots"        value="—"  icon={Sun}         color="amber"   delay={0.06} />
          <StatCard label="Afternoon Slots"      value="—"  icon={Sunset}      color="violet"  delay={0.12} />
          <StatCard label="Vaccines in Inventory"value="—"  icon={PackageCheck} color="emerald" delay={0.18} />
        </div>

        {/* tab bar */}
        <div data-animate className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 -mb-px
                  ${activeTab === id
                    ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div ref={tabRef} className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 text-center py-8">
                  Overview analytics will populate once bookings start coming in.<br />
                  Use the <span className="font-semibold text-slate-700">Inventory</span>, <span className="font-semibold text-slate-700">Availability</span>, and <span className="font-semibold text-slate-700">Bookings</span> tabs to manage operations.
                </p>
              </div>
            )}
            {activeTab === 'inventory'    && <InventoryTab    token={token} />}
            {activeTab === 'availability' && <AvailabilityTab token={token} />}
            {activeTab === 'bookings'     && <BookingsTab     token={token} />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── main export ─── */
export default function HospitalAdminDashboard({ user, hospital, verification, token, onLogout, onRefresh }) {
  const hospitalName  = hospital?.name ?? 'Your Hospital';
  const reviewNotes   = verification?.reviewNotes ?? '';
  const status        = verification?.status ?? hospital?.onboardingStatus ?? 'pending';
  const docsSubmitted = verification?.documentsSubmitted ?? false;

  if (!docsSubmitted)        return <DocsPendingState hospitalName={hospitalName} onLogout={onLogout} />;
  if (status === 'rejected') return <RejectedState    hospitalName={hospitalName} reviewNotes={reviewNotes} onLogout={onLogout} />;
  if (status === 'suspended') return <BlacklistedState hospitalName={hospitalName} reviewNotes={reviewNotes} onLogout={onLogout} />;
  if (status !== 'approved') return <PendingState     hospitalName={hospitalName} onLogout={onLogout} onRefresh={onRefresh} />;
  return <ApprovedDashboard user={user} hospital={hospital} token={token} onLogout={onLogout} />;
}

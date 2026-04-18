import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Clock, CheckCircle2, XCircle, AlertTriangle,
  Syringe, Users, Sun, Sunset, PackageCheck,
  TrendingUp, ChevronRight, PlusCircle, BarChart3,
} from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import StatCard from '../components/shared/StatCard';

/* ─── mock vaccine inventory ─── */
const MOCK_VACCINES = [
  { name: 'COVID-19 (Covishield)', doses: 120, used: 87,  price: 850  },
  { name: 'Influenza (Fluzone)',   doses: 80,  used: 34,  price: 600  },
  { name: 'Hepatitis B',           doses: 60,  used: 60,  price: 450  },
  { name: 'Typhoid (Typbar)',      doses: 100, used: 12,  price: 350  },
  { name: 'HPV (Gardasil)',        doses: 40,  used: 18,  price: 1800 },
];

/* ─── docs not yet uploaded ─── */
function DocsPendingState({ hospitalName }) {
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
        <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
          You'll be redirected to the document upload page automatically on next login.
        </p>
      </div>
    </div>
  );
}

/* ─── pending / rejected states ─── */
function PendingState({ hospitalName }) {
  const cardRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

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
          You'll receive an email notification once a decision is made.
        </p>
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

/* ─── approved full dashboard ─── */
function ApprovedDashboard({ user, hospital, onLogout }) {
  const mainRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(mainRef.current?.querySelectorAll('[data-animate]'),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  const sessionData = {
    morning:   { booked: 38, total: 50 },
    afternoon: { booked: 9,  total: 12 },
  };

  const morningPct   = Math.round((sessionData.morning.booked   / sessionData.morning.total)   * 100);
  const afternoonPct = Math.round((sessionData.afternoon.booked / sessionData.afternoon.total) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} pageTitle="Hospital Dashboard" onLogout={onLogout} />

      <main ref={mainRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

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
            <BarChart3 size={13} /> View Analytics
          </button>
        </div>

        {/* stats */}
        <div data-animate className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Bookings"    value="47"  icon={Users}       color="blue"    delay={0}    trend="up" trendLabel="+12%" />
          <StatCard label="Morning Slots Left"  value={sessionData.morning.total - sessionData.morning.booked}    icon={Sun}        color="amber"   delay={0.06} />
          <StatCard label="Afternoon Slots Left"value={sessionData.afternoon.total - sessionData.afternoon.booked} icon={Sunset}     color="violet"  delay={0.12} />
          <StatCard label="Vaccines in Stock"   value="4"   icon={PackageCheck} color="emerald" delay={0.18} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* today's sessions */}
          <div data-animate className="lg:col-span-1 space-y-4">
            <h2 className="font-bold text-slate-800 text-sm">Today's Sessions</h2>

            {[
              { label: "Morning", icon: Sun, time: "09:00 – 13:00", booked: sessionData.morning.booked,   total: sessionData.morning.total,   pct: morningPct,   color: "amber"  },
              { label: "Afternoon", icon: Sunset, time: "14:00 – 18:00", booked: sessionData.afternoon.booked, total: sessionData.afternoon.total, pct: afternoonPct, color: "violet" },
            ].map((s) => {
              const isFull = s.booked >= s.total;
              const barColor = isFull ? 'bg-red-500' : s.pct >= 80 ? 'bg-amber-500' : 'bg-blue-500';
              return (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-${s.color}-100`}>
                        <s.icon size={14} className={`text-${s.color}-600`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.label}</p>
                        <p className="text-xs text-slate-400">{s.time}</p>
                      </div>
                    </div>
                    {isFull && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">FULL</span>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>{s.booked} booked</span>
                      <span>{s.total - s.booked} left</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${s.pct}%` }} />
                    </div>
                    <p className="text-right text-xs text-slate-400 mt-1">{s.pct}% capacity</p>
                  </div>
                </div>
              );
            })}

            <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl py-3 transition-all">
              <PlusCircle size={13} /> Manage Slot Capacity
            </button>
          </div>

          {/* vaccine inventory */}
          <div data-animate className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Vaccine Inventory</h2>
                <p className="text-xs text-slate-500 mt-0.5">Stock levels as of today</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Manage <ChevronRight size={12} />
              </button>
            </div>
            <ul className="divide-y divide-slate-100">
              {MOCK_VACCINES.map((v) => {
                const pct = Math.round((v.used / v.doses) * 100);
                const remaining = v.doses - v.used;
                const isLow = remaining <= 10;
                return (
                  <li key={v.name} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Syringe size={13} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-700 truncate">{v.name}</p>
                        {isLow && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <AlertTriangle size={9} /> Low stock
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">{remaining} left / {v.doses}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 shrink-0">₹{v.price.toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── main export ─── */
export default function HospitalAdminDashboard({ user, hospital, verification, onLogout }) {
  const hospitalName = hospital?.name ?? 'Your Hospital';
  const reviewNotes  = verification?.reviewNotes ?? '';
  const status       = verification?.status ?? hospital?.onboardingStatus ?? 'pending';
  const docsSubmitted = verification?.documentsSubmitted ?? false;

  if (!docsSubmitted)       return <DocsPendingState hospitalName={hospitalName} />;
  if (status === 'rejected') return <RejectedState hospitalName={hospitalName} reviewNotes={reviewNotes} onLogout={onLogout} />;
  if (status !== 'approved') return <PendingState   hospitalName={hospitalName} />;
  return <ApprovedDashboard user={user} hospital={hospital} onLogout={onLogout} />;
}

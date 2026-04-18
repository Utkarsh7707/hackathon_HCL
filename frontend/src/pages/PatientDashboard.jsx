import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  CalendarDays, Syringe, MapPin, Search, Clock,
  ChevronRight, CheckCircle2, Building2, ArrowRight,
  Sparkles, HeartPulse,
} from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import StatCard from '../components/shared/StatCard';

/* ─── mock data ─── */
const UPCOMING_BOOKINGS = [
  {
    id: '1', vaccine: 'COVID-19 (Covishield)', hospital: 'Lilavati Hospital',
    city: 'Mumbai', date: 'Tomorrow, 22 Apr', session: 'Morning', slot: '10:30 AM',
    status: 'confirmed',
  },
];

const PAST_BOOKINGS = [
  { id: '2', vaccine: 'Influenza (Fluzone)',  hospital: 'Apollo Hospital',    date: '10 Apr 2026', status: 'completed' },
  { id: '3', vaccine: 'Hepatitis B (Dose 2)', hospital: 'Fortis Hospital',    date: '14 Mar 2026', status: 'completed' },
  { id: '4', vaccine: 'Typhoid',              hospital: 'Ruby Hall Clinic',   date: '02 Jan 2026', status: 'completed' },
];

const NEARBY_HOSPITALS = [
  { id: '1', name: 'Lilavati Hospital',        city: 'Mumbai',    distance: '1.2 km', vaccines: ['COVID-19', 'Influenza'],   morningLeft: 12, afternoonLeft: 6  },
  { id: '2', name: 'Kokilaben Ambani Hospital', city: 'Mumbai',    distance: '2.8 km', vaccines: ['Hepatitis B', 'Typhoid'],  morningLeft: 0,  afternoonLeft: 4  },
  { id: '3', name: 'Nanavati Hospital',         city: 'Mumbai',    distance: '3.5 km', vaccines: ['HPV', 'COVID-19'],         morningLeft: 24, afternoonLeft: 0  },
];

/* ─── quick hospital card ─── */
function HospitalSnippet({ h }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 space-y-3 cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Building2 size={16} className="text-blue-600" />
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={9} />{h.distance}</span>
      </div>
      <div>
        <p className="font-bold text-slate-800 text-sm leading-tight">{h.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{h.city}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {h.vaccines.map((v) => (
          <span key={v} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{v}</span>
        ))}
      </div>
      <div className="flex gap-2 text-xs">
        <span className={`flex-1 text-center py-1 rounded-lg font-semibold ${h.morningLeft > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400 line-through'}`}>
          ☀ {h.morningLeft > 0 ? `${h.morningLeft} left` : 'Full'}
        </span>
        <span className={`flex-1 text-center py-1 rounded-lg font-semibold ${h.afternoonLeft > 0 ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-400 line-through'}`}>
          🌆 {h.afternoonLeft > 0 ? `${h.afternoonLeft} left` : 'Full'}
        </span>
      </div>
    </div>
  );
}

export default function PatientDashboard({ user, onLogout }) {
  const [searchVal, setSearchVal] = useState('');
  const mainRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      mainRef.current?.querySelectorAll('[data-animate]'),
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.09, duration: 0.42, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} pageTitle="Dashboard" onLogout={onLogout} />

      <main ref={mainRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* welcome hero */}
        <div data-animate className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-blue-200 text-sm font-medium flex items-center gap-1.5">
                <Sparkles size={13} /> Hello, {firstName}!
              </p>
              <h1 className="text-2xl font-extrabold">Stay protected, stay healthy.</h1>
              <p className="text-blue-200 text-sm">You have <span className="font-bold text-white">1 upcoming</span> vaccine appointment.</p>
            </div>
            <button className="flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-5 py-3 rounded-xl hover:bg-blue-50 transition-all shrink-0 shadow-lg">
              Book a Slot <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* stat cards */}
        <div data-animate className="grid grid-cols-3 gap-4">
          <StatCard label="Upcoming"       value={UPCOMING_BOOKINGS.length} icon={CalendarDays} color="blue"    delay={0}    />
          <StatCard label="Doses Taken"    value={PAST_BOOKINGS.length}     icon={Syringe}      color="emerald" delay={0.06} trend="up" trendLabel="3 this year" />
          <StatCard label="Nearby Hospitals" value={NEARBY_HOSPITALS.length} icon={Building2}  color="violet"  delay={0.12} />
        </div>

        {/* search */}
        <div data-animate className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <HeartPulse size={15} className="text-blue-600" />
            <h2 className="font-bold text-slate-800 text-sm">Find Vaccines Near You</h2>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Enter city, pincode, or vaccine name…"
                className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-slate-50"
              />
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all">
              Search
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* left — upcoming + past bookings */}
          <div className="lg:col-span-2 space-y-6">

            {/* upcoming */}
            <div data-animate className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800 text-sm">Upcoming Appointments</h2>
                <button className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-0.5">
                  All bookings <ChevronRight size={12} />
                </button>
              </div>
              {UPCOMING_BOOKINGS.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <Syringe size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-slate-800 text-sm">{b.vaccine}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Building2 size={10} />{b.hospital}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><CalendarDays size={10} />{b.date}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{b.slot} · {b.session}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 h-fit flex items-center gap-1">
                    <CheckCircle2 size={10} /> Confirmed
                  </span>
                </div>
              ))}
            </div>

            {/* past */}
            <div data-animate className="space-y-3">
              <h2 className="font-bold text-slate-800 text-sm">Vaccination History</h2>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <ul className="divide-y divide-slate-100">
                  {PAST_BOOKINGS.map((b) => (
                    <li key={b.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{b.vaccine}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{b.hospital}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{b.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* right — nearby hospitals */}
          <div data-animate className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-sm">Nearby Hospitals</h2>
              <button className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-0.5">
                View all <ChevronRight size={12} />
              </button>
            </div>
            {NEARBY_HOSPITALS.map((h) => (
              <HospitalSnippet key={h.id} h={h} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

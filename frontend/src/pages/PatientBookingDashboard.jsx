import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Search, MapPin, Syringe, Sun, Sunset, CalendarDays,
  ChevronRight, X, Loader2, CheckCircle2, AlertCircle,
  Filter, Building2, ArrowLeft, Sparkles, Clock, RefreshCw,
} from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { patientApi } from '../api/patient';

/* ── helpers ── */
const VACCINE_TYPES = [
  { value: '',           label: 'All Vaccines'  },
  { value: 'covid19',    label: 'COVID-19'      },
  { value: 'influenza',  label: 'Influenza'     },
  { value: 'hepatitisB', label: 'Hepatitis B'   },
  { value: 'hepatitisA', label: 'Hepatitis A'   },
  { value: 'typhoid',    label: 'Typhoid'       },
  { value: 'hpv',        label: 'HPV'           },
  { value: 'mmr',        label: 'MMR'           },
  { value: 'varicella',  label: 'Varicella'     },
  { value: 'rabies',     label: 'Rabies'        },
];

const TYPE_COLOR = {
  covid19:'bg-blue-100 text-blue-700', influenza:'bg-purple-100 text-purple-700',
  hepatitisB:'bg-green-100 text-green-700', hepatitisA:'bg-teal-100 text-teal-700',
  typhoid:'bg-yellow-100 text-yellow-700', hpv:'bg-pink-100 text-pink-700',
  mmr:'bg-orange-100 text-orange-700', varicella:'bg-indigo-100 text-indigo-700',
  rabies:'bg-red-100 text-red-700', other:'bg-slate-100 text-slate-600',
};

function buildDateStrip(n = 10) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return {
      iso:     d.toISOString().split('T')[0],
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      day:     d.getDate(),
      month:   d.toLocaleDateString('en-IN', { month: 'short' }),
      isToday: i === 0,
    };
  });
}
const DATE_STRIP = buildDateStrip(10);

/* ── toast ── */
function Toast({ toast }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
  }, [toast]);
  if (!toast) return null;
  const isErr = toast.type === 'error';
  return (
    <div ref={ref} className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm w-full
      ${isErr ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
      {isErr ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
      {toast.msg}
    </div>
  );
}

/* ── session card ── */
function SessionCard({ session, selected, onSelect, disabled }) {
  const isAfternoon = session.name === 'Afternoon';
  const pct         = session.limit > 0 ? Math.round((session.booked / session.limit) * 100) : 0;
  const barColor    = session.isSoldOut ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <button
      disabled={session.isSoldOut || disabled}
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-5 transition-all space-y-3
        ${session.isSoldOut || disabled
          ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
          : selected
            ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAfternoon ? <Sunset size={16} className="text-violet-500" /> : <Sun size={16} className="text-amber-500" />}
          <span className="font-bold text-slate-800 text-sm">{session.name}</span>
          <span className="text-xs text-slate-400">{session.startTime} – {session.endTime}</span>
        </div>
        {session.isSoldOut ? (
          <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Sold Out</span>
        ) : selected ? (
          <CheckCircle2 size={16} className="text-blue-600" />
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <p className={`text-xs font-semibold ${session.isSoldOut ? 'text-red-500' : 'text-slate-600'}`}>
          {session.isSoldOut ? '0 slots left' : `${session.remaining} slot${session.remaining !== 1 ? 's' : ''} left`}
          <span className="font-normal text-slate-400"> / {session.limit} total</span>
        </p>
      </div>
    </button>
  );
}

/* ── hospital card ── */
function HospitalCard({ hospital, onSelect, isSelected }) {
  return (
    <div
      onClick={() => onSelect(hospital)}
      className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer p-5 space-y-4
        ${isSelected ? 'border-blue-500' : 'border-slate-200 hover:border-blue-200'}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm leading-tight">{hospital.name}</p>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin size={10} />{hospital.city}, {hospital.pincode}
          </p>
          {hospital.address && <p className="text-xs text-slate-400 truncate mt-0.5">{hospital.address}</p>}
        </div>
        {isSelected && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {hospital.availableVaccines.map((inv) => (
          <span key={inv.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOR[inv.vaccine.type] ?? TYPE_COLOR.other}`}>
            {inv.vaccine.name}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <span className="text-xs text-slate-500">{hospital.availableVaccines.length} vaccine{hospital.availableVaccines.length !== 1 ? 's' : ''} available</span>
        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
          Book <ChevronRight size={11} />
        </span>
      </div>
    </div>
  );
}

/* ── booking panel ── */
function BookingPanel({ hospital, token, onClose, onBooked }) {
  const [selectedDate,    setSelectedDate]    = useState(DATE_STRIP[0].iso);
  const [slots,           setSlots]           = useState([]);
  const [loadingSlots,    setLoadingSlots]    = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(hospital.availableVaccines[0]?.vaccine?.id ?? null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [booking,         setBooking]         = useState(false);
  const [booked,          setBooked]          = useState(false);
  const [error,           setError]           = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { x: 40, opacity: 0 },
      { x: 0,  opacity: 1, duration: 0.35, ease: 'power3.out' }
    );
  }, []);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true); setSelectedSession(null); setSlots([]);
    try {
      const res = await patientApi.getSlots(hospital.id, selectedDate);
      setSlots(res.data ?? []);
    } finally {
      setLoadingSlots(false);
    }
  }, [hospital.id, selectedDate]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const activeSlot = slots.find((s) => {
    const vid = s.vaccine?.id ?? s.vaccine?._id;
    return vid === selectedVaccine || vid?.toString() === selectedVaccine;
  });

  const handleBook = async () => {
    if (!activeSlot || !selectedSession) return;
    setBooking(true); setError('');
    try {
      const res = await patientApi.book(token, {
        hospitalId:  hospital.id,
        vaccineId:   activeSlot.vaccine?.id ?? activeSlot.vaccine?._id,
        slotDayId:   activeSlot.id,
        sessionName: selectedSession,
        date:        selectedDate,
      });
      setBooked(true);
      if (panelRef.current) {
        gsap.fromTo(panelRef.current.querySelector('[data-success]'),
          { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }
        );
      }
      setTimeout(() => onBooked(res.data), 2200);
    } catch (err) {
      setError(err?.message ?? 'Booking failed. Please try again.');
      gsap.to(panelRef.current, { x: -6, duration: 0.06, repeat: 5, yoyo: true, ease: 'none', onComplete: () => gsap.set(panelRef.current, { x: 0 }) });
    } finally {
      setBooking(false);
    }
  };

  const vaccines = hospital.availableVaccines;

  return (
    <div ref={panelRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{hospital.name}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={9} />{hospital.city}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
          <X size={15} />
        </button>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto flex-1">

        {booked ? (
          <div data-success className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-extrabold text-slate-800 text-lg">Booking Confirmed!</p>
              <p className="text-sm text-slate-500">{selectedSession} session on {selectedDate}</p>
              <p className="text-xs text-slate-400 mt-2">Redirecting to your bookings…</p>
            </div>
          </div>
        ) : (
          <>
            {/* vaccine selector */}
            {vaccines.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">Select Vaccine</p>
                <div className="flex flex-wrap gap-2">
                  {vaccines.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => { setSelectedVaccine(inv.vaccine.id); setSelectedSession(null); }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all
                        ${selectedVaccine === inv.vaccine.id
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                    >
                      {inv.vaccine.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* date strip */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">Select Date</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {DATE_STRIP.map(({ iso, weekday, day, month, isToday }) => (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={`flex flex-col items-center shrink-0 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all min-w-[48px]
                      ${selectedDate === iso
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : isToday ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                  >
                    <span className="text-[9px] opacity-70">{weekday}</span>
                    <span className="text-sm font-extrabold leading-tight">{day}</span>
                    <span className="text-[9px] opacity-70">{month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* sessions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">Choose Session</p>
                <button onClick={loadSlots} className="text-slate-400 hover:text-blue-500 transition-colors">
                  <RefreshCw size={12} className={loadingSlots ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Checking availability…
                </div>
              ) : !activeSlot ? (
                <div className="flex flex-col items-center py-8 gap-2 text-slate-400">
                  <Clock size={28} className="opacity-30" />
                  <p className="text-sm font-medium">No sessions set for this date</p>
                  <p className="text-xs">The hospital hasn't configured slots for {selectedDate} yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {activeSlot.sessions.map((s) => (
                    <SessionCard
                      key={s.name}
                      session={s}
                      selected={selectedSession === s.name}
                      onSelect={() => setSelectedSession(s.name)}
                      disabled={false}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* price */}
            {activeSlot && selectedSession && (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-600 font-medium">Price for {selectedDate}</span>
                <span className="text-lg font-extrabold text-slate-800">₹{activeSlot.priceAtDate?.toLocaleString()}</span>
              </div>
            )}

            {/* error */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <AlertCircle size={11} /> {error}
              </p>
            )}

            {/* confirm button */}
            <button
              onClick={handleBook}
              disabled={!selectedSession || booking || !activeSlot}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 rounded-xl transition-all"
            >
              {booking
                ? <><Loader2 size={15} className="animate-spin" /> Confirming Booking…</>
                : <>Confirm Booking <ChevronRight size={15} /></>
              }
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── main dashboard ── */
export default function PatientBookingDashboard({ user, token, onLogout }) {
  const [query,           setQuery]          = useState('');
  const [vaccineType,     setVaccineType]    = useState('');
  const [hospitals,       setHospitals]      = useState([]);
  const [loading,         setLoading]        = useState(false);
  const [fetched,         setFetched]        = useState(false);
  const [selectedHospital,setSelectedHospital] = useState(null);
  const [toast,           setToast]          = useState(null);
  const [myBookings,      setMyBookings]     = useState([]);
  const [showBookings,    setShowBookings]   = useState(false);

  const gridRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(searchRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const search = useCallback(async () => {
    setLoading(true); setFetched(false);
    try {
      const city    = /^\d+$/.test(query.trim()) ? undefined : query.trim();
      const pincode = /^\d+$/.test(query.trim()) ? query.trim() : undefined;
      const res = await patientApi.searchHospitals({ city, pincode, vaccineType: vaccineType || undefined });
      setHospitals(res.data ?? []);
      setFetched(true);
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.querySelectorAll('[data-card]'),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.35, ease: 'power2.out' }
        );
      }
    } catch {
      showToast('error', 'Search failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [query, vaccineType]);

  /* initial load */
  useEffect(() => { search(); }, []);

  const loadMyBookings = async () => {
    if (!token) return;
    try {
      const res = await patientApi.myBookings(token);
      setMyBookings(res.data ?? []);
      setShowBookings(true);
    } catch { showToast('error', 'Could not load bookings.'); }
  };

  const handleBooked = (booking) => {
    setMyBookings((prev) => [booking, ...prev]);
    setSelectedHospital(null);
    showToast('success', 'Slot booked! Check "My Bookings" to see your appointment.');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} pageTitle="Book a Vaccine" onLogout={onLogout} />
      <Toast toast={toast} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* hero search bar */}
        <div ref={searchRef} className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 space-y-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium flex items-center gap-1.5 mb-1"><Sparkles size={13} /> Find vaccines near you</p>
            <h1 className="text-2xl font-extrabold text-white">Search Hospitals</h1>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="City name or Pincode…"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white border-0 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-slate-400"
              />
            </div>
            <div className="relative sm:w-48">
              <Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={vaccineType}
                onChange={(e) => setVaccineType(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-sm rounded-xl bg-white border-0 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer"
              >
                {VACCINE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={search}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white text-blue-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-blue-50 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              Search
            </button>
          </div>
        </div>

        {/* my bookings bar */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {fetched ? `${hospitals.length} hospital${hospitals.length !== 1 ? 's' : ''} found` : ''}
          </p>
          <button
            onClick={showBookings ? () => setShowBookings(false) : loadMyBookings}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 transition-all"
          >
            <CalendarDays size={13} /> My Bookings {myBookings.length > 0 && `(${myBookings.length})`}
          </button>
        </div>

        {/* my bookings drawer */}
        {showBookings && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800 text-sm">My Bookings</p>
              <button onClick={() => setShowBookings(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <X size={14} />
              </button>
            </div>
            {myBookings.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">No bookings yet.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {myBookings.map((b) => (
                  <li key={b.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Syringe size={14} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{b.vaccineId?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{b.hospitalId?.name} · {b.sessionName} · {b.date}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize
                      ${b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {b.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* main content — hospital grid + booking panel */}
        <div className={`grid gap-6 ${selectedHospital ? 'lg:grid-cols-[1fr_420px]' : 'grid-cols-1'}`}>

          {/* hospital grid */}
          <div className="space-y-4">
            {loading && !fetched && (
              <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
                <Loader2 size={18} className="animate-spin" /> Searching hospitals…
              </div>
            )}

            {fetched && hospitals.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
                <Building2 size={36} className="opacity-30" />
                <p className="text-sm font-medium">No hospitals found</p>
                <p className="text-xs text-center">Try a different city, pincode, or vaccine type.</p>
              </div>
            )}

            {hospitals.length > 0 && (
              <>
                {selectedHospital && (
                  <button
                    onClick={() => setSelectedHospital(null)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeft size={12} /> Back to all hospitals
                  </button>
                )}
                <div ref={gridRef} className={`grid gap-4 ${selectedHospital ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {(selectedHospital ? hospitals.filter((h) => h.id === selectedHospital.id) : hospitals).map((h) => (
                    <div key={h.id} data-card>
                      <HospitalCard
                        hospital={h}
                        onSelect={setSelectedHospital}
                        isSelected={selectedHospital?.id === h.id}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* booking panel */}
          {selectedHospital && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <BookingPanel
                hospital={selectedHospital}
                token={token}
                onClose={() => setSelectedHospital(null)}
                onBooked={handleBooked}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Sun, Sunset, Save, Loader2, CheckCircle2,
  AlertTriangle, CalendarDays, Syringe, RefreshCw,
} from 'lucide-react';
import { inventoryApi } from '../../api/inventory';

/* ─── generate date strip (today + next N days) ─── */
function buildDateStrip(days = 10) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso   = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const day   = d.getDate();
    const month = d.toLocaleDateString('en-IN', { month: 'short' });
    return { iso, label, day, month, isToday: i === 0 };
  });
}

const DATE_STRIP = buildDateStrip(10);

/* ─── session editor for one vaccine+date ─── */
function SlotCard({ token, slot, date, onSaved }) {
  const [morning,   setMorning]   = useState(slot.sessions?.find((s) => s.name === 'Morning')?.limit   ?? 0);
  const [afternoon, setAfternoon] = useState(slot.sessions?.find((s) => s.name === 'Afternoon')?.limit ?? 0);
  const [price,     setPrice]     = useState(slot.priceAtDate ?? slot.vaccine?.pricePerDose ?? 0);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState('');

  const morningBooked   = slot.sessions?.find((s) => s.name === 'Morning')?.booked   ?? 0;
  const afternoonBooked = slot.sessions?.find((s) => s.name === 'Afternoon')?.booked ?? 0;

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const body = {
        vaccineId:   slot.vaccineId?.id ?? slot.vaccineId,
        date,
        priceAtDate: Number(price),
        sessions: [
          { name: 'Morning',   startTime: '09:00', endTime: '13:00', limit: Number(morning),   booked: morningBooked },
          { name: 'Afternoon', startTime: '14:00', endTime: '18:00', limit: Number(afternoon), booked: afternoonBooked },
        ],
      };
      const res = await inventoryApi.saveSlot(token, body);
      onSaved?.(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const vaccineName = slot.vaccineId?.name ?? '—';
  const totalLimit  = Number(morning) + Number(afternoon);
  const totalBooked = morningBooked + afternoonBooked;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* vaccine header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Syringe size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{vaccineName}</p>
            <p className="text-xs text-slate-400">
              {totalBooked} / {totalLimit} booked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">₹</span>
          <input
            type="number" min="0" value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-20 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
          <span className="text-xs text-slate-400">/dose</span>
        </div>
      </div>

      {/* sessions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Sun,    label: 'Morning',   time: '09:00 – 13:00', value: morning,   booked: morningBooked,   set: setMorning,   color: 'amber'  },
          { icon: Sunset, label: 'Afternoon', time: '14:00 – 18:00', value: afternoon, booked: afternoonBooked, set: setAfternoon, color: 'violet' },
        ].map((s) => {
          const pct     = s.value > 0 ? Math.round((s.booked / s.value) * 100) : 0;
          const isFull  = s.booked >= s.value && s.value > 0;
          const barColor = isFull ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-blue-500';
          return (
            <div key={s.label} className={`rounded-xl p-3 space-y-2.5 bg-${s.color}-50 border border-${s.color}-100`}>
              <div className="flex items-center gap-1.5">
                <s.icon size={13} className={`text-${s.color}-600`} />
                <span className={`text-xs font-semibold text-${s.color}-700`}>{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 shrink-0">Limit</span>
                <input
                  type="number" min="0" max="500" value={s.value}
                  onChange={(e) => s.set(e.target.value)}
                  className="flex-1 text-sm font-bold text-center border border-slate-200 rounded-lg py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
              {s.value > 0 && (
                <div className="space-y-1">
                  <div className="h-1 bg-white/80 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {s.booked} booked · {Math.max(0, s.value - s.booked)} left
                  </p>
                </div>
              )}
              <p className="text-xs text-slate-400 text-center">{s.time}</p>
            </div>
          );
        })}
      </div>

      {/* error */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
          <AlertTriangle size={11} /> {error}
        </p>
      )}

      {/* save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all
          ${saved
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60'
          }`}
      >
        {saving ? (
          <><Loader2 size={13} className="animate-spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle2 size={13} /> Saved</>
        ) : (
          <><Save size={13} /> Save Availability</>
        )}
      </button>
    </div>
  );
}

/* ─── main tab ─── */
export default function AvailabilityTab({ token }) {
  const [selectedDate, setSelectedDate] = useState(DATE_STRIP[0].iso);
  const [slots,        setSlots]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const gridRef = useRef(null);

  const loadSlots = async (date) => {
    setLoading(true);
    try {
      const res = await inventoryApi.getSlots(token, date);
      setSlots(res.data ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlots(selectedDate); }, [selectedDate]);

  useEffect(() => {
    if (!gridRef.current || loading) return;
    gsap.fromTo(
      gridRef.current.querySelectorAll('[data-card]'),
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.36, ease: 'power2.out' }
    );
  }, [loading, selectedDate]);

  const handleSaved = (updated) => {
    setSlots((prev) => {
      const idx = prev.findIndex(
        (s) => (s.vaccineId?.id ?? s.vaccineId) === (updated.vaccineId?.id ?? updated.vaccineId)
      );
      return idx >= 0 ? prev.map((s, i) => (i === idx ? updated : s)) : [...prev, updated];
    });
  };

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Daily Availability</h3>
          <p className="text-xs text-slate-500 mt-0.5">Set session limits and price per vaccine per day</p>
        </div>
        <button
          onClick={() => loadSlots(selectedDate)}
          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* date strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DATE_STRIP.map(({ iso, label, day, month, isToday }) => (
          <button
            key={iso}
            onClick={() => setSelectedDate(iso)}
            className={`flex flex-col items-center shrink-0 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all min-w-[58px]
              ${selectedDate === iso
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : isToday
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
          >
            <span className="text-[10px] opacity-80">{label}</span>
            <span className="text-base font-extrabold leading-tight">{day}</span>
            <span className="text-[10px] opacity-70">{month}</span>
          </button>
        ))}
      </div>

      {/* selected date label */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <CalendarDays size={14} className="text-blue-500" />
        <span className="font-semibold">
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </span>
      </div>

      {/* slot cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-56 animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <CalendarDays size={36} className="opacity-30" />
          <p className="text-sm font-medium">No active vaccines in inventory</p>
          <p className="text-xs">Add vaccines to inventory first, then set availability here.</p>
        </div>
      ) : (
        <div ref={gridRef} className="grid sm:grid-cols-2 gap-4">
          {slots.map((slot, i) => (
            <div key={`${slot.vaccineId?.id ?? slot.vaccineId}-${i}`} data-card>
              <SlotCard
                token={token}
                slot={slot}
                date={selectedDate}
                onSaved={handleSaved}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

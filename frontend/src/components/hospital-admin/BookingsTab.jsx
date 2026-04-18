import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Filter, Loader2, RefreshCw, Sun, Sunset, User2 } from 'lucide-react';
import { hospitalAdminApi } from '../../api/hospitalAdmin';

function BookingRow({ booking }) {
  const sessionIcon = booking.sessionName === 'Morning' ? Sun : Sunset;
  const SessionIcon = sessionIcon;

  const statusStyle = booking.status === 'confirmed'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : booking.status === 'cancelled'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 grid sm:grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-2 items-center">
      <div>
        <p className="text-sm font-semibold text-slate-800">{booking.patientId?.name ?? 'Unknown patient'}</p>
        <p className="text-xs text-slate-500">{booking.patientId?.email ?? '—'}{booking.patientId?.phone ? ` • ${booking.patientId.phone}` : ''}</p>
      </div>
      <div>
        <p className="text-sm text-slate-700">{booking.vaccineId?.name ?? '—'}</p>
        <p className="text-xs text-slate-500">{booking.vaccineId?.type ?? '—'}</p>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-slate-700">
        <CalendarDays size={13} className="text-slate-400" />
        {booking.date}
      </div>
      <div className="flex items-center gap-1.5 text-sm text-slate-700">
        <SessionIcon size={13} className="text-slate-400" />
        {booking.sessionName}
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2">
        <span className="text-xs font-semibold text-slate-700">₹{Number(booking.priceAtBooking ?? 0).toLocaleString()}</span>
        <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 capitalize ${statusStyle}`}>
          {booking.status}
        </span>
      </div>
    </div>
  );
}

export default function BookingsTab({ token }) {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const [mode, setMode] = useState('today');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [sessionName, setSessionName] = useState('');

  const params = useMemo(() => {
    const base = { status, sessionName };

    if (mode === 'today') return { ...base, date: 'today' };
    if (mode === 'date') return { ...base, date };
    return { ...base, startDate, endDate };
  }, [mode, date, startDate, endDate, status, sessionName]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await hospitalAdminApi.getBookings(token, params);
      setBookings(res.data ?? []);
    } catch (err) {
      setError(err?.message ?? 'Failed to load bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const applyFilters = () => {
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Patient Bookings</h3>
          <p className="text-xs text-slate-500 mt-0.5">View all bookings and filter by day/date/range</p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Filter size={13} /> Filters
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            <option value="today">Today</option>
            <option value="date">Specific Date</option>
            <option value="range">Date Range</option>
          </select>

          {mode === 'date' && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          )}

          {mode === 'range' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </>
          )}

          <select
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            <option value="">All Sessions</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={applyFilters}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
          <Loader2 size={15} className="animate-spin" /> Loading bookings…
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
          <User2 size={26} className="opacity-40" />
          <p className="text-sm font-medium">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{bookings.length} booking{bookings.length > 1 ? 's' : ''}</p>
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
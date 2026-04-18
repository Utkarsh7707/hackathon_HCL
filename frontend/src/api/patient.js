const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const get  = (url) => fetch(url).then(async (r) => { const d = await r.json(); if (!r.ok) throw d; return d; });
const post = (url, token, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).then(async (r) => { const d = await r.json(); if (!r.ok) throw d; return d; });

const authGet = (url, token) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(async (r) => { const d = await r.json(); if (!r.ok) throw d; return d; });

const authPatch = (url, token, body = {}) =>
  fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).then(async (r) => { const d = await r.json(); if (!r.ok) throw d; return d; });

export const patientApi = {
  searchHospitals: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v)));
    return get(`${BASE}/patient/hospitals?${q}`);
  },
  getSlots:    (hospitalId, date)     => get(`${BASE}/patient/hospitals/${hospitalId}/slots?date=${date}`),
  book:        (token, body)          => post(`${BASE}/patient/bookings`, token, body),
  myBookings:  (token)                => authGet(`${BASE}/patient/bookings`, token),
  cancelBooking: (token, bookingId)   => authPatch(`${BASE}/patient/bookings/${bookingId}/cancel`, token),
};

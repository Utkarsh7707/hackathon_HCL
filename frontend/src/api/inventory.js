const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const authFetch = (token, path, options = {}) =>
  fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  });

export const inventoryApi = {
  /* master catalog — no auth needed */
  getCatalog: () =>
    fetch(`${BASE_URL}/hospital-admin/catalog`)
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw d; return d; }),
  createCatalogVaccine: (token, body) =>
    authFetch(token, '/hospital-admin/catalog', { method: 'POST', body: JSON.stringify(body) }),

  /* inventory */
  list:   (token)              => authFetch(token, '/hospital-admin/inventory'),
  add:    (token, body)        => authFetch(token, '/hospital-admin/inventory', { method: 'POST', body: JSON.stringify(body) }),
  update: (token, id, body)    => authFetch(token, `/hospital-admin/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (token, id)          => authFetch(token, `/hospital-admin/inventory/${id}`, { method: 'DELETE' }),

  /* slots */
  getSlots:      (token, date)                    => authFetch(token, `/hospital-admin/slots?date=${date}`),
  getSlotsRange: (token, startDate, endDate)       => authFetch(token, `/hospital-admin/slots/range?startDate=${startDate}&endDate=${endDate}`),
  saveSlot:      (token, body)                    => authFetch(token, '/hospital-admin/slots', { method: 'PUT', body: JSON.stringify(body) }),
  deleteSlot:    (token, id)                      => authFetch(token, `/hospital-admin/slots/${id}`, { method: 'DELETE' }),
};

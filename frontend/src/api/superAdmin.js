const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const authFetch = (token, path, options = {}) =>
  fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  });

export const superAdminApi = {
  getVerifications: (token, status = 'pending') =>
    authFetch(token, `/super-admin/verifications?status=${status}`),

  decide: (token, verificationId, decision, notes = '') =>
    authFetch(token, `/super-admin/verifications/${verificationId}/decision`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, notes }),
    }),

  blacklist: (token, verificationId, notes = '') =>
    authFetch(token, `/super-admin/verifications/${verificationId}/blacklist`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  unblacklist: (token, verificationId, notes = '') =>
    authFetch(token, `/super-admin/verifications/${verificationId}/unblacklist`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),
};

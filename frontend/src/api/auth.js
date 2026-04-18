const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

async function request(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export const authApi = {
  login: (body) => request('/auth/login', body),
  signupPatient: (body) => request('/auth/signup/patient', body),
  signupHospitalAdmin: (body) => request('/auth/signup/hospital-admin', body),
  signupSuperAdmin: (body) => request('/auth/signup/super-admin', body),
};

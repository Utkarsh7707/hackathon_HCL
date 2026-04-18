const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const hospitalAdminApi = {
  uploadDocuments: (token, formData) =>
    fetch(`${BASE_URL}/hospital-admin/upload-documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData, // FormData — do NOT set Content-Type, browser sets multipart boundary
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    }),

  getMyStatus: (token) =>
    fetch(`${BASE_URL}/hospital-admin/my-status`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    }),
};

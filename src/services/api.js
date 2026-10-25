const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details ?? null;
  }
}

let onUnauthorized = null;
/** Dipanggil saat endpoint data membalas 401 (sesi habis) agar UI kembali ke halaman login. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

function buildQuery(query) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

async function request(method, path, { body, query, withMeta = false } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/api${path}${buildQuery(query)}`, {
      method,
      credentials: BASE_URL ? 'include' : 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Tidak dapat terhubung ke server. Periksa koneksi Anda.');
  }
  if (res.status === 204) return null;
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* respons bukan JSON */
  }
  if (!res.ok) {
    const err = payload?.error;
    if (res.status === 401 && !path.startsWith('/auth/') && onUnauthorized) onUnauthorized();
    throw new ApiError(res.status, err?.code ?? 'HTTP_ERROR', err?.message ?? `Permintaan gagal (${res.status})`, err?.details);
  }
  return withMeta ? { data: payload?.data ?? null, meta: payload?.meta ?? null } : (payload?.data ?? null);
}

export const api = {
  // autentikasi & pengaturan
  register: (body) => request('POST', '/auth/register', { body }),
  login: (body) => request('POST', '/auth/login', { body }),
  logout: () => request('POST', '/auth/logout'),
  me: () => request('GET', '/auth/me'),
  updateMe: (body) => request('PATCH', '/auth/me', { body }),
  resetMyData: () => request('DELETE', '/auth/me/data'),
  // buku
  listBooks: (query) => request('GET', '/books', { query }),
  getBook: (id) => request('GET', `/books/${id}`),
  createBook: (body) => request('POST', '/books', { body }),
  updateBook: (id, body) => request('PUT', `/books/${id}`, { body }),
  deleteBook: (id) => request('DELETE', `/books/${id}`),
  listBookLogs: (id) => request('GET', `/books/${id}/logs`),
  // reading log
  listLogs: (query) => request('GET', '/reading-logs', { query, withMeta: true }),
  createLog: (body) => request('POST', '/reading-logs', { body }),
  updateLog: (id, body) => request('PUT', `/reading-logs/${id}`, { body }),
  deleteLog: (id) => request('DELETE', `/reading-logs/${id}`),
  // dashboard & statistik
  dashboardSummary: () => request('GET', '/dashboard/summary'),
  readingActivity: (query) => request('GET', '/statistics/reading-activity', { query }),
  readingHabits: (query) => request('GET', '/statistics/reading-habits', { query }),
  categories: () => request('GET', '/statistics/categories'),
};

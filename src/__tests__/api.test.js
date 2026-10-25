import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, setUnauthorizedHandler } from '../services/api.js';

const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

describe('services/api', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });
  afterEach(() => {
    setUnauthorizedHandler(null);
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('GET: menyusun query tanpa nilai kosong dan mengembalikan data', async () => {
    fetch.mockResolvedValue(reply(200, { data: [{ id: 1 }] }));
    const result = await api.listBooks({ q: 'laskar', status: '', category: undefined });
    expect(result).toEqual([{ id: 1 }]);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/books?q=laskar');
    expect(options).toMatchObject({ method: 'GET', credentials: 'same-origin' });
    expect(options.body).toBeUndefined();
  });

  it('POST: mengirim body JSON dengan header Content-Type', async () => {
    fetch.mockResolvedValue(reply(201, { data: { id: 5 } }));
    await api.createBook({ title: 'A' });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/books');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(options.body)).toEqual({ title: 'A' });
  });

  it('VITE_API_BASE_URL dipakai sebagai awalan URL (tanpa garis miring akhir) dan menyertakan cookie lintas origin', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.contoh.com/');
    vi.resetModules();
    const { api: remoteApi } = await import('../services/api.js');
    fetch.mockResolvedValue(reply(200, { data: [] }));
    await remoteApi.listBooks();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('https://api.contoh.com/api/books');
    expect(options.credentials).toBe('include');
  });

  it('respons sukses tanpa isi JSON mengembalikan null (data dan meta)', async () => {
    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => { throw new Error('kosong'); } });
    expect(await api.listBooks()).toBeNull();
    expect(await api.listLogs()).toEqual({ data: null, meta: null });
  });

  it('204 mengembalikan null', async () => {
    fetch.mockResolvedValue(reply(204));
    expect(await api.deleteBook(3)).toBeNull();
  });

  it('listLogs mengembalikan data beserta meta', async () => {
    fetch.mockResolvedValue(reply(200, { data: [1], meta: { total: 9 } }));
    expect(await api.listLogs({ limit: 15, offset: 0 })).toEqual({ data: [1], meta: { total: 9 } });
  });

  it('error API dipetakan ke ApiError lengkap dengan details', async () => {
    fetch.mockResolvedValue(reply(422, { error: { code: 'VALIDATION_ERROR', message: 'Tidak valid', details: { title: 'wajib' } } }));
    const error = await api.createBook({}).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, code: 'VALIDATION_ERROR', message: 'Tidak valid', details: { title: 'wajib' } });
  });

  it('respons error non-JSON memakai pesan bawaan', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('bukan json'); } });
    const error = await api.listBooks().catch((e) => e);
    expect(error).toMatchObject({ status: 500, code: 'HTTP_ERROR', message: 'Permintaan gagal (500)', details: null });
  });

  it('kegagalan jaringan menjadi ApiError NETWORK_ERROR', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await api.listBooks().catch((e) => e);
    expect(error).toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });

  it('401 pada endpoint data memanggil handler sesi habis; endpoint /auth/ tidak', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetch.mockResolvedValue(reply(401, { error: { code: 'UNAUTHORIZED', message: 'Masuk dulu' } }));
    await api.listBooks().catch(() => {});
    expect(handler).toHaveBeenCalledTimes(1);
    await api.me().catch(() => {});
    await api.login({}).catch(() => {});
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['register', () => api.register({}), 'POST', '/api/auth/register'],
    ['login', () => api.login({}), 'POST', '/api/auth/login'],
    ['logout', () => api.logout(), 'POST', '/api/auth/logout'],
    ['me', () => api.me(), 'GET', '/api/auth/me'],
    ['updateMe', () => api.updateMe({}), 'PATCH', '/api/auth/me'],
    ['resetMyData', () => api.resetMyData(), 'DELETE', '/api/auth/me/data'],
    ['getBook', () => api.getBook(2), 'GET', '/api/books/2'],
    ['updateBook', () => api.updateBook(2, {}), 'PUT', '/api/books/2'],
    ['listBookLogs', () => api.listBookLogs(2), 'GET', '/api/books/2/logs'],
    ['createLog', () => api.createLog({}), 'POST', '/api/reading-logs'],
    ['updateLog', () => api.updateLog(4, {}), 'PUT', '/api/reading-logs/4'],
    ['deleteLog', () => api.deleteLog(4), 'DELETE', '/api/reading-logs/4'],
    ['dashboardSummary', () => api.dashboardSummary(), 'GET', '/api/dashboard/summary'],
    ['readingActivity', () => api.readingActivity({ from: '2026-10-01', to: '2026-10-07' }), 'GET', '/api/statistics/reading-activity?from=2026-10-01&to=2026-10-07'],
    ['readingHabits', () => api.readingHabits({ days: 'all' }), 'GET', '/api/statistics/reading-habits?days=all'],
    ['categories', () => api.categories(), 'GET', '/api/statistics/categories'],
  ])('%s memakai metode dan path yang benar', async (_name, call, method, url) => {
    fetch.mockResolvedValue(reply(200, { data: {} }));
    await call();
    expect(fetch.mock.calls[0][0]).toBe(url);
    expect(fetch.mock.calls[0][1].method).toBe(method);
  });
});

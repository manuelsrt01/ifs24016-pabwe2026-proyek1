import { describe, expect, it } from 'vitest';
import { emptyBookValues } from '../utils/bookMapper.js';
import { isValidEmail, validateAuthForm, validateBookForm, validateLogForm } from '../utils/validators.js';

describe('isValidEmail', () => {
  it.each(['a@b.co', ' budi@example.com ', 'x.y@mail.example.id'])('menerima %s', (v) => expect(isValidEmail(v)).toBe(true));
  it.each(['', 'tanpa-at', '@b.co', 'a@b', 'a@b.', 'a@.co', 'a@@b.co', 'a b@c.co', `${'a'.repeat(250)}@b.co`, null])('menolak %s', (v) => expect(isValidEmail(v)).toBe(false));
});

describe('validateBookForm', () => {
  const ok = { ...emptyBookValues(), title: 'A', author: 'B', total_pages: '100' };
  it('valid untuk data minimal', () => expect(validateBookForm(ok)).toEqual({}));
  it('menolak judul/penulis kosong dan total tidak valid', () => {
    const e = validateBookForm({ ...emptyBookValues(), total_pages: '0' });
    expect(e.title && e.author && e.total_pages).toBeTruthy();
  });
  it('menolak progres tidak valid', () => {
    expect(validateBookForm({ ...ok, status: 'sedang_dibaca', current_page: '-1' }).current_page).toMatch(/≥ 0/);
    expect(validateBookForm({ ...ok, status: 'sedang_dibaca', current_page: '101' }).current_page).toMatch(/melebihi/);
  });
  it('menolak status yang tidak konsisten dengan progres', () => {
    expect(validateBookForm({ ...ok, status: 'selesai', current_page: '50' }).current_page).toBeTruthy();
    expect(validateBookForm({ ...ok, status: 'belum_dibaca', current_page: '5' }).current_page).toBeTruthy();
    expect(validateBookForm({ ...ok, status: 'sedang_dibaca', current_page: '100' }).current_page).toBeTruthy();
    expect(validateBookForm({ ...ok, status: 'selesai', current_page: '100' })).toEqual({});
  });
  it('tidak memeriksa progres bila total tidak valid', () => {
    expect(validateBookForm({ ...ok, total_pages: 'x', status: 'selesai', current_page: '5' }).current_page).toBeUndefined();
  });
  it('memeriksa format dan urutan tanggal', () => {
    expect(validateBookForm({ ...ok, started_at: '21/10/2026' }).started_at).toBeTruthy();
    expect(validateBookForm({ ...ok, status: 'selesai', current_page: '100', finished_at: 'x' }).finished_at).toBeTruthy();
    expect(validateBookForm({ ...ok, status: 'selesai', current_page: '100', started_at: '2026-10-10', finished_at: '2026-10-01' }).finished_at).toMatch(/lebih awal/);
  });
});

describe('validateLogForm', () => {
  const book = { id: 1, total_pages: 100, current_page: 10 };
  const ok = { log_date: '2026-10-20', start_page: '10', end_page: '30', duration_minutes: '20', notes: '' };
  const today = '2026-10-21';
  it('valid', () => expect(validateLogForm(ok, book, today)).toEqual({}));
  it('menolak buku kosong dan tanggal tidak valid/masa depan', () => {
    expect(validateLogForm(ok, undefined, today).book_id).toBeTruthy();
    expect(validateLogForm({ ...ok, log_date: '' }, book, today).log_date).toMatch(/wajib/);
    expect(validateLogForm({ ...ok, log_date: '2026-10-22' }, book, today).log_date).toMatch(/masa depan/);
  });
  it('menolak halaman tidak valid', () => {
    expect(validateLogForm({ ...ok, start_page: '-1' }, book, today).start_page).toBeTruthy();
    expect(validateLogForm({ ...ok, end_page: 'x' }, book, today).end_page).toBeTruthy();
    expect(validateLogForm({ ...ok, end_page: '5' }, book, today).end_page).toMatch(/lebih kecil/);
    expect(validateLogForm({ ...ok, end_page: '101' }, book, today).end_page).toMatch(/melebihi/);
  });
  it('menolak durasi tidak valid', () => {
    expect(validateLogForm({ ...ok, duration_minutes: '0' }, book, today).duration_minutes).toBeTruthy();
    expect(validateLogForm({ ...ok, duration_minutes: '1441' }, book, today).duration_minutes).toMatch(/maksimal/);
  });
});

describe('validateAuthForm', () => {
  const blank = { name: '', email: '', password: '', confirm: '' };
  it('login: email dan sandi wajib; format email diperiksa', () => {
    expect(validateAuthForm(blank, 'login')).toMatchObject({ email: expect.any(String), password: expect.any(String) });
    expect(validateAuthForm({ ...blank, email: 'x', password: 'a' }, 'login').email).toMatch(/format/i);
    expect(validateAuthForm({ ...blank, email: 'a@b.co', password: 'a' }, 'login')).toEqual({});
  });
  it('register: nama, sandi minimal 8, konfirmasi harus sama', () => {
    const v = { name: 'A', email: 'a@b.co', password: '12345678', confirm: '12345678' };
    expect(validateAuthForm(v, 'register')).toEqual({});
    expect(validateAuthForm({ ...v, name: ' ' }, 'register').name).toBeTruthy();
    expect(validateAuthForm({ ...v, password: '123', confirm: '123' }, 'register').password).toBeTruthy();
    expect(validateAuthForm({ ...v, confirm: 'lain' }, 'register').confirm).toBeTruthy();
  });
});

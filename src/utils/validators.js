import { toInt } from './format.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DURATION_MINUTES = 1440;
const MIN_PASSWORD_LENGTH = 8;

/** Validasi email sederhana tanpa regex kompleks (menghindari backtracking berlebih). */
export function isValidEmail(value) {
  const email = String(value ?? '').trim();
  if (email.length > 254 || email.includes(' ')) return false;
  const at = email.indexOf('@');
  if (at < 1 || at !== email.lastIndexOf('@')) return false;
  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  return dot > 0 && dot < domain.length - 1;
}

function validateReadingProgress(v, errors) {
  const total = toInt(v.total_pages);
  const current = toInt(v.current_page);
  if (!Number.isInteger(total) || total <= 0) errors.total_pages = 'Total halaman harus bilangan bulat positif';
  if (!Number.isInteger(current) || current < 0) {
    errors.current_page = 'Halaman terakhir harus bilangan bulat ≥ 0';
    return;
  }
  if (errors.total_pages) return;
  if (current > total) errors.current_page = 'Halaman terakhir tidak boleh melebihi total halaman';
  else if (v.status === 'selesai' && current !== total) errors.current_page = 'Status selesai mengharuskan halaman terakhir = total halaman';
  else if (v.status === 'belum_dibaca' && current !== 0) errors.current_page = 'Status belum dibaca mengharuskan halaman terakhir 0';
  else if (v.status === 'sedang_dibaca' && current >= total) errors.current_page = 'Status sedang dibaca mengharuskan halaman terakhir kurang dari total';
}

/** Validasi form buku di sisi klien (server tetap memvalidasi ulang). Mengembalikan { field: pesan }. */
export function validateBookForm(v) {
  const errors = {};
  if (!v.title.trim()) errors.title = 'Judul wajib diisi';
  if (!v.author.trim()) errors.author = 'Penulis wajib diisi';
  validateReadingProgress(v, errors);
  if (v.started_at && !DATE_RE.test(v.started_at)) errors.started_at = 'Tanggal mulai tidak valid';
  if (v.finished_at && !DATE_RE.test(v.finished_at)) errors.finished_at = 'Tanggal selesai tidak valid';
  const datesOk = !errors.started_at && !errors.finished_at;
  if (datesOk && v.started_at && v.finished_at && v.finished_at < v.started_at) {
    errors.finished_at = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai';
  }
  return errors;
}

/** Validasi form reading log. `today` dapat disuntikkan agar mudah diuji. */
export function validateLogForm(v, book, today) {
  const errors = {};
  if (!book) errors.book_id = 'Pilih buku terlebih dahulu';
  if (!v.log_date || !DATE_RE.test(v.log_date)) errors.log_date = 'Tanggal aktivitas wajib diisi';
  else if (v.log_date > today) errors.log_date = 'Tanggal tidak boleh di masa depan';

  const start = toInt(v.start_page);
  const end = toInt(v.end_page);
  const duration = toInt(v.duration_minutes);
  if (!Number.isInteger(start) || start < 0) errors.start_page = 'Halaman awal harus bilangan bulat ≥ 0';
  if (!Number.isInteger(end) || end < 0) errors.end_page = 'Halaman akhir harus bilangan bulat ≥ 0';
  else if (!errors.start_page && end < start) errors.end_page = 'Halaman akhir tidak boleh lebih kecil dari halaman awal';
  else if (book && end > book.total_pages) errors.end_page = `Halaman akhir tidak boleh melebihi total halaman (${book.total_pages})`;
  if (!Number.isInteger(duration) || duration <= 0) errors.duration_minutes = 'Durasi harus bilangan bulat positif (menit)';
  else if (duration > MAX_DURATION_MINUTES) errors.duration_minutes = `Durasi maksimal ${MAX_DURATION_MINUTES} menit`;
  return errors;
}

/** mode: 'login' | 'register' */
export function validateAuthForm(values, mode) {
  const errors = {};
  const registering = mode === 'register';
  if (registering && !values.name.trim()) errors.name = 'Nama wajib diisi';
  if (!values.email.trim()) errors.email = 'Email wajib diisi';
  else if (!isValidEmail(values.email)) errors.email = 'Format email tidak valid';
  if (!values.password) errors.password = 'Kata sandi wajib diisi';
  else if (registering && values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter`;
  }
  if (registering && !errors.password && values.password !== values.confirm) {
    errors.confirm = 'Konfirmasi kata sandi tidak sama';
  }
  return errors;
}

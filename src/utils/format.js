export const STATUS_LABEL = {
  belum_dibaca: 'Belum Dibaca',
  sedang_dibaca: 'Sedang Dibaca',
  selesai: 'Selesai',
};

/** 45 -> "45 mnt", 90 -> "1 j 30 mnt" */
export function formatMinutes(total) {
  const m = Math.max(0, Math.round(total ?? 0));
  if (m < 60) return `${m} mnt`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} j ${rest} mnt` : `${h} j`;
}

/** 345 -> "5 Jam 45 mnt" */
export function formatDuration(total) {
  const m = Math.max(0, Math.round(total ?? 0));
  if (m < 60) return `${m} mnt`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} Jam ${rest} mnt` : `${h} Jam`;
}

export function formatNumber(n) {
  return new Intl.NumberFormat('id-ID').format(n ?? 0);
}

const fmtUtc = (opts) => new Intl.DateTimeFormat('id-ID', { ...opts, timeZone: 'UTC' });
const utcDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** 'YYYY-MM-DD' -> '21 Okt 2026' (tanpa konversi zona waktu). */
export function formatDate(iso) {
  if (!iso) return '-';
  return fmtUtc({ day: 'numeric', month: 'short', year: 'numeric' }).format(utcDate(iso));
}

export function formatShortDate(iso) {
  return fmtUtc({ day: 'numeric', month: 'short' }).format(utcDate(iso));
}

/** 'YYYY-MM-DD' -> 'Kam' */
export function weekdayShort(iso) {
  return fmtUtc({ weekday: 'short' }).format(utcDate(iso));
}

/** Date -> 'Kamis, 22 Okt 2026' */
export function formatToday(now = new Date()) {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(now);
}

/** Tanggal hari ini di zona waktu browser, format YYYY-MM-DD. */
export function todayLocal(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIso(iso, n) {
  return new Date(utcDate(iso).getTime() + n * 86400000).toISOString().slice(0, 10);
}

/** Bilangan bulat dari string input; NaN bila bukan bilangan bulat. */
export function toInt(value) {
  const s = String(value ?? '').trim();
  return /^-?\d+$/.test(s) ? Number.parseInt(s, 10) : Number.NaN;
}

/** Sapaan berdasarkan jam lokal. */
export function greeting(hour) {
  if (hour >= 4 && hour < 11) return 'Selamat Pagi';
  if (hour >= 11 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 19) return 'Selamat Sore';
  return 'Selamat Malam';
}

/**
 * Label konsistensi = hari aktif / jumlah hari periode.
 * >= 80% Sangat Baik, >= 50% Baik, >= 25% Cukup, selain itu Perlu Ditingkatkan.
 */
export function consistencyLabel(activeDays, periodDays) {
  if (!activeDays) return 'Belum Ada Data';
  const ratio = activeDays / Math.max(1, periodDays);
  if (ratio >= 0.8) return 'Sangat Baik';
  if (ratio >= 0.5) return 'Baik';
  if (ratio >= 0.25) return 'Cukup';
  return 'Perlu Ditingkatkan';
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

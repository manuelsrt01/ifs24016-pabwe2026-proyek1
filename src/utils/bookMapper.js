import { toInt } from './format.js';

/** Nilai awal form buku (semua string, sesuai input HTML). */
export function emptyBookValues() {
  return {
    title: '', author: '', category: '', total_pages: '', status: 'belum_dibaca',
    current_page: '0', started_at: '', finished_at: '', notes: '',
  };
}

/** Objek buku dari API -> nilai form. */
export function bookToValues(book) {
  return {
    title: book.title,
    author: book.author,
    category: book.category ?? '',
    total_pages: String(book.total_pages),
    status: book.status,
    current_page: String(book.current_page),
    started_at: book.started_at ?? '',
    finished_at: book.finished_at ?? '',
    notes: book.notes ?? '',
  };
}

/** Nilai form -> body permintaan API. */
export function bookValuesToPayload(v) {
  return {
    title: v.title.trim(),
    author: v.author.trim(),
    category: v.category.trim() || null,
    total_pages: toInt(v.total_pages),
    current_page: toInt(v.current_page),
    status: v.status,
    started_at: v.started_at || null,
    finished_at: v.status === 'selesai' && v.finished_at ? v.finished_at : null,
    notes: v.notes.trim() || null,
  };
}

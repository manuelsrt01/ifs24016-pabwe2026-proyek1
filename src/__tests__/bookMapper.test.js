import { describe, expect, it } from 'vitest';
import { bookToValues, bookValuesToPayload, emptyBookValues } from '../utils/bookMapper.js';

describe('bookMapper', () => {
  it('emptyBookValues berisi string kosong dengan status awal belum dibaca', () => {
    expect(emptyBookValues()).toMatchObject({ title: '', status: 'belum_dibaca', current_page: '0' });
  });

  it('bookToValues mengubah buku API menjadi nilai form (null -> string kosong)', () => {
    const values = bookToValues({
      title: 'A', author: 'B', category: null, total_pages: 100, status: 'sedang_dibaca', current_page: 40,
      started_at: null, finished_at: null, notes: null,
    });
    expect(values).toEqual({
      title: 'A', author: 'B', category: '', total_pages: '100', status: 'sedang_dibaca', current_page: '40',
      started_at: '', finished_at: '', notes: '',
    });
  });

  it('bookValuesToPayload mengubah nilai form menjadi payload bertipe angka', () => {
    const payload = bookValuesToPayload({
      title: ' A ', author: ' B ', category: ' ', total_pages: '100', status: 'selesai', current_page: '100',
      started_at: '', finished_at: '2026-10-01', notes: ' catatan ',
    });
    expect(payload).toEqual({
      title: 'A', author: 'B', category: null, total_pages: 100, current_page: 100, status: 'selesai',
      started_at: null, finished_at: '2026-10-01', notes: 'catatan',
    });
  });

  it('tanggal selesai dikosongkan bila status bukan selesai', () => {
    const payload = bookValuesToPayload({ ...emptyBookValues(), title: 'A', author: 'B', total_pages: '10', finished_at: '2026-10-01' });
    expect(payload.finished_at).toBeNull();
  });
});

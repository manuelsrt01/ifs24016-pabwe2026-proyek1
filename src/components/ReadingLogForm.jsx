import { useState } from 'react';
import { todayLocal, toInt } from '../utils/format.js';
import { validateLogForm } from '../utils/validators.js';

/**
 * books: daftar buku (untuk dropdown). log: bila diisi = mode edit (buku tidak dapat diganti).
 * initialBookId: buku yang dipilih awal pada mode tambah.
 */
export default function ReadingLogForm({ books, initialBookId, log, onSubmit, onCancel }) {
  const editing = Boolean(log);
  const firstBook = books.find((b) => b.id === (log?.book_id ?? initialBookId)) ?? books[0];

  const [values, setValues] = useState(() => (log
    ? {
      book_id: String(log.book_id), log_date: log.log_date, start_page: String(log.start_page),
      end_page: String(log.end_page), duration_minutes: String(log.duration_minutes), notes: log.notes ?? '',
    }
    : {
      book_id: firstBook ? String(firstBook.id) : '', log_date: todayLocal(),
      start_page: firstBook ? String(firstBook.current_page) : '', end_page: '', duration_minutes: '30', notes: '',
    }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const book = books.find((b) => String(b.id) === values.book_id);
  const set = (k, val) => setValues((v) => ({ ...v, [k]: val }));

  const onBookChange = (id) => {
    const next = books.find((b) => String(b.id) === id);
    setValues((v) => ({ ...v, book_id: id, start_page: next ? String(next.current_page) : '', end_page: '' }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setFormError('');
    const found = validateLogForm(values, book, todayLocal());
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit({
        book_id: book.id,
        log_date: values.log_date,
        start_page: toInt(values.start_page),
        end_page: toInt(values.end_page),
        duration_minutes: toInt(values.duration_minutes),
        notes: values.notes.trim() || null,
      });
    } catch (err) {
      if (err?.details) setErrors(err.details);
      setFormError(err?.message ?? 'Gagal menyimpan aktivitas');
      setSaving(false);
    }
  };

  const err = (name) => errors[name] && <p className="field-error" role="alert">{errors[name]}</p>;
  const input = (name, label, props) => (
    <div className="field">
      <label htmlFor={`log-${name}`}>{label}</label>
      <input id={`log-${name}`} value={values[name]} onChange={(e) => set(name, e.target.value)} {...props} />
      {err(name)}
    </div>
  );

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {formError && <div className="alert alert-error" role="alert">{formError}</div>}
      <div className="field">
        <label htmlFor="log-book_id">Pilih buku *</label>
        <select id="log-book_id" value={values.book_id} disabled={editing} onChange={(e) => onBookChange(e.target.value)}>
          {books.map((b) => (
            <option key={b.id} value={b.id}>{`${b.title} (Hal ${b.current_page}/${b.total_pages})`}</option>
          ))}
        </select>
        {err('book_id')}
      </div>
      <div className="grid-2">
        {input('log_date', 'Tanggal', { type: 'date', max: todayLocal() })}
        {input('duration_minutes', 'Durasi (menit)', { type: 'number', min: 1, step: 1, inputMode: 'numeric' })}
      </div>
      <div className="grid-2">
        {input('start_page', 'Dari halaman', { type: 'number', min: 0, step: 1, inputMode: 'numeric' })}
        {input('end_page', 'Sampai halaman', { type: 'number', min: 0, step: 1, inputMode: 'numeric', placeholder: book ? `maks. ${book.total_pages}` : '' })}
      </div>
      <div className="field">
        <label htmlFor="log-notes">Catatan membaca / ringkasan</label>
        <textarea
          id="log-notes" rows={3} maxLength={1000} value={values.notes}
          placeholder="Apa poin penting atau ide menarik yang kamu temukan hari ini?"
          onChange={(e) => set('notes', e.target.value)}
        />
        {err('notes')}
      </div>
      <div className="actions end">
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>Batal</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan Aktivitas'}</button>
      </div>
    </form>
  );
}

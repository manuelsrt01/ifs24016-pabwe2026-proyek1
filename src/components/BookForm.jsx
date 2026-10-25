import { useState } from 'react';
import { bookValuesToPayload, emptyBookValues } from '../utils/bookMapper.js';
import { validateBookForm } from '../utils/validators.js';

/** Form tambah/ubah buku. `initial` berupa nilai form (lihat utils/bookMapper.js). */
export default function BookForm({ initial, categories = [], submitLabel = 'Simpan', onSubmit, onCancel }) {
  const [values, setValues] = useState(initial ?? emptyBookValues());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (field, value) => setValues((v) => ({ ...v, [field]: value }));

  const onStatusChange = (status) => {
    setValues((v) => {
      const next = { ...v, status };
      if (status === 'belum_dibaca') next.current_page = '0';
      if (status === 'selesai') next.current_page = v.total_pages;
      if (status !== 'selesai') next.finished_at = '';
      return next;
    });
  };

  const onTotalChange = (value) => {
    setValues((v) => ({ ...v, total_pages: value, current_page: v.status === 'selesai' ? value : v.current_page }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const found = validateBookForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await onSubmit(bookValuesToPayload(values));
    } catch (err) {
      if (err?.details) setErrors(err.details);
      setFormError(err?.message ?? 'Gagal menyimpan data');
      setSaving(false);
    }
  };

  const field = (name, label, input) => (
    <div className="field">
      <label htmlFor={`book-${name}`}>{label}</label>
      {input}
      {errors[name] && <p className="field-error" role="alert">{errors[name]}</p>}
    </div>
  );
  const text = (name, label, props = {}) => field(name, label, (
    <input id={`book-${name}`} value={values[name]} onChange={(e) => set(name, e.target.value)} {...props} />
  ));

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      {formError && <div className="alert alert-error" role="alert">{formError}</div>}
      {text('title', 'Judul buku *', { maxLength: 200 })}
      {text('author', 'Penulis *', { maxLength: 150 })}
      <div className="grid-2">
        {field('category', 'Kategori / genre', (
          <>
            <input id="book-category" list="category-options" value={values.category} maxLength={60} onChange={(e) => set('category', e.target.value)} />
            <datalist id="category-options">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </>
        ))}
        {field('total_pages', 'Total halaman *', (
          <input id="book-total_pages" type="number" min="1" step="1" inputMode="numeric" value={values.total_pages} onChange={(e) => onTotalChange(e.target.value)} />
        ))}
      </div>
      <div className="grid-2">
        {field('status', 'Status membaca', (
          <select id="book-status" value={values.status} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="belum_dibaca">Belum dibaca</option>
            <option value="sedang_dibaca">Sedang dibaca</option>
            <option value="selesai">Selesai</option>
          </select>
        ))}
        {text('current_page', 'Halaman terakhir dibaca', {
          type: 'number', min: 0, step: 1, inputMode: 'numeric', disabled: values.status !== 'sedang_dibaca',
        })}
      </div>
      <div className="grid-2">
        {text('started_at', 'Tanggal mulai membaca', { type: 'date' })}
        {values.status === 'selesai' && text('finished_at', 'Tanggal selesai (kosong = hari ini)', { type: 'date' })}
      </div>
      {field('notes', 'Catatan singkat', (
        <textarea id="book-notes" rows={3} maxLength={1000} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
      ))}
      <p className="muted small">Progres buku juga diperbarui otomatis dari reading log (posisi halaman tertinggi).</p>
      <div className="actions end">
        {onCancel && <button type="button" className="btn" onClick={onCancel} disabled={saving}>Batal</button>}
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan…' : submitLabel}</button>
      </div>
    </form>
  );
}

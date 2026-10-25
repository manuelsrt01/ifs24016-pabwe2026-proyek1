import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../services/api.js';
import Icon from './Icon.jsx';
import ReadingLogForm from './ReadingLogForm.jsx';
import { ErrorState, LoadingState } from './States.jsx';
import { useToast } from './Toast.jsx';

/** Modal "Catat Aktivitas Membaca" (tambah atau edit). */
export default function LogModal({ bookId, log, onClose, onSaved }) {
  const { notify } = useToast();
  const { data: books, loading, error, reload } = useAsync(() => api.listBooks(), []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (payload) => {
    if (log) await api.updateLog(log.id, payload);
    else await api.createLog(payload);
    notify(log ? 'Aktivitas diperbarui' : 'Aktivitas membaca dicatat');
    onSaved();
  };

  return (
    <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="log-modal-title">
        <div className="modal-head">
          <h2 id="log-modal-title">{log ? 'Edit Aktivitas Membaca' : 'Catat Aktivitas Membaca'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup"><Icon name="x" size={18} /></button>
        </div>
        {loading && <LoadingState />}
        {!loading && error && <ErrorState error={error} onRetry={reload} />}
        {!loading && !error && books.length === 0 && (
          <div className="state">
            <p>Belum ada buku. Tambahkan buku terlebih dahulu sebelum mencatat aktivitas.</p>
            <Link className="btn btn-primary" to="/books/new" onClick={onClose}>Tambah Buku</Link>
          </div>
        )}
        {!loading && !error && books.length > 0 && (
          <ReadingLogForm books={books} initialBookId={bookId} log={log} onSubmit={submit} onCancel={onClose} />
        )}
      </div>
    </div>
  );
}

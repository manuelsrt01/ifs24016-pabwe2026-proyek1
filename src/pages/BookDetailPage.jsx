import { Link, useNavigate, useParams } from 'react-router-dom';
import BookCover from '../components/BookCover.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Icon from '../components/Icon.jsx';
import LogsTable from '../components/LogsTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAppData } from '../contexts/AppDataContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDeleteFlow } from '../hooks/useDeleteFlow.js';
import { api } from '../services/api.js';
import { formatDate, formatMinutes } from '../utils/format.js';

const removeBook = (book) => api.deleteBook(book.id);
const removeLog = (log) => api.deleteLog(log.id);

async function loadBookWithLogs(id) {
  const [book, logs] = await Promise.all([api.getBook(id), api.listBookLogs(id)]);
  return { book, logs };
}

function BookFacts({ book }) {
  const summary = book.log_summary;
  return (
    <dl className="facts">
      <div><dt>Mulai</dt><dd>{formatDate(book.started_at)}</dd></div>
      <div><dt>Selesai</dt><dd>{formatDate(book.finished_at)}</dd></div>
      <div><dt>Sesi membaca</dt><dd>{summary.sessions}</dd></div>
      <div><dt>Halaman tercatat di log</dt><dd>{summary.total_pages_logged}</dd></div>
      <div><dt>Total durasi</dt><dd>{formatMinutes(summary.total_minutes)}</dd></div>
    </dl>
  );
}

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { version, bump, openLogModal } = useAppData();
  const { data, loading, error, reload } = useAsync(() => loadBookWithLogs(id), [id, version]);

  const bookDeletion = useDeleteFlow({
    remove: removeBook,
    successMessage: () => 'Buku dihapus',
    onDeleted: () => {
      bump();
      navigate('/books');
    },
  });
  const logDeletion = useDeleteFlow({ remove: removeLog, successMessage: () => 'Aktivitas dihapus', onDeleted: bump });

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const { book, logs } = data;
  const tone = book.status === 'selesai' ? 'teal' : 'forest';

  return (
    <>
      <PageHeader title="Detail Buku" subtitle={<Link to="/books" className="link-action">← Kembali ke koleksi</Link>} />

      <section className="card detail-card">
        <BookCover title={book.title} category={book.category} size="lg" />
        <div className="detail-main">
          <StatusBadge status={book.status} />
          <h2 className="detail-title">{book.title}</h2>
          <p className="muted">{book.category ? `${book.author} · ${book.category}` : book.author}</p>
          <div className="progress-head"><span>Progres</span><strong>{`${Math.round(book.progress_percent)}%`}</strong></div>
          <ProgressBar current={book.current_page} total={book.total_pages} tone={tone} />
          <div className="progress-foot muted small">{`${book.current_page} / ${book.total_pages} halaman`}</div>
          <BookFacts book={book} />
          {book.notes && <p className="notes">{book.notes}</p>}
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => openLogModal({ bookId: book.id })}><Icon name="plus" size={16} />Catat Aktivitas</button>
            <Link className="btn" to={`/books/${book.id}/edit`}><Icon name="edit" size={16} />Edit</Link>
            <button type="button" className="btn btn-danger-outline" onClick={() => bookDeletion.request(book)}><Icon name="trash" size={16} />Hapus</button>
          </div>
        </div>
      </section>

      <section className="card table-card section">
        <h2 className="card-title pad">Riwayat Reading Log</h2>
        {logs.length === 0 ? (
          <p className="muted pad">Belum ada aktivitas untuk buku ini.</p>
        ) : (
          <LogsTable logs={logs} showBook={false} onEdit={(log) => openLogModal({ log })} onDelete={logDeletion.request} />
        )}
      </section>

      {bookDeletion.target && (
        <ConfirmDialog
          title="Hapus buku?"
          message={`Buku "${book.title}" beserta ${book.log_summary.sessions} reading log akan dihapus permanen.`}
          busy={bookDeletion.busy}
          onConfirm={bookDeletion.confirm}
          onCancel={bookDeletion.cancel}
        />
      )}
      {logDeletion.target && (
        <ConfirmDialog
          title="Hapus aktivitas?"
          message={`Aktivitas tanggal ${formatDate(logDeletion.target.log_date)} akan dihapus dan progres buku dihitung ulang.`}
          busy={logDeletion.busy}
          onConfirm={logDeletion.confirm}
          onCancel={logDeletion.cancel}
        />
      )}
    </>
  );
}

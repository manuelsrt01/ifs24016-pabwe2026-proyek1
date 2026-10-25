import { Link } from 'react-router-dom';
import BookCover from './BookCover.jsx';
import Icon from './Icon.jsx';
import ProgressBar from './ProgressBar.jsx';
import StatusBadge from './StatusBadge.jsx';

/** Tampilan kartu (grid) dan baris (list) untuk satu buku. */
export default function BookCard({ book, onDelete, layout = 'grid' }) {
  const pct = Math.round(book.progress_percent);
  const tone = book.status === 'selesai' ? 'teal' : 'forest';
  const actions = (
    <div className="card-actions">
      <Link className="link-action" to={`/books/${book.id}`}><Icon name="eye" size={16} />Detail</Link>
      <span className="icon-actions">
        <Link className="icon-btn" to={`/books/${book.id}/edit`} aria-label={`Edit ${book.title}`} title="Edit"><Icon name="edit" size={16} /></Link>
        <button type="button" className="icon-btn" onClick={() => onDelete(book)} aria-label={`Hapus ${book.title}`} title="Hapus"><Icon name="trash" size={16} /></button>
      </span>
    </div>
  );

  if (layout === 'list') {
    return (
      <article className="card book-row">
        <BookCover title={book.title} category={book.category} size="sm" />
        <div className="book-row-main">
          <h3 className="book-title"><Link to={`/books/${book.id}`}>{book.title}</Link></h3>
          <p className="muted small">{book.author}</p>
        </div>
        <StatusBadge status={book.status} />
        <div className="book-row-progress">
          <ProgressBar current={book.current_page} total={book.total_pages} tone={tone} />
          <span className="muted small">{pct}% · {book.current_page} / {book.total_pages} hal</span>
        </div>
        {actions}
      </article>
    );
  }

  return (
    <article className="card book-card">
      <div className="book-card-top">
        <BookCover title={book.title} category={book.category} />
        <div className="book-card-info">
          <StatusBadge status={book.status} />
          <h3 className="book-title"><Link to={`/books/${book.id}`}>{book.title}</Link></h3>
          <p className="muted small">{book.author}</p>
        </div>
      </div>
      <div className="book-card-progress">
        <div className="progress-head"><span>Progres</span><strong>{pct}%</strong></div>
        <ProgressBar current={book.current_page} total={book.total_pages} tone={tone} />
        <div className="progress-foot muted small">{book.current_page} / {book.total_pages} hal</div>
      </div>
      {actions}
    </article>
  );
}

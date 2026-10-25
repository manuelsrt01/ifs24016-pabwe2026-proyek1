import { Link } from 'react-router-dom';
import BookCover from '../BookCover.jsx';
import Icon from '../Icon.jsx';
import ProgressBar from '../ProgressBar.jsx';

function ContinueCard({ book, onLog }) {
  return (
    <article className="card continue-card">
      <BookCover title={book.title} category={book.category} size="sm" />
      <div className="continue-main">
        <div className="continue-head">
          <div>
            <h3 className="book-title"><Link to={`/books/${book.id}`}>{book.title}</Link></h3>
            <p className="muted small">{book.author}</p>
          </div>
          <span className="pill">{Math.round(book.progress_percent)}%</span>
        </div>
        <ProgressBar current={book.current_page} total={book.total_pages} />
        <div className="progress-meta muted small">
          <span>{`${book.current_page} dari ${book.total_pages} halaman`}</span>
          <span>{`Sisa ${book.total_pages - book.current_page} hal`}</span>
        </div>
        <div className="actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onLog({ bookId: book.id })}><Icon name="plus" size={14} />Catat Progres</button>
          <Link className="btn btn-soft btn-sm" to={`/books/${book.id}`}><Icon name="eye" size={14} />Detail</Link>
        </div>
      </div>
    </article>
  );
}

export default function ContinueReading({ books, onLog }) {
  return (
    <section>
      <div className="section-head">
        <h2><Icon name="book-open" size={20} />Lanjutkan Membaca</h2>
        <Link to="/books" className="link-action">Semua Buku <Icon name="chevron" size={14} /></Link>
      </div>
      {books.length === 0 ? (
        <div className="card state">
          <p>Belum ada buku yang sedang dibaca.</p>
          <Link className="btn btn-primary" to="/books">Pilih buku</Link>
        </div>
      ) : (
        books.map((book) => <ContinueCard key={book.id} book={book} onLog={onLog} />)
      )}
    </section>
  );
}

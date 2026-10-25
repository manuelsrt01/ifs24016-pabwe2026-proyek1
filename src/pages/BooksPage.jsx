import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SegmentedControl from '../components/SegmentedControl.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx';
import { useAppData } from '../contexts/AppDataContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDeleteFlow } from '../hooks/useDeleteFlow.js';
import { api } from '../services/api.js';

const SEARCH_DEBOUNCE_MS = 300;
const LAYOUTS = [
  { value: 'grid', content: <Icon name="grid" size={16} />, ariaLabel: 'Tampilan kartu' },
  { value: 'list', content: <Icon name="list" size={16} />, ariaLabel: 'Tampilan daftar' },
];

const removeBook = (book) => api.deleteBook(book.id);
const deletedMessage = (book) => `Buku "${book.title}" dihapus`;

export default function BooksPage() {
  const { version, bump } = useAppData();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [layout, setLayout] = useState('grid');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: books, loading, error, reload } = useAsync(
    () => api.listBooks({ q, status, category }),
    [q, status, category, version],
  );

  // Daftar kategori dikumpulkan dari hasil yang pernah dimuat agar pilihan filter tidak menyusut.
  useEffect(() => {
    if (!books) return;
    setCategories((prev) => [...new Set([...prev, ...books.map((b) => b.category).filter(Boolean)])].sort((a, b) => a.localeCompare(b)));
  }, [books]);

  const deletion = useDeleteFlow({ remove: removeBook, successMessage: deletedMessage, onDeleted: bump });
  const filtered = Boolean(q || status || category);

  return (
    <>
      <PageHeader title="Koleksi Buku" subtitle="Kelola koleksi pustaka pribadi dan progres membacamu." />

      <div className="card toolbar">
        <div className="search-box">
          <Icon name="search" size={18} />
          <input type="search" aria-label="Cari judul buku atau penulis" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul buku atau penulis..." />
        </div>
        <select aria-label="Kategori" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="belum_dibaca">Belum Dibaca</option>
          <option value="sedang_dibaca">Sedang Dibaca</option>
          <option value="selesai">Selesai</option>
        </select>
        <SegmentedControl label="Tampilan" options={LAYOUTS} value={layout} onChange={setLayout} />
        <Link className="btn btn-primary" to="/books/new"><Icon name="plus" size={16} />Tambah Buku</Link>
      </div>

      {loading && !books && <LoadingState />}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {books && !error && books.length === 0 && (
        <EmptyState
          title={filtered ? 'Tidak ada buku yang cocok' : 'Belum ada buku'}
          text={filtered ? 'Ubah kata kunci atau filter pencarian.' : 'Tambahkan buku pertama Anda.'}
          action={!filtered && <Link className="btn btn-primary" to="/books/new">Tambah Buku</Link>}
        />
      )}
      {books && !error && books.length > 0 && (
        <div className={layout === 'grid' ? 'book-grid' : 'book-list'}>
          {books.map((b) => <BookCard key={b.id} book={b} layout={layout} onDelete={deletion.request} />)}
        </div>
      )}

      {deletion.target && (
        <ConfirmDialog
          title="Hapus buku?"
          message={`Buku "${deletion.target.title}" beserta seluruh reading log-nya akan dihapus permanen.`}
          busy={deletion.busy}
          onConfirm={deletion.confirm}
          onCancel={deletion.cancel}
        />
      )}
    </>
  );
}

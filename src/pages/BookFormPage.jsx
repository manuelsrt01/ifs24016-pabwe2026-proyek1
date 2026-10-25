import { useNavigate, useParams } from 'react-router-dom';
import BookForm from '../components/BookForm.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { useToast } from '../components/Toast.jsx';
import { useAppData } from '../contexts/AppDataContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../services/api.js';
import { bookToValues } from '../utils/bookMapper.js';

export default function BookFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useToast();
  const { bump } = useAppData();

  const { data: book, loading, error, reload } = useAsync(() => (editing ? api.getBook(id) : Promise.resolve(null)), [id]);
  const { data: all } = useAsync(() => api.listBooks(), []);
  const categories = [...new Set((all ?? []).map((b) => b.category).filter(Boolean))].sort();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const handleSubmit = async (payload) => {
    const saved = editing ? await api.updateBook(id, payload) : await api.createBook(payload);
    notify(editing ? 'Perubahan buku disimpan' : 'Buku berhasil ditambahkan');
    bump();
    navigate(`/books/${saved.id}`);
  };

  return (
    <>
      <PageHeader title={editing ? 'Edit Buku' : 'Tambah Buku'} subtitle="Lengkapi informasi buku di koleksi pustakamu." />
      <BookForm
        initial={book ? bookToValues(book) : undefined}
        categories={categories}
        submitLabel={editing ? 'Simpan Perubahan' : 'Tambah Buku'}
        onSubmit={handleSubmit}
        onCancel={() => navigate(editing ? `/books/${id}` : '/books')}
      />
    </>
  );
}

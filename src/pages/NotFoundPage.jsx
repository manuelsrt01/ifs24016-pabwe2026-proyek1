import { Link } from 'react-router-dom';
import { EmptyState } from '../components/States.jsx';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Halaman tidak ditemukan"
      text="Alamat yang Anda buka tidak tersedia."
      action={<Link className="btn btn-primary" to="/">Kembali ke dashboard</Link>}
    />
  );
}

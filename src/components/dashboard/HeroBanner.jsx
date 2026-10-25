import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';

export default function HeroBanner({ goal, onLog }) {
  return (
    <section className="hero">
      <div className="hero-body">
        <span className="hero-chip"><Icon name="sparkle" size={14} />{`Target Harian: ${goal} Halaman`}</span>
        <h2>Pertahankan Kebiasaan Membaca Anda</h2>
        <p>Halaman demi halaman membawa Anda lebih dekat pada pemahaman yang baru. Jangan lupa untuk mencatat kemajuan baca hari ini.</p>
      </div>
      <div className="hero-actions">
        <button type="button" className="btn btn-gold" onClick={() => onLog()}><Icon name="plus" size={16} />Catat Aktivitas</button>
        <Link className="btn btn-ghost-dark" to="/books">Lihat Pustaka</Link>
      </div>
    </section>
  );
}

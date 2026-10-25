import { formatDuration, formatNumber } from '../../utils/format.js';
import StatCard from '../StatCard.jsx';

export default function StatisticsSummary({ habits }) {
  return (
    <section className="stat-grid">
      <StatCard label="Total Halaman" value={`${formatNumber(habits.total_pages)} hal`} hint="Periode terpilih" />
      <StatCard label="Waktu Membaca" value={formatDuration(habits.total_minutes)} hint="Total akumulasi durasi" />
      <StatCard label="Hari Aktif" value={`${habits.active_days} Hari`} valueTone="amber" hint="Hari mencatat bacaan" />
      <StatCard label="Buku Selesai" value={`${habits.finished_books_all_time} Buku`} valueTone="teal" hint="Dari total koleksi" />
    </section>
  );
}

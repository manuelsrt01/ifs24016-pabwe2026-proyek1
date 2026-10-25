import { formatNumber } from '../../utils/format.js';
import StatCard from '../StatCard.jsx';

export default function SummaryCards({ summary }) {
  return (
    <section className="stat-grid" aria-label="Ringkasan">
      <StatCard label="Total Buku" value={formatNumber(summary.total_books)} icon="library" tone="green" />
      <StatCard label="Sedang Dibaca" value={formatNumber(summary.reading)} icon="book-open" tone="amber" />
      <StatCard label="Buku Selesai" value={formatNumber(summary.finished)} icon="check-circle" tone="teal" />
      <StatCard label="Total Halaman" value={formatNumber(summary.pages_logged)} icon="pages" tone="indigo" hint="Dari seluruh aktivitas membaca" />
    </section>
  );
}

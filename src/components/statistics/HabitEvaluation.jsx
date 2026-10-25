import { consistencyLabel } from '../../utils/format.js';
import Icon from '../Icon.jsx';

const QUOTE = 'Buku adalah kapal yang membawa kita mengarungi lautan waktu yang tak bertepi.';

export default function HabitEvaluation({ habits }) {
  const percent = Math.round(habits.consistency_ratio * 100);
  const label = consistencyLabel(habits.active_days, habits.period.days);
  return (
    <section className="card">
      <h2 className="card-title"><Icon name="award" size={20} />Evaluasi Kebiasaan Membaca</h2>
      <p className="muted small">Berdasarkan catatan aktivitas Anda dalam periode ini:</p>
      <ul className="eval-list">
        <li>
          <Icon name="check-circle" size={16} />
          <span>Rata-rata Anda membaca <strong>{habits.avg_pages_per_active_day} halaman</strong> per hari aktif.</span>
        </li>
        <li>
          <Icon name="check-circle" size={16} />
          <span>
            Konsistensi membaca Anda berada pada status <strong className="accent">{label}</strong>
            {` (${habits.active_days} dari ${habits.period.days} hari aktif, ${percent}%).`}
          </span>
        </li>
        <li>
          <Icon name="flame" size={16} />
          <span>Streak saat ini <strong>{habits.streaks.current} hari</strong>; terpanjang <strong>{habits.streaks.longest} hari</strong>.</span>
        </li>
      </ul>
      <p className="muted tiny">
        Konsistensi = hari aktif ÷ jumlah hari periode (≥80% Sangat Baik, ≥50% Baik, ≥25% Cukup).
        Streak = hari berturut-turut dengan minimal satu log, berakhir hari ini atau kemarin.
      </p>
      <blockquote className="quote"><span>Kutipan inspirasi</span>{`“${QUOTE}”`}</blockquote>
    </section>
  );
}

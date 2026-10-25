import Icon from '../Icon.jsx';
import ProgressBar from '../ProgressBar.jsx';

export default function DailyGoalCard({ pagesToday, goal }) {
  const remaining = Math.max(0, goal - pagesToday);
  return (
    <section className="card">
      <h2 className="card-title"><span className="accent"><Icon name="flame" size={20} /></span>Target Membaca Hari Ini</h2>
      <div className="goal-line"><strong>{pagesToday}</strong><span className="muted">{` / ${goal} halaman`}</span></div>
      <ProgressBar current={Math.min(pagesToday, goal)} total={goal} tone="amber" label="Progres target harian" />
      <p className="hint-box">
        {remaining > 0
          ? `Hanya butuh ${remaining} halaman lagi untuk mencapai target harian Anda.`
          : 'Target harian tercapai. Kerja bagus!'}
      </p>
    </section>
  );
}

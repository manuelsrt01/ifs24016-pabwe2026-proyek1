import WeekBars from '../WeekBars.jsx';

export default function WeeklyActivity({ days }) {
  const total = days.reduce((sum, d) => sum + d.pages, 0);
  return (
    <section className="card section">
      <div className="section-head">
        <div>
          <h2 className="card-title">Aktivitas Membaca Minggu Ini</h2>
          <p className="muted small">Jumlah halaman yang dibaca 7 hari terakhir</p>
        </div>
        <span className="legend"><i />Halaman</span>
      </div>
      <WeekBars days={days} />
      <div className="week-foot">
        <span className="muted small">Total minggu ini: <strong>{total} hal</strong></span>
        <span className="muted small">Rata-rata: <strong>{Math.round(total / days.length)} hal/hari</strong></span>
      </div>
    </section>
  );
}

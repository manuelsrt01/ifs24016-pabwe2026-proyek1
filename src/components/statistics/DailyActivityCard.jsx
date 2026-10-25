import { useState } from 'react';
import ActivityChart from '../ActivityChart.jsx';
import SegmentedControl from '../SegmentedControl.jsx';

const METRICS = [
  { value: 'pages', content: 'Halaman' },
  { value: 'minutes', content: 'Menit' },
];

export default function DailyActivityCard({ days, habits }) {
  const [metric, setMetric] = useState('pages');
  return (
    <section className="card section">
      <div className="section-head">
        <h2 className="card-title">Aktivitas Harian</h2>
        <SegmentedControl label="Metrik grafik" options={METRICS} value={metric} onChange={setMetric} textual />
      </div>
      <ActivityChart days={days} metric={metric} />
      <p className="muted tiny">
        {`Rata-rata per sesi ${habits.avg_minutes_per_session} mnt · per hari aktif ${habits.avg_minutes_per_active_day} mnt · per hari (semua hari) ${habits.avg_minutes_per_day} mnt.`}
      </p>
    </section>
  );
}

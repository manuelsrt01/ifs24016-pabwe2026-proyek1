import { useState } from 'react';
import CategoryDistribution from '../components/statistics/CategoryDistribution.jsx';
import DailyActivityCard from '../components/statistics/DailyActivityCard.jsx';
import HabitEvaluation from '../components/statistics/HabitEvaluation.jsx';
import StatisticsSummary from '../components/statistics/StatisticsSummary.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SegmentedControl from '../components/SegmentedControl.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { useAppData } from '../contexts/AppDataContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../services/api.js';
import { addDaysIso } from '../utils/format.js';

const PERIODS = [
  { value: '7', content: '7 Hari Terakhir' },
  { value: '30', content: '30 Hari Terakhir' },
  { value: 'all', content: 'Semua Waktu' },
];
const MAX_CHART_DAYS = 366;

/** Memuat statistik kebiasaan, aktivitas harian, dan distribusi kategori untuk satu periode. */
async function loadStatistics(period) {
  const habits = await api.readingHabits({ days: period });
  // Rentang tanggal mengikuti periode dari server agar zona waktu konsisten.
  const { from, to, days } = habits.period;
  const chartFrom = days > MAX_CHART_DAYS ? addDaysIso(to, -(MAX_CHART_DAYS - 1)) : from;
  const [activity, categories] = await Promise.all([
    api.readingActivity({ from: chartFrom, to }),
    api.categories(),
  ]);
  return { habits, activity, categories };
}

export default function StatisticsPage() {
  const { version } = useAppData();
  const [period, setPeriod] = useState('7');
  const { data, loading, error, reload } = useAsync(() => loadStatistics(period), [period, version]);

  return (
    <>
      <PageHeader title="Statistik Kebiasaan Membaca" subtitle="Analisis kebiasaan dan tren membaca secara mendalam." />

      <div className="card panel-head">
        <div>
          <h2>Ringkasan Statistik Membaca</h2>
          <p className="muted small">Analisis konsistensi dan distribusi kebiasaan membaca</p>
        </div>
        <SegmentedControl label="Periode" options={PERIODS} value={period} onChange={setPeriod} textual />
      </div>

      {loading && !data && <LoadingState />}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {data && !error && (
        <>
          <StatisticsSummary habits={data.habits} />
          <div className="two-col even">
            <CategoryDistribution categories={data.categories.categories} />
            <HabitEvaluation habits={data.habits} />
          </div>
          <DailyActivityCard days={data.activity.days} habits={data.habits} />
        </>
      )}
    </>
  );
}

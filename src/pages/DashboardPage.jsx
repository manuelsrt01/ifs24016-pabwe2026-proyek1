import ContinueReading from '../components/dashboard/ContinueReading.jsx';
import DailyGoalCard from '../components/dashboard/DailyGoalCard.jsx';
import HeroBanner from '../components/dashboard/HeroBanner.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import WeeklyActivity from '../components/dashboard/WeeklyActivity.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { useAppData } from '../contexts/AppDataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../services/api.js';
import { greeting } from '../utils/format.js';

export default function DashboardPage() {
  const { version, openLogModal } = useAppData();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.dashboardSummary(), [version]);

  const firstName = (user?.name ?? 'Pembaca').split(' ')[0];
  const header = (
    <PageHeader title={`${greeting(new Date().getHours())}, ${firstName}!`} subtitle="Mari lanjutkan perjalanan membacamu hari ini." />
  );

  if (loading && !data) return <>{header}<LoadingState /></>;
  if (error) return <>{header}<ErrorState error={error} onRetry={reload} /></>;

  return (
    <>
      {header}
      <HeroBanner goal={data.daily_goal_pages} onLog={openLogModal} />
      <SummaryCards summary={data} />
      <div className="two-col">
        <ContinueReading books={data.reading_books} onLog={openLogModal} />
        <aside className="side-col">
          <DailyGoalCard pagesToday={data.today.pages} goal={data.daily_goal_pages} />
          <RecentActivity logs={data.recent_logs} />
        </aside>
      </div>
      <WeeklyActivity days={data.last_7_days} />
    </>
  );
}

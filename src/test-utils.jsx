// Utilitas khusus pengujian (dikecualikan dari analisis SonarQube & coverage).
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { ToastProvider } from './components/Toast.jsx';
import { AppDataContext } from './contexts/AppDataContext.jsx';
import { AuthContext } from './contexts/AuthContext.jsx';

export const makeUser = (over = {}) => ({
  id: 1, name: 'Budi Santoso', email: 'budi@example.com', daily_goal_pages: 30, ...over,
});

export const makeBook = (over = {}) => ({
  id: 1, title: 'Atomic Habits', author: 'James Clear', category: 'Self-Development', total_pages: 320,
  current_page: 215, status: 'sedang_dibaca', progress_percent: 67.2, started_at: '2026-10-01',
  finished_at: null, notes: null, log_summary: { sessions: 2, total_pages_logged: 60, total_minutes: 80 }, ...over,
});

export const makeLog = (over = {}) => ({
  id: 1, book_id: 1, book_title: 'Atomic Habits', log_date: '2026-10-22', start_page: 190, end_page: 215,
  pages_read: 25, duration_minutes: 45, notes: 'Catatan bab satu', ...over,
});

export const makeSummary = (over = {}) => ({
  total_books: 6, reading: 3, finished: 2, unread: 1, pages_read: 1234, pages_logged: 176, total_minutes: 285,
  total_sessions: 6, daily_goal_pages: 30, today: { date: '2026-10-22', pages: 25, minutes: 45, sessions: 1 },
  last_7_days: ['16', '17', '18', '19', '20', '21', '22'].map((d, i) => ({ date: `2026-10-${d}`, pages: i * 5, minutes: i * 10, sessions: i ? 1 : 0 })),
  reading_books: [makeBook()], recent_logs: [makeLog()], ...over,
});

export const makeHabits = (over = {}) => ({
  period: { from: '2026-10-16', to: '2026-10-22', days: 7, all_time: false },
  total_pages: 176, total_minutes: 345, sessions: 6, active_days: 6, avg_minutes_per_session: 57.5,
  avg_minutes_per_active_day: 57.5, avg_minutes_per_day: 49.3, avg_pages_per_active_day: 29, consistency_ratio: 0.86,
  streaks: { current: 6, longest: 6 }, finished_books: [], finished_books_all_time: 2, ...over,
});

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

/**
 * Merender elemen di dalam router, toast, auth, dan app-data (semuanya dapat di-override).
 * `path` = pola rute elemen; `route` = URL awal. Lokasi saat ini tersedia di [data-testid="location"].
 */
export function renderWithProviders(ui, { route = '/', path = '*', auth = {}, appData = {} } = {}) {
  const authValue = {
    status: 'authed', user: makeUser(), login: vi.fn(), register: vi.fn(), logout: vi.fn(), setUser: vi.fn(), ...auth,
  };
  const appValue = { version: 0, openLogModal: vi.fn(), bump: vi.fn(), ...appData };
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthContext.Provider value={authValue}>
          <AppDataContext.Provider value={appValue}>
            <Routes><Route path={path} element={ui} /></Routes>
            <LocationProbe />
          </AppDataContext.Provider>
        </AuthContext.Provider>
      </ToastProvider>
    </MemoryRouter>,
  );
  return { ...utils, authValue, appValue };
}

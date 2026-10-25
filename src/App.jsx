import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LoadingState } from './components/States.jsx';
import { AppDataProvider } from './contexts/AppDataContext.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import ActivitiesPage from './pages/ActivitiesPage.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import BookFormPage from './pages/BookFormPage.jsx';
import BooksPage from './pages/BooksPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import StatisticsPage from './pages/StatisticsPage.jsx';

/** Halaman yang hanya boleh dibuka setelah login; selain itu diarahkan ke /login. */
function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <div className="boot"><LoadingState text="Memuat TanaRead…" /></div>;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return (
    <AppDataProvider>
      <AppLayout />
    </AppDataProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Alias URL berawalan /auth agar tautan login/daftar bergaya /auth/... tetap sampai ke halaman yang sama */}
      <Route path="/auth/login" element={<Navigate to="/login" replace />} />
      <Route path="/auth/register" element={<Navigate to="/register" replace />} />
      <Route element={<RequireAuth />}>
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="books/new" element={<BookFormPage />} />
        <Route path="books/:id" element={<BookDetailPage />} />
        <Route path="books/:id/edit" element={<BookFormPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

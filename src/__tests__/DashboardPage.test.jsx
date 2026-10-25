import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDataContext } from '../contexts/AppDataContext.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import { api } from '../services/api.js';

vi.mock('../services/api.js', () => ({ api: { dashboardSummary: vi.fn() } }));

const days = ['2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22']
  .map((date, i) => ({ date, pages: i * 5, minutes: i * 10, sessions: i ? 1 : 0 }));
const summary = {
  total_books: 6, reading: 3, finished: 2, unread: 1, pages_read: 1234, pages_logged: 176, total_minutes: 285, total_sessions: 6,
  daily_goal_pages: 30, today: { date: '2026-10-22', pages: 25, minutes: 45, sessions: 1 },
  last_7_days: days,
  reading_books: [{ id: 7, title: 'Atomic Habits', author: 'James Clear', category: 'Self-Development', total_pages: 320, current_page: 215, progress_percent: 67.2 }],
  recent_logs: [{ id: 1, book_id: 7, book_title: 'Atomic Habits', log_date: '2026-10-22', start_page: 190, end_page: 215, pages_read: 25, duration_minutes: 45, notes: null }],
};

const openLogModal = vi.fn();
const renderPage = () => render(
  <AppDataContext.Provider value={{ version: 0, openLogModal, bump: vi.fn() }}>
    <MemoryRouter><DashboardPage /></MemoryRouter>
  </AppDataContext.Provider>,
);

describe('DashboardPage', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('menampilkan loading lalu statistik, target harian, dan buku yang sedang dibaca dari API', async () => {
    api.dashboardSummary.mockResolvedValue(summary);
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent(/memuat/i);
    expect(await screen.findByText('Total Buku')).toBeInTheDocument();
    expect(screen.getByText('176')).toBeInTheDocument();
    expect(screen.getByText('Target Harian: 30 Halaman')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText(/hanya butuh 5 halaman lagi/i)).toBeInTheDocument();
    expect(screen.getByText('215 dari 320 halaman')).toBeInTheDocument();
    expect(screen.getByText('Sisa 105 hal')).toBeInTheDocument();
    expect(screen.getByText('+25 hal (Hal 190-215)')).toBeInTheDocument();
    expect(screen.getByText('Total minggu ini:', { exact: false })).toHaveTextContent('105 hal');
  });

  it('menyatakan target tercapai bila halaman hari ini >= target', async () => {
    api.dashboardSummary.mockResolvedValue({ ...summary, today: { ...summary.today, pages: 30 } });
    renderPage();
    expect(await screen.findByText(/target harian tercapai/i)).toBeInTheDocument();
  });

  it('tombol Catat Progres membuka modal dengan buku terpilih', async () => {
    api.dashboardSummary.mockResolvedValue(summary);
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /catat progres/i }));
    expect(openLogModal).toHaveBeenCalledWith({ bookId: 7 });
  });

  it('menampilkan pesan kosong bila tidak ada buku yang sedang dibaca', async () => {
    api.dashboardSummary.mockResolvedValue({ ...summary, reading_books: [], recent_logs: [] });
    renderPage();
    expect(await screen.findByText('Belum ada buku yang sedang dibaca.')).toBeInTheDocument();
    expect(screen.getByText(/belum ada aktivitas/i)).toBeInTheDocument();
  });

  it('menampilkan error state dan dapat mencoba lagi', async () => {
    api.dashboardSummary.mockRejectedValueOnce(new Error('Server mati')).mockResolvedValueOnce(summary);
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Server mati');
    await userEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(await screen.findByText('Total Buku')).toBeInTheDocument();
    expect(api.dashboardSummary).toHaveBeenCalledTimes(2);
  });
});

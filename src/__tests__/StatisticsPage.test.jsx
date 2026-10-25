import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StatisticsPage from '../pages/StatisticsPage.jsx';
import { api } from '../services/api.js';
import { makeHabits, renderWithProviders } from '../test-utils.jsx';

vi.mock('../services/api.js', () => ({ api: { readingHabits: vi.fn(), readingActivity: vi.fn(), categories: vi.fn() } }));
vi.mock('recharts', async () => {
  const React = await import('react');
  const h = React.createElement;
  const passthrough = ({ children }) => h('div', null, children);
  return {
    ResponsiveContainer: passthrough, BarChart: passthrough, Bar: () => null, CartesianGrid: () => null,
    XAxis: () => null, YAxis: () => null, Tooltip: () => null,
  };
});

const activity = {
  days: [{ date: '2026-10-21', pages: 10, minutes: 20, sessions: 1 }, { date: '2026-10-22', pages: 25, minutes: 45, sessions: 1 }],
  totals: { pages: 35, minutes: 65, sessions: 2 },
};
const categories = {
  total_books: 6,
  categories: [{ category: 'Self-Development', books: 2, percent: 33 }, { category: 'Sejarah', books: 1, percent: 17 }],
};

describe('StatisticsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.readingHabits.mockResolvedValue(makeHabits());
    api.readingActivity.mockResolvedValue(activity);
    api.categories.mockResolvedValue(categories);
  });

  it('menampilkan ringkasan, distribusi kategori, evaluasi kebiasaan, dan grafik harian', async () => {
    renderWithProviders(<StatisticsPage />);
    expect(screen.getByRole('status')).toHaveTextContent(/memuat/i);
    expect(await screen.findByText('5 Jam 45 mnt')).toBeInTheDocument();
    expect(screen.getByText('176 hal')).toBeInTheDocument();
    expect(screen.getByText('6 Hari')).toBeInTheDocument();
    expect(screen.getByText('2 Buku')).toBeInTheDocument();
    expect(screen.getByText('2 buku (33%)')).toBeInTheDocument();
    expect(screen.getByText('Sejarah')).toBeInTheDocument();
    expect(screen.getByText('29 halaman')).toBeInTheDocument();
    expect(screen.getByText('Sangat Baik')).toBeInTheDocument();
    expect(screen.getByText(/6 dari 7 hari aktif, 86%/)).toBeInTheDocument();
    expect(screen.getAllByText('6 hari', { selector: 'strong' })).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Grafik halaman dibaca per hari' })).toBeInTheDocument();
    expect(api.readingHabits).toHaveBeenCalledWith({ days: '7' });
    expect(api.readingActivity).toHaveBeenCalledWith({ from: '2026-10-16', to: '2026-10-22' });
  });

  it('mengganti periode memuat ulang statistik dengan parameter baru', async () => {
    renderWithProviders(<StatisticsPage />);
    await screen.findByText('5 Jam 45 mnt');
    await userEvent.click(screen.getByRole('button', { name: '30 Hari Terakhir' }));
    await waitFor(() => expect(api.readingHabits).toHaveBeenLastCalledWith({ days: '30' }));
    expect(screen.getByRole('button', { name: '30 Hari Terakhir' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Semua Waktu' }));
    await waitFor(() => expect(api.readingHabits).toHaveBeenLastCalledWith({ days: 'all' }));
  });

  it('periode semua waktu > 366 hari membatasi rentang grafik', async () => {
    api.readingHabits.mockResolvedValue(makeHabits({ period: { from: '2024-01-01', to: '2026-10-22', days: 1026, all_time: true } }));
    renderWithProviders(<StatisticsPage />);
    await screen.findByText('5 Jam 45 mnt');
    expect(api.readingActivity).toHaveBeenCalledWith({ from: '2025-10-22', to: '2026-10-22' });
  });

  it('beralih metrik grafik ke menit', async () => {
    renderWithProviders(<StatisticsPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Menit' }));
    expect(screen.getByRole('img', { name: 'Grafik menit dibaca per hari' })).toBeInTheDocument();
  });

  it('data kosong: pesan tidak ada kategori dan status "Belum Ada Data"', async () => {
    api.categories.mockResolvedValue({ total_books: 0, categories: [] });
    api.readingHabits.mockResolvedValue(makeHabits({ active_days: 0, total_pages: 0, total_minutes: 0, consistency_ratio: 0, avg_pages_per_active_day: 0 }));
    renderWithProviders(<StatisticsPage />);
    expect(await screen.findByText('Belum ada buku di koleksi.')).toBeInTheDocument();
    expect(screen.getByText('Belum Ada Data')).toBeInTheDocument();
  });

  it('error state dan coba lagi', async () => {
    api.readingHabits.mockRejectedValueOnce(new Error('Server mati')).mockResolvedValueOnce(makeHabits());
    renderWithProviders(<StatisticsPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Server mati');
    await userEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(await screen.findByText('5 Jam 45 mnt')).toBeInTheDocument();
  });
});

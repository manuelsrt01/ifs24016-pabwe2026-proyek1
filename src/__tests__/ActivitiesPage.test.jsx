import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ActivitiesPage from '../pages/ActivitiesPage.jsx';
import { api } from '../services/api.js';
import { makeLog, renderWithProviders } from '../test-utils.jsx';

vi.mock('../services/api.js', () => ({ api: { listLogs: vi.fn(), deleteLog: vi.fn() } }));

const page = (rows, total = rows.length) => ({ data: rows, meta: { total, limit: 15, offset: 0 } });

describe('ActivitiesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.listLogs.mockResolvedValue(page([makeLog()]));
  });

  it('menampilkan riwayat aktivitas dari API beserta ringkasan halaman', async () => {
    renderWithProviders(<ActivitiesPage />);
    expect(screen.getByRole('status')).toHaveTextContent(/memuat/i);
    expect(await screen.findByText('Hal 190 - 215')).toBeInTheDocument();
    expect(screen.getByText('Menampilkan 1–1 dari 1 aktivitas')).toBeInTheDocument();
    expect(api.listLogs).toHaveBeenCalledWith({ limit: 15, offset: 0 });
    expect(screen.getByRole('button', { name: 'Sebelumnya' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Berikutnya' })).toBeDisabled();
  });

  it('empty state bila belum ada aktivitas', async () => {
    api.listLogs.mockResolvedValue(page([]));
    renderWithProviders(<ActivitiesPage />);
    expect(await screen.findByText('Belum ada aktivitas')).toBeInTheDocument();
  });

  it('error state dengan tombol coba lagi', async () => {
    api.listLogs.mockRejectedValueOnce(new Error('Server mati')).mockResolvedValueOnce(page([makeLog()]));
    renderWithProviders(<ActivitiesPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Server mati');
    await userEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(await screen.findByText('Hal 190 - 215')).toBeInTheDocument();
  });

  it('paginasi meminta offset berikutnya dan kembali', async () => {
    const rows = Array.from({ length: 15 }, (_, i) => makeLog({ id: i + 1 }));
    api.listLogs.mockResolvedValue(page(rows, 20));
    renderWithProviders(<ActivitiesPage />);
    expect(await screen.findByText('Menampilkan 1–15 dari 20 aktivitas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
    await waitFor(() => expect(api.listLogs).toHaveBeenLastCalledWith({ limit: 15, offset: 15 }));
    await userEvent.click(await screen.findByRole('button', { name: 'Sebelumnya' }));
    await waitFor(() => expect(api.listLogs).toHaveBeenLastCalledWith({ limit: 15, offset: 0 }));
  });

  it('tombol tambah dan edit membuka modal aktivitas', async () => {
    const { appValue } = renderWithProviders(<ActivitiesPage />);
    await userEvent.click(await screen.findByRole('button', { name: /catat aktivitas baru/i }));
    expect(appValue.openLogModal).toHaveBeenCalledWith();
    await userEvent.click(screen.getByRole('button', { name: 'Edit aktivitas 2026-10-22' }));
    expect(appValue.openLogModal).toHaveBeenLastCalledWith({ log: makeLog() });
  });

  it('menghapus aktivitas setelah konfirmasi', async () => {
    api.deleteLog.mockResolvedValue(null);
    const { appValue } = renderWithProviders(<ActivitiesPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Hapus aktivitas 2026-10-22' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Atomic Habits');
    expect(api.deleteLog).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Hapus' }));
    await waitFor(() => expect(api.deleteLog).toHaveBeenCalledWith(1));
    await waitFor(() => expect(appValue.bump).toHaveBeenCalled());
  });

  it('membatalkan penghapusan menutup dialog', async () => {
    renderWithProviders(<ActivitiesPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Hapus aktivitas 2026-10-22' }));
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.deleteLog).not.toHaveBeenCalled();
  });

  it('mundur satu halaman bila baris terakhir di halaman terakhir dihapus', async () => {
    api.deleteLog.mockResolvedValue(null);
    api.listLogs.mockImplementation(async ({ offset }) => (offset === 0
      ? page(Array.from({ length: 15 }, (_, i) => makeLog({ id: i + 1 })), 16)
      : page([makeLog({ id: 99, log_date: '2026-10-01' })], 16)));
    renderWithProviders(<ActivitiesPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Berikutnya' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Hapus aktivitas 2026-10-01' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Hapus' }));
    await waitFor(() => expect(api.listLogs).toHaveBeenLastCalledWith({ limit: 15, offset: 0 }));
  });
});

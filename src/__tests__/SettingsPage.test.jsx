import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from '../pages/SettingsPage.jsx';
import { api } from '../services/api.js';
import { makeSummary, makeUser, renderWithProviders } from '../test-utils.jsx';

vi.mock('../services/api.js', () => ({ api: { dashboardSummary: vi.fn(), updateMe: vi.fn(), resetMyData: vi.fn() } }));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.dashboardSummary.mockResolvedValue(makeSummary());
  });

  it('menampilkan target, nama, email, dan jumlah data dari server', async () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByLabelText('Target halaman harian')).toHaveValue(30);
    expect(screen.getByLabelText('Nama')).toHaveValue('Budi Santoso');
    expect(screen.getByText('Email akun: budi@example.com')).toBeInTheDocument();
    expect(await screen.findByText('6 Buku')).toBeInTheDocument();
    expect(screen.getByText('6 Log')).toBeInTheDocument();
  });

  it('memakai nilai bawaan bila data pengguna belum tersedia', async () => {
    renderWithProviders(<SettingsPage />, { auth: { user: null } });
    expect(screen.getByLabelText('Target halaman harian')).toHaveValue(30);
    expect(screen.getByLabelText('Nama')).toHaveValue('');
    expect(screen.getByText('Email akun: -')).toBeInTheDocument();
    expect(await screen.findByText('6 Buku')).toBeInTheDocument();
  });

  it('menyimpan target harian yang valid', async () => {
    api.updateMe.mockResolvedValue(makeUser({ daily_goal_pages: 45 }));
    const { authValue, appValue } = renderWithProviders(<SettingsPage />);
    await userEvent.clear(screen.getByLabelText('Target halaman harian'));
    await userEvent.type(screen.getByLabelText('Target halaman harian'), '45');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Target' }));
    await waitFor(() => expect(api.updateMe).toHaveBeenCalledWith({ daily_goal_pages: 45 }));
    expect(authValue.setUser).toHaveBeenCalledWith(makeUser({ daily_goal_pages: 45 }));
    expect(appValue.bump).toHaveBeenCalled();
    expect(await screen.findByText('Target harian disimpan')).toBeInTheDocument();
  });

  it('menolak target di luar rentang tanpa memanggil API', async () => {
    renderWithProviders(<SettingsPage />);
    await userEvent.clear(screen.getByLabelText('Target halaman harian'));
    await userEvent.type(screen.getByLabelText('Target halaman harian'), '0');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Target' }));
    expect(await screen.findByText(/target harian harus bilangan bulat 1–10000/i)).toBeInTheDocument();
    expect(api.updateMe).not.toHaveBeenCalled();
  });

  it('menyimpan nama, menolak nama kosong', async () => {
    api.updateMe.mockResolvedValue(makeUser({ name: 'Nama Baru' }));
    renderWithProviders(<SettingsPage />);
    await userEvent.clear(screen.getByLabelText('Nama'));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Nama' }));
    expect(await screen.findByText('Nama wajib diisi')).toBeInTheDocument();
    expect(api.updateMe).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText('Nama'), '  Nama Baru ');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Nama' }));
    await waitFor(() => expect(api.updateMe).toHaveBeenCalledWith({ name: 'Nama Baru' }));
    expect(await screen.findByText('Profil disimpan')).toBeInTheDocument();
  });

  it('menampilkan error dari server saat menyimpan', async () => {
    const err = Object.assign(new Error('Data tidak valid'), { details: { daily_goal_pages: 'Ditolak server' } });
    api.updateMe.mockRejectedValue(err);
    renderWithProviders(<SettingsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Target' }));
    expect(await screen.findByText('Ditolak server')).toBeInTheDocument();
    api.updateMe.mockRejectedValue(new Error('Tanpa detail'));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Target' }));
    await waitFor(() => expect(screen.queryByText('Ditolak server')).toBeNull());
  });

  it('tombol keluar memanggil logout', async () => {
    const { authValue } = renderWithProviders(<SettingsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Keluar dari akun' }));
    expect(authValue.logout).toHaveBeenCalled();
  });

  it('reset data meminta konfirmasi lalu memanggil API', async () => {
    api.resetMyData.mockResolvedValue(null);
    const { appValue } = renderWithProviders(<SettingsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Reset Semua Data Ke Semula' }));
    expect(api.resetMyData).not.toHaveBeenCalled();
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Ya, hapus semua' }));
    await waitFor(() => expect(api.resetMyData).toHaveBeenCalled());
    await waitFor(() => expect(appValue.bump).toHaveBeenCalled());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('membatalkan reset menutup dialog; kegagalan reset menampilkan error', async () => {
    api.resetMyData.mockRejectedValue(new Error('Gagal reset'));
    renderWithProviders(<SettingsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Reset Semua Data Ke Semula' }));
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Reset Semua Data Ke Semula' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Ya, hapus semua' }));
    expect(await screen.findByText('Gagal reset')).toBeInTheDocument();
  });

  it('error saat memuat ringkasan data', async () => {
    api.dashboardSummary.mockRejectedValue(new Error('Server mati'));
    renderWithProviders(<SettingsPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Server mati');
  });
});

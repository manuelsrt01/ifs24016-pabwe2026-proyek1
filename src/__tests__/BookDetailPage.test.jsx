import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookDetailPage from '../pages/BookDetailPage.jsx';
import { api } from '../services/api.js';
import { makeBook, makeLog, renderWithProviders } from '../test-utils.jsx';

vi.mock('../services/api.js', () => ({
  api: { getBook: vi.fn(), listBookLogs: vi.fn(), deleteBook: vi.fn(), deleteLog: vi.fn() },
}));

const renderPage = (opts) => renderWithProviders(<BookDetailPage />, { route: '/books/1', path: '/books/:id', ...opts });

describe('BookDetailPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getBook.mockResolvedValue(makeBook({ notes: 'Catatan buku' }));
    api.listBookLogs.mockResolvedValue([makeLog()]);
  });

  it('menampilkan informasi buku, ringkasan log, dan riwayat', async () => {
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent(/memuat/i);
    expect(await screen.findByRole('heading', { name: 'Atomic Habits' })).toBeInTheDocument();
    expect(screen.getByText('James Clear · Self-Development')).toBeInTheDocument();
    expect(screen.getByText('215 / 320 halaman')).toBeInTheDocument();
    expect(screen.getByText('1 j 20 mnt')).toBeInTheDocument();
    expect(screen.getByText('Catatan buku')).toBeInTheDocument();
    expect(screen.getByText('Hal 190 - 215')).toBeInTheDocument();
    expect(api.getBook).toHaveBeenCalledWith('1');
  });

  it('buku tanpa kategori, catatan, dan log menampilkan pesan kosong', async () => {
    api.getBook.mockResolvedValue(makeBook({ category: null, notes: null, status: 'selesai' }));
    api.listBookLogs.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('James Clear')).toBeInTheDocument();
    expect(screen.getByText('Belum ada aktivitas untuk buku ini.')).toBeInTheDocument();
  });

  it('error state', async () => {
    api.getBook.mockRejectedValue(new Error('Buku tidak ditemukan'));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Buku tidak ditemukan');
  });

  it('tombol Catat Aktivitas dan Edit log membuka modal', async () => {
    const { appValue } = renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /catat aktivitas/i }));
    expect(appValue.openLogModal).toHaveBeenCalledWith({ bookId: 1 });
    await userEvent.click(screen.getByRole('button', { name: 'Edit aktivitas 2026-10-22' }));
    expect(appValue.openLogModal).toHaveBeenLastCalledWith({ log: makeLog() });
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute('href', '/books/1/edit');
  });

  it('menghapus aktivitas setelah konfirmasi', async () => {
    api.deleteLog.mockResolvedValue(null);
    const { appValue } = renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Hapus aktivitas 2026-10-22' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Hapus' }));
    await waitFor(() => expect(api.deleteLog).toHaveBeenCalledWith(1));
    await waitFor(() => expect(appValue.bump).toHaveBeenCalled());
  });

  it('menghapus buku setelah konfirmasi lalu kembali ke koleksi', async () => {
    api.deleteBook.mockResolvedValue(null);
    const { appValue } = renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Hapus' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('2 reading log');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Hapus' }));
    await waitFor(() => expect(api.deleteBook).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/books'));
    expect(appValue.bump).toHaveBeenCalled();
  });
});

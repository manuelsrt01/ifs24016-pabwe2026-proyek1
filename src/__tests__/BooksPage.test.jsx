import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../components/Toast.jsx';
import BooksPage from '../pages/BooksPage.jsx';
import { api } from '../services/api.js';

vi.mock('../services/api.js', () => ({ api: { listBooks: vi.fn(), deleteBook: vi.fn() } }));

const book = (over) => ({
  id: 1, title: 'Laskar Pelangi', author: 'Andrea Hirata', category: 'Fiksi', total_pages: 200,
  current_page: 50, status: 'sedang_dibaca', progress_percent: 25, ...over,
});
const renderPage = () => render(<MemoryRouter><ToastProvider><BooksPage /></ToastProvider></MemoryRouter>);

describe('BooksPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('menampilkan daftar buku dari API beserta progres', async () => {
    api.listBooks.mockResolvedValue([book(), book({ id: 2, title: 'Basis Data', category: 'Teknologi', status: 'selesai', current_page: 200, progress_percent: 100 })]);
    renderPage();
    expect(await screen.findByRole('link', { name: 'Laskar Pelangi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Basis Data' })).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(2);
    const badges = [...document.querySelectorAll('.badge')].map((el) => el.textContent);
    expect(badges).toEqual(['Sedang Dibaca', 'Selesai']);
  });

  it('empty state ketika belum ada data', async () => {
    api.listBooks.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Belum ada buku')).toBeInTheDocument();
  });

  it('pesan kosong khusus muncul bila filter tidak menemukan buku', async () => {
    api.listBooks.mockResolvedValueOnce([book()]).mockResolvedValue([]);
    renderPage();
    await screen.findByRole('link', { name: 'Laskar Pelangi' });
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'selesai');
    expect(await screen.findByText('Tidak ada buku yang cocok')).toBeInTheDocument();
    expect(screen.getByText('Ubah kata kunci atau filter pencarian.')).toBeInTheDocument();
    // hanya tautan di toolbar; tombol "Tambah Buku" pada empty state disembunyikan saat sedang memfilter
    expect(screen.getAllByRole('link', { name: 'Tambah Buku' })).toHaveLength(1);
  });

  it('filter kategori terurut abjad dan diteruskan ke API', async () => {
    api.listBooks.mockResolvedValue([
      book({ category: 'Teknologi' }),
      book({ id: 2, title: 'Basis Data', category: 'Fiksi' }),
      book({ id: 3, title: 'Tanpa Kategori', category: null }),
    ]);
    renderPage();
    await screen.findByRole('link', { name: 'Basis Data' });
    const options = [...screen.getByLabelText('Kategori').querySelectorAll('option')].map((o) => o.textContent);
    expect(options).toEqual(['Semua', 'Fiksi', 'Teknologi']);
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Teknologi');
    await waitFor(() => expect(api.listBooks).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'Teknologi' })));
  });

  it('error state ketika API gagal', async () => {
    api.listBooks.mockRejectedValue(new Error('Tidak dapat terhubung ke server'));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Tidak dapat terhubung ke server');
  });

  it('pencarian dan filter status diteruskan sebagai parameter ke API', async () => {
    api.listBooks.mockResolvedValue([book()]);
    renderPage();
    await screen.findByRole('link', { name: 'Laskar Pelangi' });
    await userEvent.type(screen.getByLabelText(/cari judul/i), 'laskar');
    await waitFor(() => expect(api.listBooks).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'laskar' })));
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'selesai');
    await waitFor(() => expect(api.listBooks).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'laskar', status: 'selesai' })));
  });

  it('dapat berpindah tampilan kartu/daftar', async () => {
    api.listBooks.mockResolvedValue([book()]);
    renderPage();
    await screen.findByRole('link', { name: 'Laskar Pelangi' });
    await userEvent.click(screen.getByRole('button', { name: /tampilan daftar/i }));
    expect(screen.getByRole('button', { name: /tampilan daftar/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: 'Laskar Pelangi' })).toBeInTheDocument();
  });

  it('meminta konfirmasi sebelum menghapus, lalu memanggil API', async () => {
    api.listBooks.mockResolvedValue([book()]);
    api.deleteBook.mockResolvedValue(null);
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /hapus laskar pelangi/i }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Laskar Pelangi');
    expect(api.deleteBook).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    await waitFor(() => expect(api.deleteBook).toHaveBeenCalledWith(1));
  });
});

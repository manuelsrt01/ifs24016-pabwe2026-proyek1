import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookFormPage from '../pages/BookFormPage.jsx';
import { api } from '../services/api.js';
import { makeBook, renderWithProviders } from '../test-utils.jsx';

vi.mock('../services/api.js', () => ({
  api: { getBook: vi.fn(), listBooks: vi.fn(), createBook: vi.fn(), updateBook: vi.fn() },
}));

const renderNew = () => renderWithProviders(<BookFormPage />, { route: '/books/new', path: '/books/new' });
const renderEdit = () => renderWithProviders(<BookFormPage />, { route: '/books/5/edit', path: '/books/:id/edit' });

describe('BookFormPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.listBooks.mockResolvedValue([makeBook()]);
  });

  it('menambah buku baru lalu membuka halaman detailnya', async () => {
    api.createBook.mockResolvedValue({ id: 9 });
    const { appValue } = renderNew();
    expect(await screen.findByRole('heading', { name: 'Tambah Buku' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/judul buku/i), 'Buku Baru');
    await userEvent.type(screen.getByLabelText(/penulis/i), 'Penulis Baru');
    await userEvent.type(screen.getByLabelText(/total halaman/i), '200');
    await userEvent.click(screen.getByRole('button', { name: 'Tambah Buku' }));
    await waitFor(() => expect(api.createBook).toHaveBeenCalledWith(expect.objectContaining({ title: 'Buku Baru', total_pages: 200 })));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/books/9'));
    expect(appValue.bump).toHaveBeenCalled();
  });

  it('menampilkan pesan bila penyimpanan gagal', async () => {
    api.createBook.mockRejectedValue(new Error('Gagal menyimpan'));
    renderNew();
    await userEvent.type(await screen.findByLabelText(/judul buku/i), 'Buku');
    await userEvent.type(screen.getByLabelText(/penulis/i), 'Penulis');
    await userEvent.type(screen.getByLabelText(/total halaman/i), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Tambah Buku' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal menyimpan');
  });

  it('Batal pada form baru kembali ke koleksi', async () => {
    renderNew();
    await userEvent.click(await screen.findByRole('button', { name: 'Batal' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/books');
  });

  it('mengedit buku: form terisi data dan perubahan dikirim ke API', async () => {
    api.getBook.mockResolvedValue(makeBook({ id: 5 }));
    api.updateBook.mockResolvedValue({ id: 5 });
    renderEdit();
    expect(await screen.findByRole('heading', { name: 'Edit Buku' })).toBeInTheDocument();
    expect(screen.getByLabelText(/judul buku/i)).toHaveValue('Atomic Habits');
    await userEvent.clear(screen.getByLabelText(/judul buku/i));
    await userEvent.type(screen.getByLabelText(/judul buku/i), 'Judul Baru');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));
    await waitFor(() => expect(api.updateBook).toHaveBeenCalledWith('5', expect.objectContaining({ title: 'Judul Baru', current_page: 215 })));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/books/5'));
  });

  it('Batal pada form edit kembali ke detail buku', async () => {
    api.getBook.mockResolvedValue(makeBook({ id: 5 }));
    renderEdit();
    await userEvent.click(await screen.findByRole('button', { name: 'Batal' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/books/5');
  });

  it('error saat memuat buku untuk diedit', async () => {
    api.getBook.mockRejectedValue(new Error('Buku tidak ditemukan'));
    renderEdit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Buku tidak ditemukan');
  });
});

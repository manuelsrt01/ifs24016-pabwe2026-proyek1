import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BookForm from '../components/BookForm.jsx';
import ReadingLogForm from '../components/ReadingLogForm.jsx';
import InlineSaveForm from '../components/settings/InlineSaveForm.jsx';
import { emptyBookValues } from '../utils/bookMapper.js';

const fillBook = async (title = 'Buku Baru', total = '250') => {
  await userEvent.type(screen.getByLabelText(/judul buku/i), title);
  await userEvent.type(screen.getByLabelText(/penulis/i), 'Penulis Baru');
  await userEvent.type(screen.getByLabelText(/total halaman/i), total);
};

describe('BookForm', () => {
  it('menampilkan pesan validasi dan tidak memanggil onSubmit bila form kosong', async () => {
    const onSubmit = vi.fn();
    render(<BookForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(await screen.findByText('Judul wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Penulis wajib diisi')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('mengirim payload bertipe angka bila valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    render(<BookForm onSubmit={onSubmit} categories={['Fiksi']} />);
    await fillBook();
    await userEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'Buku Baru', author: 'Penulis Baru', total_pages: 250, current_page: 0, status: 'belum_dibaca',
    });
  });

  it('status selesai mengisi halaman terakhir otomatis dan menampilkan tanggal selesai', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    render(<BookForm onSubmit={onSubmit} />);
    await fillBook('Tamat', '120');
    await userEvent.selectOptions(screen.getByLabelText(/status membaca/i), 'selesai');
    expect(screen.getByLabelText(/halaman terakhir dibaca/i)).toHaveValue(120);
    expect(screen.getByLabelText(/halaman terakhir dibaca/i)).toBeDisabled();
    expect(screen.getByLabelText(/tanggal selesai/i)).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText(/total halaman/i));
    await userEvent.type(screen.getByLabelText(/total halaman/i), '130');
    expect(screen.getByLabelText(/halaman terakhir dibaca/i)).toHaveValue(130);
    await userEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ status: 'selesai', current_page: 130, total_pages: 130 });
  });

  it('status belum dibaca mereset progres dan menyembunyikan tanggal selesai', async () => {
    render(<BookForm onSubmit={vi.fn()} initial={{ ...emptyBookValues(), status: 'sedang_dibaca', current_page: '40', total_pages: '100', title: 'A', author: 'B' }} />);
    expect(screen.getByLabelText(/halaman terakhir dibaca/i)).toBeEnabled();
    await userEvent.selectOptions(screen.getByLabelText(/status membaca/i), 'belum_dibaca');
    expect(screen.getByLabelText(/halaman terakhir dibaca/i)).toHaveValue(0);
    expect(screen.queryByLabelText(/tanggal selesai/i)).toBeNull();
  });

  it('menampilkan error dari server pada field terkait dan pesan umum', async () => {
    const err = Object.assign(new Error('Data yang dikirim tidak valid'), { details: { title: 'Judul sudah dipakai' } });
    const onSubmit = vi.fn().mockRejectedValue(err);
    render(<BookForm onSubmit={onSubmit} initial={{ ...emptyBookValues(), title: 'X', author: 'Y', total_pages: '10' }} />);
    await userEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(await screen.findByText('Judul sudah dipakai')).toBeInTheDocument();
    expect(screen.getByText('Data yang dikirim tidak valid')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /simpan/i })).toBeEnabled();
  });

  it('kategori dan catatan yang diketik ikut terkirim', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    render(<BookForm onSubmit={onSubmit} categories={['Fiksi', 'Sains']} />);
    await fillBook();
    await userEvent.type(screen.getByLabelText(/kategori/i), 'Fiksi');
    await userEvent.type(screen.getByLabelText(/catatan singkat/i), 'Seru sekali');
    await userEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ category: 'Fiksi', notes: 'Seru sekali' });
  });

  it('memakai pesan umum bila error penyimpanan tidak punya pesan', async () => {
    const onSubmit = vi.fn().mockRejectedValue({});
    render(<BookForm onSubmit={onSubmit} initial={{ ...emptyBookValues(), title: 'X', author: 'Y', total_pages: '10' }} />);
    await userEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal menyimpan data');
    expect(screen.getByRole('button', { name: /simpan/i })).toBeEnabled();
  });

  it('tombol Batal memanggil onCancel', async () => {
    const onCancel = vi.fn();
    render(<BookForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('ReadingLogForm', () => {
  const books = [
    { id: 1, title: 'Atomic Habits', total_pages: 320, current_page: 215 },
    { id: 2, title: 'Dune', total_pages: 680, current_page: 0 },
  ];
  const renderForm = (props = {}) => render(<ReadingLogForm books={books} onSubmit={vi.fn()} onCancel={vi.fn()} {...props} />);

  it('menampilkan pilihan buku dengan progres dan mengisi halaman awal dari progres buku', async () => {
    renderForm();
    expect(screen.getByRole('option', { name: 'Atomic Habits (Hal 215/320)' })).toBeInTheDocument();
    expect(screen.getByLabelText(/dari halaman/i)).toHaveValue(215);
    await userEvent.selectOptions(screen.getByLabelText(/pilih buku/i), '2');
    expect(screen.getByLabelText(/dari halaman/i)).toHaveValue(0);
  });

  it('memilih buku awal dari initialBookId', () => {
    renderForm({ initialBookId: 2 });
    expect(screen.getByLabelText(/pilih buku/i)).toHaveValue('2');
  });

  it('menolak halaman akhir lebih kecil dari halaman awal', async () => {
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await userEvent.type(screen.getByLabelText(/sampai halaman/i), '100');
    await userEvent.click(screen.getByRole('button', { name: /simpan aktivitas/i }));
    expect(await screen.findByText(/tidak boleh lebih kecil/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('mengirim payload bertipe angka dan catatan ter-trim', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    renderForm({ initialBookId: 1, onSubmit });
    await userEvent.type(screen.getByLabelText(/sampai halaman/i), '240');
    await userEvent.type(screen.getByLabelText(/catatan/i), '  bagus ');
    await userEvent.click(screen.getByRole('button', { name: /simpan aktivitas/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      book_id: 1, start_page: 215, end_page: 240, duration_minutes: 30, notes: 'bagus',
    }));
  });

  it('menampilkan error dari server', async () => {
    const err = Object.assign(new Error('Gagal simpan'), { details: { end_page: 'Melebihi total' } });
    renderForm({ initialBookId: 1, onSubmit: vi.fn().mockRejectedValue(err) });
    await userEvent.type(screen.getByLabelText(/sampai halaman/i), '240');
    await userEvent.click(screen.getByRole('button', { name: /simpan aktivitas/i }));
    expect(await screen.findByText('Melebihi total')).toBeInTheDocument();
    expect(screen.getByText('Gagal simpan')).toBeInTheDocument();
  });

  it('memakai pesan umum bila error penyimpanan tidak punya pesan', async () => {
    renderForm({ initialBookId: 1, onSubmit: vi.fn().mockRejectedValue({}) });
    await userEvent.type(screen.getByLabelText(/sampai halaman/i), '240');
    await userEvent.click(screen.getByRole('button', { name: /simpan aktivitas/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal menyimpan aktivitas');
    expect(screen.getByRole('button', { name: /simpan aktivitas/i })).toBeEnabled();
  });

  it('mengosongkan halaman awal bila buku yang dipilih tidak ditemukan', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/pilih buku/i), { target: { value: '999' } });
    expect(screen.getByLabelText(/dari halaman/i)).toHaveValue(null);
    expect(screen.getByLabelText(/sampai halaman/i).placeholder).toBe('');
  });

  it('tetap dapat dirender saat daftar buku kosong', () => {
    renderForm({ books: [] });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByLabelText(/dari halaman/i)).toHaveValue(null);
    expect(screen.getByLabelText(/sampai halaman/i).placeholder).toBe('');
  });

  it('catatan log yang null ditampilkan sebagai kolom kosong pada mode edit', () => {
    const log = { id: 9, book_id: 1, log_date: '2026-10-20', start_page: 0, end_page: 10, duration_minutes: 15, notes: null };
    renderForm({ log });
    expect(screen.getByLabelText(/catatan/i)).toHaveValue('');
  });

  it('mode edit mengunci pilihan buku dan mengisi nilai log', () => {
    const log = { id: 9, book_id: 2, log_date: '2026-10-20', start_page: 0, end_page: 10, duration_minutes: 15, notes: 'x' };
    renderForm({ log });
    expect(screen.getByLabelText(/pilih buku/i)).toBeDisabled();
    expect(screen.getByLabelText(/sampai halaman/i)).toHaveValue(10);
    expect(screen.getByLabelText(/catatan/i)).toHaveValue('x');
  });

  it('tombol Batal memanggil onCancel', async () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('InlineSaveForm', () => {
  it('menampilkan input, petunjuk, error, dan memanggil onSave/onChange', async () => {
    const onChange = vi.fn();
    const onSave = vi.fn();
    render(<InlineSaveForm id="x" label="Nama" value="Budi" onChange={onChange} onSave={onSave} saving={false} error="Salah" hint="Petunjuk" buttonLabel="Simpan Nama" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Salah');
    expect(screen.getByText('Petunjuk')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Nama'), '!');
    expect(onChange).toHaveBeenCalledWith('Budi!');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Nama' }));
    expect(onSave).toHaveBeenCalled();
  });

  it('tombol dinonaktifkan saat menyimpan', () => {
    render(<InlineSaveForm id="x" label="Nama" value="" onChange={vi.fn()} onSave={vi.fn()} saving buttonLabel="Simpan" />);
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeDisabled();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

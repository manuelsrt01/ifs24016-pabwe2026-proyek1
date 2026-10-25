import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LogModal from '../components/LogModal.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppDataProvider, useAppData } from '../contexts/AppDataContext.jsx';
import { AuthProvider, useAuth } from '../contexts/AuthContext.jsx';
import { api, setUnauthorizedHandler } from '../services/api.js';
import { makeBook, makeLog, makeUser } from '../test-utils.jsx';

vi.mock('../services/api.js', () => ({
  api: {
    me: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn(),
    listBooks: vi.fn(), createLog: vi.fn(), updateLog: vi.fn(),
  },
  setUnauthorizedHandler: vi.fn(),
}));

describe('nilai bawaan context (tanpa provider)', () => {
  it('useAuth: status loading dan semua aksi bawaan tidak melakukan apa-apa', async () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toMatchObject({ status: 'loading', user: null });
    await expect(result.current.login({})).resolves.toBeUndefined();
    await expect(result.current.register({})).resolves.toBeUndefined();
    await expect(result.current.logout()).resolves.toBeUndefined();
    expect(result.current.setUser({})).toBeUndefined();
  });

  it('useAppData: version 0 dan aksi bawaan tidak melakukan apa-apa', () => {
    const { result } = renderHook(() => useAppData());
    expect(result.current.version).toBe(0);
    expect(result.current.openLogModal()).toBeUndefined();
    expect(result.current.bump()).toBeUndefined();
  });
});

describe('AuthProvider', () => {
  function Probe() {
    const { status, user, login, register, logout, setUser } = useAuth();
    return (
      <div>
        <span data-testid="status">{status}</span>
        <span data-testid="name">{user?.name ?? '-'}</span>
        <button type="button" onClick={() => login({ email: 'a' })}>login</button>
        <button type="button" onClick={() => register({ name: 'Baru' })}>register</button>
        <button type="button" onClick={() => logout()}>logout</button>
        <button type="button" onClick={() => setUser(makeUser({ name: 'Ganti' }))}>setuser</button>
      </div>
    );
  }
  const renderProbe = () => render(<AuthProvider><Probe /></AuthProvider>);

  beforeEach(() => vi.resetAllMocks());

  it('sesi valid: status authed dengan data pengguna', async () => {
    api.me.mockResolvedValue(makeUser());
    renderProbe();
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authed'));
    expect(screen.getByTestId('name')).toHaveTextContent('Budi Santoso');
  });

  it('tanpa sesi: status guest', async () => {
    api.me.mockRejectedValue(new Error('401'));
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('guest'));
  });

  it('login, register, setUser, dan logout memperbarui state', async () => {
    api.me.mockRejectedValue(new Error('401'));
    api.login.mockResolvedValue(makeUser({ name: 'Login' }));
    api.register.mockResolvedValue(makeUser({ name: 'Daftar' }));
    api.logout.mockResolvedValue(null);
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('guest'));
    await userEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Login'));
    await userEvent.click(screen.getByText('register'));
    await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Daftar'));
    await userEvent.click(screen.getByText('setuser'));
    expect(screen.getByTestId('name')).toHaveTextContent('Ganti');
    await userEvent.click(screen.getByText('logout'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('guest'));
    expect(screen.getByTestId('name')).toHaveTextContent('-');
  });

  it('handler sesi habis mengembalikan status ke guest', async () => {
    api.me.mockResolvedValue(makeUser());
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authed'));
    const handler = setUnauthorizedHandler.mock.calls[0][0];
    act(() => handler());
    expect(screen.getByTestId('status')).toHaveTextContent('guest');
  });
});

describe('LogModal', () => {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  const renderModal = (props = {}) => render(
    <MemoryRouter><ToastProvider><LogModal bookId={null} log={null} onClose={onClose} onSaved={onSaved} {...props} /></ToastProvider></MemoryRouter>,
  );

  beforeEach(() => {
    vi.resetAllMocks();
    api.listBooks.mockResolvedValue([makeBook()]);
  });

  it('memuat daftar buku lalu menyimpan aktivitas baru', async () => {
    api.createLog.mockResolvedValue(makeLog());
    renderModal({ bookId: 1 });
    expect(screen.getByRole('status')).toHaveTextContent(/memuat/i);
    await userEvent.type(await screen.findByLabelText(/sampai halaman/i), '240');
    await userEvent.click(screen.getByRole('button', { name: /simpan aktivitas/i }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(api.createLog).toHaveBeenCalledWith(expect.objectContaining({ book_id: 1, start_page: 215, end_page: 240 }));
    expect(screen.getByRole('dialog', { name: 'Catat Aktivitas Membaca' })).toBeInTheDocument();
  });

  it('mode edit memanggil updateLog', async () => {
    api.updateLog.mockResolvedValue(makeLog());
    renderModal({ log: makeLog({ id: 7 }) });
    expect(await screen.findByRole('dialog', { name: 'Edit Aktivitas Membaca' })).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: /simpan aktivitas/i }));
    await waitFor(() => expect(api.updateLog).toHaveBeenCalledWith(7, expect.objectContaining({ end_page: 215 })));
    expect(onSaved).toHaveBeenCalled();
  });

  it('menawarkan tambah buku bila koleksi kosong', async () => {
    api.listBooks.mockResolvedValue([]);
    renderModal();
    expect(await screen.findByText(/belum ada buku/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Tambah Buku' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('menampilkan error dan dapat mencoba lagi', async () => {
    api.listBooks.mockRejectedValueOnce(new Error('Gagal muat buku')).mockResolvedValueOnce([makeBook()]);
    renderModal();
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal muat buku');
    await userEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(await screen.findByLabelText(/pilih buku/i)).toBeInTheDocument();
  });

  it('ditutup dengan tombol Tutup, tombol Escape, atau klik di luar dialog', async () => {
    renderModal();
    await screen.findByLabelText(/pilih buku/i);
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.mouseDown(screen.getByRole('presentation'));
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

describe('AppDataProvider', () => {
  function Consumer() {
    const { version, openLogModal, bump } = useAppData();
    return (
      <div>
        <span data-testid="version">{version}</span>
        <button type="button" onClick={() => openLogModal({ bookId: 1 })}>buka</button>
        <button type="button" onClick={bump}>bump</button>
      </div>
    );
  }
  const renderProvider = () => render(
    <MemoryRouter><ToastProvider><AppDataProvider><Consumer /></AppDataProvider></ToastProvider></MemoryRouter>,
  );

  beforeEach(() => {
    vi.resetAllMocks();
    api.listBooks.mockResolvedValue([makeBook()]);
  });

  it('bump menaikkan version', async () => {
    renderProvider();
    await userEvent.click(screen.getByText('bump'));
    expect(screen.getByTestId('version')).toHaveTextContent('1');
  });

  it('membuka modal dari mana saja, lalu menutup dan menaikkan version setelah disimpan', async () => {
    api.createLog.mockResolvedValue(makeLog());
    renderProvider();
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByText('buka'));
    await userEvent.type(await screen.findByLabelText(/sampai halaman/i), '240');
    await userEvent.click(screen.getByRole('button', { name: /simpan aktivitas/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByTestId('version')).toHaveTextContent('1');
  });

  it('modal dapat ditutup tanpa menyimpan', async () => {
    renderProvider();
    await userEvent.click(screen.getByText('buka'));
    await userEvent.click(await screen.findByRole('button', { name: 'Tutup' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByTestId('version')).toHaveTextContent('0');
  });
});

import { act, renderHook, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../components/Toast.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDeleteFlow } from '../hooks/useDeleteFlow.js';

describe('useAsync', () => {
  it('memuat data lalu selesai', async () => {
    const fn = vi.fn().mockResolvedValue('hasil');
    const { result } = renderHook(() => useAsync(fn, []));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ data: 'hasil', error: null });
  });

  it('menyimpan error bila gagal', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject(new Error('gagal')), []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error.message).toBe('gagal');
    expect(result.current.data).toBeNull();
  });

  it('reload memanggil fungsi lagi', async () => {
    const fn = vi.fn().mockResolvedValue(1);
    const { result } = renderHook(() => useAsync(fn, []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.reload());
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(2));
  });

  it('memuat ulang saat dependency berubah dan mengabaikan hasil yang kedaluwarsa', async () => {
    let resolveFirst;
    const fn = vi.fn((id) => (id === 1 ? new Promise((r) => { resolveFirst = r; }) : Promise.resolve('dua')));
    const { result, rerender } = renderHook(({ id }) => useAsync(() => fn(id), [id]), { initialProps: { id: 1 } });
    rerender({ id: 2 });
    await waitFor(() => expect(result.current.data).toBe('dua'));
    await act(async () => resolveFirst('satu'));
    expect(result.current.data).toBe('dua');
  });
});

describe('useDeleteFlow', () => {
  const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
  const setup = (overrides = {}) => {
    const props = { remove: vi.fn().mockResolvedValue(), successMessage: (item) => `hapus ${item.id}`, onDeleted: vi.fn(), ...overrides };
    return { props, ...renderHook(() => useDeleteFlow(props), { wrapper }) };
  };

  it('request lalu confirm menghapus item, menampilkan notifikasi, dan memanggil onDeleted', async () => {
    const { props, result } = setup();
    act(() => result.current.request({ id: 1 }));
    expect(result.current.target).toEqual({ id: 1 });
    await act(async () => result.current.confirm());
    expect(props.remove).toHaveBeenCalledWith({ id: 1 });
    expect(props.onDeleted).toHaveBeenCalledWith({ id: 1 });
    expect(result.current.target).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('hapus 1');
  });

  it('gagal: target dipertahankan dan notifikasi error muncul', async () => {
    const { props, result } = setup({ remove: vi.fn().mockRejectedValue(new Error('Server error')) });
    act(() => result.current.request({ id: 2 }));
    await act(async () => result.current.confirm());
    expect(props.onDeleted).not.toHaveBeenCalled();
    expect(result.current.target).toEqual({ id: 2 });
    expect(result.current.busy).toBe(false);
    expect(screen.getByRole('status')).toHaveTextContent('Server error');
  });

  it('cancel menutup dialog; confirm tanpa target tidak memanggil remove', async () => {
    const { props, result } = setup();
    await act(async () => result.current.confirm());
    expect(props.remove).not.toHaveBeenCalled();
    act(() => result.current.request({ id: 3 }));
    act(() => result.current.cancel());
    expect(result.current.target).toBeNull();
  });
});

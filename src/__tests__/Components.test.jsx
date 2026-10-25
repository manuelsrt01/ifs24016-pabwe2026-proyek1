import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ActivityChart from '../components/ActivityChart.jsx';
import BookCard from '../components/BookCard.jsx';
import BookCover from '../components/BookCover.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import HeroBanner from '../components/dashboard/HeroBanner.jsx';
import Icon from '../components/Icon.jsx';
import LogsTable from '../components/LogsTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SegmentedControl from '../components/SegmentedControl.jsx';
import StatCard from '../components/StatCard.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { ToastProvider, useToast } from '../components/Toast.jsx';
import WeekBars from '../components/WeekBars.jsx';
import { makeBook, makeLog } from '../test-utils.jsx';

vi.mock('recharts', async () => {
  const React = await import('react');
  const h = React.createElement;
  return {
    ResponsiveContainer: ({ children }) => h('div', null, children),
    BarChart: ({ children }) => h('div', { 'data-testid': 'barchart' }, children),
    Bar: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: ({ formatter, labelFormatter }) => h('span', { 'data-testid': 'tip' }, `${formatter(5, 'minutes')}|${formatter(7, 'pages')}|${labelFormatter('Lbl')}`),
  };
});

const inRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('komponen presentasi', () => {
  it('BookCover menampilkan kategori dan judul; kategori kosong memakai "Buku"; warna stabil per judul', () => {
    const { container, rerender } = render(<BookCover title="Dune" category="Fiksi" />);
    expect(screen.getByText('Fiksi')).toBeInTheDocument();
    expect(screen.getByText('Dune')).toBeInTheDocument();
    const style = container.firstChild.getAttribute('style');
    rerender(<BookCover title="Dune" category="" size="lg" />);
    expect(screen.getByText('Buku')).toBeInTheDocument();
    expect(container.firstChild.getAttribute('style')).toBe(style);
  });

  it('BookCover tetap tampil bila judul tidak diberikan', () => {
    render(<BookCover category="Fiksi" />);
    expect(screen.getByText('Fiksi')).toBeInTheDocument();
  });

  it('HeroBanner menampilkan target harian dan memanggil onLog saat tombol ditekan', async () => {
    const onLog = vi.fn();
    inRouter(<HeroBanner goal={30} onLog={onLog} />);
    expect(screen.getByText(/Target Harian: 30 Halaman/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat Pustaka' })).toHaveAttribute('href', '/books');
    await userEvent.click(screen.getByRole('button', { name: /catat aktivitas/i }));
    expect(onLog).toHaveBeenCalledTimes(1);
  });

  it('StatCard menampilkan label, nilai, petunjuk, dan ikon opsional', () => {
    const { container, rerender } = render(<StatCard label="Total" value="6" hint="info" icon="library" valueTone="amber" />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('6')).toHaveClass('value-amber');
    expect(container.querySelector('svg')).not.toBeNull();
    rerender(<StatCard label="Tanpa" value="1" />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('ProgressBar menghitung persen, membatasi 100%, dan aman bila total 0', () => {
    const { rerender } = render(<ProgressBar current={50} total={200} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    rerender(<ProgressBar current={500} total={200} tone="teal" label="Target" />);
    expect(screen.getByRole('progressbar', { name: 'Target' })).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar current={5} total={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('StatusBadge memakai label Indonesia dan fallback ke nilai mentah', () => {
    const { rerender } = render(<StatusBadge status="selesai" />);
    expect(screen.getByText('Selesai')).toHaveClass('badge-selesai');
    rerender(<StatusBadge status="aneh" />);
    expect(screen.getByText('aneh')).toBeInTheDocument();
  });

  it('LoadingState, ErrorState, dan EmptyState', async () => {
    const retry = vi.fn();
    const { rerender } = render(<LoadingState />);
    expect(screen.getByRole('status')).toHaveTextContent('Memuat data…');
    rerender(<ErrorState error={new Error('Gagal muat')} onRetry={retry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Gagal muat');
    await userEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(retry).toHaveBeenCalled();
    rerender(<ErrorState />);
    expect(screen.getByRole('alert')).toHaveTextContent('Data tidak dapat dimuat.');
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<EmptyState title="Kosong" text="Isi dulu" action={<button type="button">Aksi</button>} />);
    expect(screen.getByText('Kosong')).toBeInTheDocument();
    expect(screen.getByText('Isi dulu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aksi' })).toBeInTheDocument();
  });

  it('ConfirmDialog memanggil konfirmasi/batal, menutup lewat overlay, dan menonaktifkan tombol saat sibuk', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { rerender } = render(<ConfirmDialog title="Hapus?" message="Yakin?" onConfirm={onConfirm} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(onConfirm).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('presentation'));
    expect(onCancel).toHaveBeenCalledTimes(2);
    rerender(<ConfirmDialog title="Hapus?" message="Yakin?" busy onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByRole('button', { name: 'Menghapus…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Batal' })).toBeDisabled();
  });

  it('WeekBars menampilkan hari dan tinggi relatif', () => {
    const days = [{ date: '2026-10-21', pages: 10 }, { date: '2026-10-22', pages: 20 }];
    const { container } = render(<WeekBars days={days} />);
    expect(screen.getByText('Rab')).toBeInTheDocument();
    expect(screen.getByText('Kam')).toBeInTheDocument();
    const fills = container.querySelectorAll('.weekbar-fill');
    expect(fills[0]).toHaveStyle({ height: '50%' });
    expect(fills[1]).toHaveStyle({ height: '100%' });
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Halaman dibaca per hari, total 30 halaman');
  });

  it('PageHeader menampilkan judul, subjudul, dan tanggal hari ini', () => {
    render(<PageHeader title="Judul" subtitle="Sub" />);
    expect(screen.getByRole('heading', { name: 'Judul' })).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
    expect(screen.getByText(String(new Date().getFullYear()), { exact: false })).toBeInTheDocument();
  });

  it('Icon merender svg, juga untuk nama yang tidak dikenal', () => {
    const { container, rerender } = render(<Icon name="plus" size={30} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '30');
    rerender(<Icon name="tidak-ada" />);
    expect(container.querySelector('path')).not.toBeNull();
  });

  it('SegmentedControl menandai pilihan aktif dan memanggil onChange', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Periode" value="a" onChange={onChange} textual options={[{ value: 'a', content: 'A' }, { value: 'b', content: 'B', ariaLabel: 'Bee' }]} />);
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Bee' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('ActivityChart menampilkan label sesuai metrik dan memformat tooltip', () => {
    const days = [{ date: '2026-10-22', pages: 5, minutes: 30 }];
    const { rerender } = render(<ActivityChart days={days} metric="pages" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Grafik halaman dibaca per hari');
    expect(screen.getByTestId('tip')).toHaveTextContent('5 mnt|7 hlm|Lbl');
    rerender(<ActivityChart days={days} metric="minutes" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Grafik menit dibaca per hari');
  });
});

describe('Toast', () => {
  function Trigger() {
    const { notify } = useToast();
    return <button type="button" onClick={() => notify('Halo', 'error')}>go</button>;
  }

  it('menampilkan notifikasi lalu menghilang setelah 4 detik', () => {
    vi.useFakeTimers();
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByText('go'));
    expect(screen.getByRole('status')).toHaveTextContent('Halo');
    expect(screen.getByRole('status')).toHaveClass('toast-error');
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.queryByText('Halo')).toBeNull();
    vi.useRealTimers();
  });

  it('useToast di luar provider memakai notify bawaan yang tidak melakukan apa-apa', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.notify('Halo')).toBeUndefined();
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('LogsTable', () => {
  it('menampilkan baris log dengan kolom buku dan memanggil aksi edit/hapus', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const log = makeLog({ notes: null });
    inRouter(<LogsTable logs={[log]} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByRole('link', { name: 'Atomic Habits' })).toHaveAttribute('href', '/books/1');
    expect(screen.getByText('Hal 190 - 215')).toBeInTheDocument();
    expect(screen.getByText('+25')).toBeInTheDocument();
    expect(screen.getByText('45 mnt')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Edit aktivitas 2026-10-22' }));
    await userEvent.click(screen.getByRole('button', { name: 'Hapus aktivitas 2026-10-22' }));
    expect(onEdit).toHaveBeenCalledWith(log);
    expect(onDelete).toHaveBeenCalledWith(log);
  });

  it('dapat menyembunyikan kolom buku', () => {
    inRouter(<LogsTable logs={[makeLog()]} showBook={false} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByRole('columnheader', { name: 'Buku' })).toBeNull();
    expect(screen.getByText('Catatan bab satu')).toBeInTheDocument();
  });
});

describe('BookCard', () => {
  it('tampilan kartu: tautan, progres, dan aksi hapus', async () => {
    const onDelete = vi.fn();
    const book = makeBook();
    inRouter(<BookCard book={book} onDelete={onDelete} />);
    expect(screen.getByRole('link', { name: 'Atomic Habits' })).toHaveAttribute('href', '/books/1');
    expect(screen.getByRole('link', { name: 'Edit Atomic Habits' })).toHaveAttribute('href', '/books/1/edit');
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('215 / 320 hal')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveClass('bar-forest');
    await userEvent.click(screen.getByRole('button', { name: 'Hapus Atomic Habits' }));
    expect(onDelete).toHaveBeenCalledWith(book);
  });

  it('tampilan daftar dan warna progres selesai', () => {
    const { container } = inRouter(<BookCard book={makeBook({ status: 'selesai', current_page: 320, progress_percent: 100, category: null })} layout="list" onDelete={vi.fn()} />);
    expect(container.querySelector('.book-row')).not.toBeNull();
    expect(screen.getByRole('progressbar')).toHaveClass('bar-teal');
    expect(screen.getByText('100% · 320 / 320 hal')).toBeInTheDocument();
  });
});

import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Icon from '../components/Icon.jsx';
import LogsTable from '../components/LogsTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx';
import { useAppData } from '../contexts/AppDataContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDeleteFlow } from '../hooks/useDeleteFlow.js';
import { api } from '../services/api.js';
import { formatDate } from '../utils/format.js';

const PAGE_SIZE = 15;
const removeLog = (log) => api.deleteLog(log.id);
const deletedMessage = () => 'Aktivitas dihapus';

export default function ActivitiesPage() {
  const { version, bump, openLogModal } = useAppData();
  const [page, setPage] = useState(0);

  const { data, loading, error, reload } = useAsync(
    () => api.listLogs({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
    [page, version],
  );

  const afterDelete = () => {
    // Bila yang dihapus adalah satu-satunya baris di halaman terakhir, mundur satu halaman.
    if (data.data.length === 1 && page > 0) setPage(page - 1);
    bump();
  };
  const deletion = useDeleteFlow({ remove: removeLog, successMessage: deletedMessage, onDeleted: afterDelete });

  const total = data?.meta?.total ?? 0;
  const firstShown = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const lastShown = Math.min(total, (page + 1) * PAGE_SIZE);

  return (
    <>
      <PageHeader title="Aktivitas Membaca" subtitle="Catatan log waktu dan halaman harian." />

      <div className="card panel-head">
        <div>
          <h2>Riwayat Aktivitas Membaca</h2>
          <p className="muted small">Daftar seluruh sesi membaca yang telah dicatat</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => openLogModal()}><Icon name="plus" size={16} />Catat Aktivitas Baru</button>
      </div>

      {loading && !data && <LoadingState />}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {data && !error && total === 0 && <EmptyState title="Belum ada aktivitas" text="Catat sesi membaca pertama Anda." />}
      {data && !error && total > 0 && (
        <div className="card table-card">
          <LogsTable logs={data.data} onEdit={(log) => openLogModal({ log })} onDelete={deletion.request} />
          <div className="pager">
            <span className="muted small">{`Menampilkan ${firstShown}–${lastShown} dari ${total} aktivitas`}</span>
            <span className="actions">
              <button type="button" className="btn btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Sebelumnya</button>
              <button type="button" className="btn btn-sm" disabled={lastShown >= total} onClick={() => setPage(page + 1)}>Berikutnya</button>
            </span>
          </div>
        </div>
      )}

      {deletion.target && (
        <ConfirmDialog
          title="Hapus aktivitas?"
          message={`Aktivitas "${deletion.target.book_title}" tanggal ${formatDate(deletion.target.log_date)} akan dihapus dan progres buku dihitung ulang.`}
          busy={deletion.busy}
          onConfirm={deletion.confirm}
          onCancel={deletion.cancel}
        />
      )}
    </>
  );
}

import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageHeader from '../components/PageHeader.jsx';
import InlineSaveForm from '../components/settings/InlineSaveForm.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { useToast } from '../components/Toast.jsx';
import { useAppData } from '../contexts/AppDataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../services/api.js';
import { toInt } from '../utils/format.js';

const MAX_GOAL = 10000;

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const { notify } = useToast();
  const { version, bump } = useAppData();
  const [goal, setGoal] = useState(String(user?.daily_goal_pages ?? 30));
  const [name, setName] = useState(user?.name ?? '');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const { data: summary, loading, error, reload } = useAsync(() => api.dashboardSummary(), [version]);

  /** Memvalidasi lalu menyimpan satu bagian profil; mengembalikan pesan error validasi (jika ada). */
  const buildUpdate = (kind) => {
    if (kind === 'goal') {
      const value = toInt(goal);
      const valid = value >= 1 && value <= MAX_GOAL;
      return valid
        ? { body: { daily_goal_pages: value } }
        : { errors: { daily_goal_pages: `Target harian harus bilangan bulat 1–${MAX_GOAL}` } };
    }
    return name.trim() ? { body: { name: name.trim() } } : { errors: { name: 'Nama wajib diisi' } };
  };

  const save = async (kind) => {
    const { body, errors: invalid } = buildUpdate(kind);
    setErrors(invalid ?? {});
    if (invalid) return;
    setSaving(kind);
    try {
      setUser(await api.updateMe(body));
      bump();
      notify(kind === 'goal' ? 'Target harian disimpan' : 'Profil disimpan');
    } catch (err) {
      setErrors(err.details ?? {});
      notify(err.message, 'error');
    } finally {
      setSaving('');
    }
  };

  const reset = async () => {
    setResetting(true);
    try {
      await api.resetMyData();
      notify('Semua data buku dan aktivitas Anda telah dihapus');
      setConfirmReset(false);
      bump();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <PageHeader title="Pengaturan Profile" subtitle="Sesuaikan preferensi aplikasi TanaRead." />
      <div className="settings">
        <section className="card">
          <h2 className="card-title">Target Membaca</h2>
          <InlineSaveForm
            id="goal" label="Target halaman harian" value={goal} onChange={setGoal} onSave={() => save('goal')}
            saving={saving === 'goal'} error={errors.daily_goal_pages} buttonLabel="Simpan Target"
            hint="Target ini digunakan pada indikator progres harian dashboard."
            inputProps={{ type: 'number', min: 1, max: MAX_GOAL }}
          />
        </section>

        <section className="card">
          <h2 className="card-title">Profil Akun</h2>
          <InlineSaveForm
            id="name" label="Nama" value={name} onChange={setName} onSave={() => save('name')}
            saving={saving === 'name'} error={errors.name} buttonLabel="Simpan Nama"
            hint={`Email akun: ${user?.email ?? '-'}`} inputProps={{ maxLength: 80 }}
          />
          <div className="actions"><button type="button" className="btn" onClick={logout}>Keluar dari akun</button></div>
        </section>

        <section className="card">
          <h2 className="card-title">Informasi Penyimpanan Data</h2>
          <p className="small">Data Anda tersimpan di database server (SQLite) dan terhubung dengan akun Anda, sehingga dapat diakses dari perangkat mana pun setelah masuk.</p>
          {loading && !summary && <LoadingState />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {summary && (
            <div className="info-rows">
              <div><span>Jumlah Buku Tersimpan:</span><strong>{`${summary.total_books} Buku`}</strong></div>
              <div><span>Jumlah Log Aktivitas:</span><strong>{`${summary.total_sessions} Log`}</strong></div>
            </div>
          )}
          <button type="button" className="btn btn-danger-soft" onClick={() => setConfirmReset(true)}>Reset Semua Data Ke Semula</button>
        </section>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset semua data?"
          message="Seluruh buku dan reading log milik akun Anda akan dihapus permanen. Akun dan pengaturan target tetap ada. Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Ya, hapus semua"
          busy={resetting}
          onConfirm={reset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </>
  );
}

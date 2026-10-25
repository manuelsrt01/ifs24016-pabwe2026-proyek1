import { useCallback, useState } from 'react';
import { useToast } from '../components/Toast.jsx';

/**
 * Alur "hapus dengan konfirmasi" yang dipakai berbagai halaman.
 * - request(item): menampilkan dialog konfirmasi untuk item
 * - confirm(): memanggil remove(item), menampilkan notifikasi, lalu onDeleted(item)
 */
export function useDeleteFlow({ remove, successMessage, onDeleted }) {
  const { notify } = useToast();
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const cancel = useCallback(() => setTarget(null), []);

  const confirm = useCallback(async () => {
    if (!target) return;
    setBusy(true);
    try {
      await remove(target);
      notify(successMessage(target));
      setTarget(null);
      onDeleted?.(target);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }, [target, remove, successMessage, onDeleted, notify]);

  return { target, request: setTarget, cancel, confirm, busy };
}

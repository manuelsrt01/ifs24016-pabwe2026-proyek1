import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import LogModal from '../components/LogModal.jsx';

/**
 * Berbagi (1) modal "Catat Aktivitas Membaca" yang bisa dibuka dari mana saja dan
 * (2) `version` yang bertambah setiap data berubah, agar halaman memuat ulang datanya.
 */
export const AppDataContext = createContext({ version: 0, openLogModal: () => undefined, bump: () => undefined });

export function AppDataProvider({ children }) {
  const [version, setVersion] = useState(0);
  const [modal, setModal] = useState(null);

  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const openLogModal = useCallback((opts = {}) => setModal({ bookId: opts.bookId ?? null, log: opts.log ?? null }), []);
  const value = useMemo(() => ({ version, openLogModal, bump }), [version, openLogModal, bump]);

  return (
    <AppDataContext.Provider value={value}>
      {children}
      {modal && (
        <LogModal
          bookId={modal.bookId}
          log={modal.log}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            bump();
          }}
        />
      )}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);

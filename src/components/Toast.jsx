import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const TOAST_DURATION_MS = 4000;
const ToastContext = createContext({ notify: () => undefined });

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(0);

  const notify = useCallback((message, type = 'success') => {
    nextId.current += 1;
    const id = nextId.current;
    setItems((list) => [...list, { id, message, type }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export function LoadingState({ text = 'Memuat data…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <p><strong>Terjadi masalah.</strong> {error?.message ?? 'Data tidak dapat dimuat.'}</p>
      {onRetry && <button type="button" className="btn" onClick={onRetry}>Coba lagi</button>}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="state">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

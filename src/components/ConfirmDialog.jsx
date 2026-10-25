export default function ConfirmDialog({ title, message, confirmLabel = 'Hapus', busy = false, onConfirm, onCancel }) {
  return (
    <div className="overlay" role="presentation" onClick={onCancel}>
      <div
        className="dialog card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="dialog-title">{title}</h3>
        <p>{message}</p>
        <div className="actions">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>Batal</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Menghapus…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

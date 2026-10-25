/** Satu input dengan tombol simpan di sampingnya (dipakai di halaman Pengaturan). */
export default function InlineSaveForm({
  id, label, value, onChange, onSave, saving, error, hint, buttonLabel, inputProps = {},
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="label-caps">{label}</label>
      <div className="inline-form">
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} {...inputProps} />
        <button type="button" className="btn btn-primary" disabled={saving} onClick={onSave}>{buttonLabel}</button>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      {hint && <p className="muted small">{hint}</p>}
    </div>
  );
}

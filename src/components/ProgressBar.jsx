export default function ProgressBar({ current, total, tone = 'forest', label }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div
      className={`bar bar-${tone}`}
      role="progressbar"
      aria-label={label ?? 'Progres membaca'}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

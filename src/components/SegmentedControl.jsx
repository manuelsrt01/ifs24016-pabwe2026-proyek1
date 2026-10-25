/** Kontrol segmen (tombol pilihan tunggal). options: [{ value, content, ariaLabel? }] */
export default function SegmentedControl({ label, options, value, onChange, textual = false }) {
  return (
    <div className={`seg${textual ? ' seg-text' : ''}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? 'on' : ''}
          aria-pressed={option.value === value}
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.value)}
        >
          {option.content}
        </button>
      ))}
    </div>
  );
}

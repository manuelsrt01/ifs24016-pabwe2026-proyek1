import { formatShortDate, weekdayShort } from '../utils/format.js';

/** Grafik batang ringan (CSS) untuk 7 hari terakhir. days: [{ date, pages }] */
export default function WeekBars({ days }) {
  const max = Math.max(1, ...days.map((d) => d.pages));
  const total = days.reduce((s, d) => s + d.pages, 0);
  return (
    <div className="weekbars" role="img" aria-label={`Halaman dibaca per hari, total ${total} halaman`}>
      {days.map((d) => (
        <div className="weekbar" key={d.date} title={`${formatShortDate(d.date)}: ${d.pages} halaman`}>
          <div className="weekbar-track">
            <div className="weekbar-fill" style={{ height: `${(d.pages / max) * 100}%` }} />
          </div>
          <span className="weekbar-label">{weekdayShort(d.date)}</span>
        </div>
      ))}
    </div>
  );
}

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMinutes, formatShortDate } from '../utils/format.js';

/** days: [{ date, pages, minutes, sessions }] */
export default function ActivityChart({ days, metric = 'pages' }) {
  const label = metric === 'pages' ? 'Halaman' : 'Menit';
  const data = days.map((d) => ({ ...d, label: formatShortDate(d.date) }));
  return (
    <div className="chart" role="img" aria-label={`Grafik ${label.toLowerCase()} dibaca per hari`}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4dcc8" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => (name === 'minutes' ? formatMinutes(value) : `${value} hlm`)}
            labelFormatter={(l) => l}
          />
          <Bar dataKey={metric} name={metric} fill="#2f6b4f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

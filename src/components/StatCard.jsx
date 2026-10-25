import Icon from './Icon.jsx';

/** tone: green | amber | teal | indigo */
export default function StatCard({ icon, label, value, hint, tone = 'green', valueTone }) {
  return (
    <div className="card stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {icon && <span className={`stat-icon tone-${tone}`}><Icon name={icon} size={18} /></span>}
      </div>
      <div className={`stat-value${valueTone ? ` value-${valueTone}` : ''}`}>{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

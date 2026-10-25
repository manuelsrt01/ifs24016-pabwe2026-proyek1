import Icon from './Icon.jsx';
import { formatToday } from '../utils/format.js';

export default function PageHeader({ title, subtitle }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <span className="date-pill"><Icon name="calendar" size={15} />{formatToday()}</span>
    </header>
  );
}

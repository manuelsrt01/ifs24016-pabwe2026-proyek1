import { formatMinutes } from '../../utils/format.js';
import Icon from '../Icon.jsx';

export default function RecentActivity({ logs }) {
  return (
    <section className="card">
      <h2 className="card-title"><span className="accent"><Icon name="history" size={20} /></span>Aktivitas Terbaru</h2>
      {logs.length === 0 ? (
        <p className="muted small">Belum ada aktivitas. Catat sesi pertama Anda.</p>
      ) : (
        <ul className="recent-list">
          {logs.map((log) => (
            <li key={log.id}>
              <div className="recent-top"><strong>{log.book_title}</strong><span className="muted small">{log.log_date}</span></div>
              <div className="recent-bottom">
                <span className="chip">{`+${log.pages_read} hal (Hal ${log.start_page}-${log.end_page})`}</span>
                <span className="muted small"><Icon name="clock" size={13} /> {formatMinutes(log.duration_minutes)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

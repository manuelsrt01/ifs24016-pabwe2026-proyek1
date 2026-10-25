import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { formatMinutes } from '../utils/format.js';

/** Tabel reading log. showBook: tampilkan kolom judul buku. */
export default function LogsTable({ logs, showBook = true, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            {showBook && <th>Buku</th>}
            <th>Rentang Halaman</th>
            <th>Total Hal</th>
            <th>Durasi</th>
            <th>Catatan</th>
            <th className="th-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="nowrap">{l.log_date}</td>
              {showBook && <td><Link to={`/books/${l.book_id}`} className="plain-link">{l.book_title}</Link></td>}
              <td className="nowrap">Hal {l.start_page} - {l.end_page}</td>
              <td><span className="chip">+{l.pages_read}</span></td>
              <td className="nowrap">{formatMinutes(l.duration_minutes)}</td>
              <td className="muted">{l.notes ?? '-'}</td>
              <td className="row-actions">
                <button type="button" className="icon-btn" onClick={() => onEdit(l)} aria-label={`Edit aktivitas ${l.log_date}`} title="Edit"><Icon name="edit" size={16} /></button>
                <button type="button" className="icon-btn" onClick={() => onDelete(l)} aria-label={`Hapus aktivitas ${l.log_date}`} title="Hapus"><Icon name="trash" size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

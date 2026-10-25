import { NavLink, Outlet } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAppData } from '../contexts/AppDataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { initials } from '../utils/format.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/books', label: 'Koleksi Buku', icon: 'library' },
  { to: '/activities', label: 'Aktivitas Membaca', icon: 'history' },
  { to: '/statistics', label: 'Statistik', icon: 'chart' },
  { to: '/settings', label: 'Pengaturan', icon: 'settings' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { openLogModal } = useAppData();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Icon name="book-open" size={22} /></span>
          <div>
            <div className="brand-name">TanaRead</div>
            <div className="brand-sub">Ruang Baca &amp; Habit Tracker</div>
          </div>
        </div>
        <nav aria-label="Navigasi utama">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon name={n.icon} /><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button type="button" className="btn btn-gold btn-block" onClick={() => openLogModal()}>
            <Icon name="plus" size={18} />Catat Membaca
          </button>
          <div className="user-card">
            <span className="avatar">{initials(user?.name)}</span>
            <div className="user-meta">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button type="button" className="icon-btn on-dark" onClick={logout} aria-label="Keluar" title="Keluar">
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
  );
}

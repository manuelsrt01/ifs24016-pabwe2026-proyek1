import Icon from './Icon.jsx';

/** Kerangka halaman login/registrasi: panel samping bermerek + kartu formulir. */
export default function AuthShell({ title, subtitle, footer, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="brand">
          <span className="brand-mark"><Icon name="book-open" size={22} /></span>
          <div>
            <div className="brand-name">TanaRead</div>
            <div className="brand-sub">Ruang Baca &amp; Habit Tracker</div>
          </div>
        </div>
        <div>
          <h2>Catat setiap halaman, bentuk kebiasaan membacamu.</h2>
          <p>Kelola koleksi buku pribadi, rekam sesi membaca harian, dan pantau konsistensimu lewat statistik yang dihitung dari catatanmu sendiri.</p>
        </div>
        <p className="auth-note">Data tersimpan di akunmu dan hanya dapat dilihat olehmu.</p>
      </aside>
      <main className="auth-main">
        <div className="card auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}

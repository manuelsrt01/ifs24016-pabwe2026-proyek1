import Icon from '../Icon.jsx';
import ProgressBar from '../ProgressBar.jsx';

export default function CategoryDistribution({ categories }) {
  return (
    <section className="card">
      <h2 className="card-title"><Icon name="pie" size={20} />Distribusi Kategori Buku</h2>
      {categories.length === 0 ? (
        <p className="muted small">Belum ada buku di koleksi.</p>
      ) : (
        <ul className="dist-list">
          {categories.map((c) => (
            <li key={c.category}>
              <div className="dist-row"><span>{c.category}</span><span className="muted small">{`${c.books} buku (${c.percent}%)`}</span></div>
              <ProgressBar current={c.percent} total={100} label={`Kategori ${c.category}`} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

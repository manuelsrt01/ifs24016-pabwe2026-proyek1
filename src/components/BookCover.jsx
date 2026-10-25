const PALETTES = [
  ['#0f6a5b', '#0a3f37'],
  ['#b4531a', '#7a3310'],
  ['#3d3430', '#1b1614'],
  ['#9a3c1c', '#5c2410'],
  ['#0f4f5c', '#082f38'],
  ['#1d5a35', '#0c3320'],
];

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/** Sampul buku buatan (CSS): warna ditentukan dari judul, label dari kategori. */
export default function BookCover({ title, category, size = 'md' }) {
  const [a, b] = PALETTES[hash(title ?? '') % PALETTES.length];
  return (
    <div className={`cover cover-${size}`} style={{ background: `linear-gradient(160deg, ${a}, ${b})` }} aria-hidden="true">
      <span className="cover-cat">{category || 'Buku'}</span>
      <span className="cover-title">{title}</span>
    </div>
  );
}

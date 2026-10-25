# TanaRead – Pelacak Kebiasaan Membaca (Front-end)

Repository **front-end** (React 18 + Vite, React Router, Recharts) untuk Proyek 1 mata kuliah Pengembangan Aplikasi Berbasis Web (PABWE).
Back-end (Express + SQLite) berada di repository terpisah: **`ifs24016-pabwe2026-proyek1-backend`**.

## Fitur

Akun & login, dashboard, koleksi buku (CRUD, cari, filter), aktivitas membaca, statistik kebiasaan, dan pengaturan.

## Struktur

```
ifs24016-pabwe2026-proyek1/
├── src/
│   ├── components/ (+ dashboard/, statistics/, settings/)   # komponen UI
│   ├── contexts/ hooks/ layouts/ pages/ services/ utils/    # state, logika, halaman, API client, util
│   └── __tests__/                                           # test Vitest
├── index.html, vite.config.js, package.json, bun.lock
├── vercel.json                                              # rewrite /api/* ke URL back-end
└── Jenkinsfile, sonar-project.properties                    # dari dosen (jangan diubah)
```

## Menjalankan lokal (Windows PowerShell)

```powershell
git clone <URL_REPOSITORY_FRONTEND>
cd ifs24016-pabwe2026-proyek1
bun install
bun run dev        # http://localhost:5173
```

Permintaan `/api` diteruskan Vite ke `http://localhost:3000`, jadi jalankan juga back-end (lihat README repository back-end).

## Test & build

```powershell
bun run test:coverage   # Vitest + coverage (sama seperti Jenkins)
bun run build           # hasil di dist/
```

## Terhubung ke back-end online

Edit `vercel.json`: ganti `GANTI-DENGAN-URL-BACKEND` dengan host back-end (tanpa `https://`), contoh `api-proyek1.contoh.com`.
Vercel meneruskan `/api/*` ke back-end, sehingga browser hanya berbicara dengan satu domain dan cookie sesi berfungsi.
`VITE_API_BASE_URL` dibiarkan kosong.

## Tautan

- Repository front-end: `<ISI>`
- Repository back-end: `<ISI>`
- Aplikasi online: `<ISI>`

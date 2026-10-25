> **Catatan:** back-end kini berada di repository terpisah (`ifs24016-pabwe2026-proyek1-backend`). Bagian dokumen ini yang menyebut folder `server/` merujuk ke repository tersebut.

# Checklist Pengumpulan Proyek 1 PABWE

Deadline: **sebelum 24 Oktober 2026**. Status hanya SELESAI bila sudah diverifikasi nyata.
Legenda: SELESAI · BELUM SELESAI · TERHAMBAT.

## Artefak wajib (panduan dosen)

| # | Artefak | Status | Catatan |
|---|---|---|---|
| 1 | Dokumen Proyek 1 (sesuai template) | BELUM SELESAI | Template berisi dokumentasi pemanfaatan AI (prompt, evaluasi kesalahan, perbaikan, screenshot). Butuh bukti dari Anda. Lihat bagian bawah. |
| 2 | Repository GitHub | BELUM SELESAI | Kode siap; Anda perlu membuat repo & push |
| 3 | Hasil pengujian deployment Jenkins | BELUM SELESAI | Jenkinsfile siap; belum pernah dijalankan |
| 4 | URL aplikasi online | BELUM SELESAI | Perlu platform dengan volume persisten (`docs/DEPLOYMENT.md`) |
| 5 | URL video YouTube (mulai dari clone) | BELUM SELESAI | Naskah di `docs/VIDEO_SCRIPT.md` |

## Pemeriksaan akhir

| Item | Status | Bukti/catatan |
|---|---|---|
| Topik TanaRead dicek terhadap daftar topik kelas | BELUM SELESAI | Spreadsheet kelas tidak dapat saya akses; Anda perlu memeriksa & mendaftarkan topik |
| ReactJS + Vite berfungsi (UI sesuai screenshot) | BELUM SELESAI | Test front-end (Vitest) belum pernah dijalankan. Semua file lolos pemeriksaan sintaks; komponen non-router lolos smoke test render. Tampilan belum pernah dilihat di browser. Belum di-`bun install`/dijalankan |
| Express.js berfungsi | BELUM SELESAI | Kode ditulis; Express tidak terpasang di lingkungan saya (tanpa internet), belum dijalankan |
| SQLite berfungsi & persisten (lapisan data) | SEBAGIAN | 45 test (data, statistik, autentikasi, isolasi antar pengguna) lolos di sandbox (driver `node:sqlite` di Node), termasuk tutup–buka ulang file, cascade, CHECK, migrasi berulang. Jalur **`bun:sqlite`** (yang dipakai proyek) belum pernah saya jalankan: Bun tidak ada di sandbox |
| CRUD buku & reading log | BELUM SELESAI | Logika service terverifikasi lewat test; jalur HTTP (`tests/api.test.js`) belum pernah dijalankan |
| Login & isolasi data antar pengguna | SEBAGIAN | Lapisan service teruji (hash, sesi, kedaluwarsa, pembatas, isolasi). Jalur HTTP/cookie (`api.test.js`) dan UI login belum dijalankan |
| Dashboard menghitung dari database | SELESAI di lapisan service | Teruji; tampilan UI belum dijalankan |
| Validasi & error handling | SELESAI di lapisan service/validator | Handler HTTP belum dijalankan |
| REST API dapat diuji | BELUM SELESAI | Contoh curl/PowerShell di `docs/API.md` belum dicoba terhadap server hidup |
| Pengujian otomatis berjalan | SEBAGIAN | Server (service/DB): 31/31 lulus di sandbox. `api.test.js` & test client: belum dijalankan |
| Build front-end berhasil | BELUM SELESAI | `bun run build` belum dijalankan |
| README & instruksi instalasi | SELESAI (ditulis) | Perlu Anda uji dari clone bersih |
| Jenkins pipeline (milik dosen) lulus | BELUM SELESAI | Struktur repo sudah disesuaikan; belum pernah dijalankan |
| SonarQube Quality Gate lulus | BELUM SELESAI | Test untuk seluruh `src/` ditulis, coverage belum pernah diukur |
| Trivy tanpa HIGH/CRITICAL | BELUM SELESAI | Tergantung versi dependency saat `bun install` |
| Deployment online dapat diakses | BELUM SELESAI | |
| Data produksi tidak hilang (storage persisten) | BELUM SELESAI | Tergantung platform; verifikasi dengan restart |
| Dokumen Proyek 1 sesuai template | BELUM SELESAI | |
| Video dimulai dari clone | BELUM SELESAI | |
| Tidak ada secret/DB ter-commit | BELUM SELESAI | `.gitignore` menolak `.env` & `*.db`; `bun.lock` HARUS ter-commit; cek `git status` sebelum push |
| Semua klaim didukung bukti | BERLAKU | Jangan klaim di dokumen hal yang belum Anda jalankan |

## Bukti yang harus Anda kumpulkan untuk Dokumen Proyek 1 (berdasarkan template dosen)

- **Bab III Proses Pemanfaatan AI:** nama & versi alat AI yang benar-benar Anda pakai, prompt asli (salin persis) + tangkapan layar hasil AI, screenshot halaman web hasil awal.
- **Bab IV Evaluasi Kritis:** kesalahan/kelemahan **nyata** pada kode AI yang Anda temukan (fitur, baris/fungsi, masalah, dampak) + screenshot bukti (error di console, test gagal, UI salah).
- **Bab V Perbaikan:** tangkapan sebelum/sesudah, keputusan teknis, prompt perbaikan tambahan.
- **Lampiran:** URL GitHub dan YouTube. Bab I–II (latar belakang, rumusan, fitur, teknologi, flowchart) dapat saya bantu isi bila Anda memberikan NIM, nama, dan konfirmasi alat AI yang dipakai.
- Jangan mengarang kesalahan atau prompt; dosen menilai proses evaluasi kritis Anda sendiri.

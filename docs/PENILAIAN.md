> **Catatan:** back-end kini berada di repository terpisah (`ifs24016-pabwe2026-proyek1-backend`). Bagian dokumen ini yang menyebut folder `server/` merujuk ke repository tersebut.

# Panduan Lolos Penilaian Otomatis Proyek 1

Ada empat penilai di platform dosen. Dua memeriksa kode (Source Code Grading AI, SonarQube), satu menjalankan pipeline (Jenkins), satu memeriksa tampilan web (Check UI).
Percobaan tidak terbatas, jadi alurnya: perbaiki → push ke GitHub → kirim ulang → baca hasil → perbaiki lagi.

## 0. Hal yang dipaksakan oleh file dosen (jangan diubah)

`Jenkinsfile` dan `sonar-project.properties` dijalankan **dari root repository**. Karena itu:

| Yang diharapkan pipeline | Penerapan di proyek ini |
|---|---|
| `bun install` di root | `package.json` + `bun.lock` front-end ada di root (back-end terpisah di `server/`) |
| `npx vitest run --coverage` di root | skrip & konfigurasi Vitest di root (`vite.config.js`), hanya mengambil `src/**/*.test.*`; `@vitest/coverage-v8` terpasang |
| `sonar.sources=src`, laporan `coverage/lcov.info` | kode front-end di `src/`; reporter `lcov` aktif |
| pengecualian `src/setupTests.js`, `src/test-utils.jsx`, `src/main.jsx` | file dengan nama persis itu dipakai/dikecualikan |
| Trivy `--exit-code 1` pada HIGH/CRITICAL | dependency harus bebas kerentanan HIGH/CRITICAL (lihat bagian 3) |
| Deploy memakai `URL_REDEPLOY`, `DEPLOY_TOKEN`, `WEBSITE_ID`, `URL_PROGRESS` | variabel ini disuntikkan platform dosen, bukan dari repository |

## 1. Source Code Grading (AI, 4 kriteria × 25)

Membaca semua `.js/.jsx/.css/.html/.mjs` (kecuali `node_modules`, `dist`, `coverage`, dst.) di **seluruh repo**, termasuk `server/`.
- **struktur_project:** folder per tanggung jawab (`components`, `pages`, `contexts`, `hooks`, `services`, `utils`; di server `routes`, `services`, `validators`, `middleware`, `db`).
- **clean_code:** komponen kecil (Dashboard & Statistik dipecah), tanpa duplikasi (hook `useDeleteFlow`, `SegmentedControl`, `InlineSaveForm`), nama jelas, komentar hanya untuk "mengapa".
- **best_practice:** validasi input (klien & server), error handling terpusat, hash kata sandi, cookie HttpOnly, query berparameter, test.
- **separation_of_concern:** UI (`components/`, `pages/`) ↔ logika murni (`utils/validators.js`, `utils/bookMapper.js`) ↔ akses data (`services/api.js`) ↔ state global (`contexts/`).

## 2. SonarQube + Quality Gate

Quality Gate bawaan Sonar biasanya mensyaratkan: **coverage kode baru ≥ 80%**, duplikasi ≤ 3%, rating Reliability/Security/Maintainability A, dan **semua Security Hotspot sudah direview**.
Gate di kampus bisa berbeda; lihat kondisi yang gagal di halaman SonarQube, lalu perbaiki.
- Coverage: seluruh `src/` punya test (halaman, komponen, hook, context, API client, util). Jalankan `bun run test:coverage` dan pastikan tabel "All files" ≥ 80% untuk Lines/Statements.
- Pola yang sengaja dihindari karena memicu *hotspot*: `Math.random()` (ID toast memakai counter), regex dengan backtracking (email divalidasi tanpa regex rumit), `console.log` berlebihan.
- Jika gate gagal karena file tertentu berkoefisien rendah, tambah test untuk file itu (kirim laporan coverage ke saya).

## 3. Trivy

Memindai file dependency di seluruh repo (`bun.lock` di root dan `server/bun.lock`). Pipeline **gagal** bila ada kerentanan HIGH/CRITICAL.
- Jangan mengunci versi lama. Setelah `bun install` pertama, versi terbaru yang kompatibel otomatis terpilih.
- Jika Trivy melaporkan paket tertentu: naikkan versinya (`bun update <paket>`), jalankan test, commit lockfile baru, kirim ulang.
- Ujicoba lokal (opsional, perlu Docker): `docker run --rm -v "${PWD}:/src" aquasec/trivy:0.74.0 fs --scanners vuln --severity HIGH,CRITICAL /src`

## 4. Jenkins

Pipeline: Checkout → Install → **Test (coverage)** → Trivy → SonarQube → Quality Gate → Package (zip) → Publish → **Deploy** (memanggil API platform) → polling status.
Yang bisa Anda kontrol: test harus lulus, Trivy bersih, Quality Gate lulus, dan aplikasi harus bisa dideploy oleh platform (lihat `docs/DEPLOYMENT.md`).
Paket zip memuat seluruh repo kecuali `node_modules`, `dist`, `.env`, dll.

## 5. Check UI

Menilai halaman web yang sudah dideploy. Pastikan URL aktif, halaman pertama (login) tampil rapi, dan fitur utama dapat diakses.
Karena aplikasi memakai login, penilai perlu bisa masuk: registrasi terbuka (siapa pun dapat mendaftar). Tanyakan ke dosen/asisten bila penilai membutuhkan akun yang disediakan.

## Alur kerja yang disarankan

1. `bun install` (root) dan `cd server; bun install` → commit kedua `bun.lock`.
2. `bun run test:coverage` hingga semua test lulus dan coverage ≥ 80%. Kirim error ke saya bila ada yang merah.
3. `bun run test:server` → semua lulus.
4. `bun run build` → berhasil.
5. Push ke GitHub (pastikan `Jenkinsfile` dan `sonar-project.properties` ikut, `.env` dan `*.db` tidak).
6. Kirim di platform; buka hasil tiap penilai; perbaiki yang gagal; ulangi.

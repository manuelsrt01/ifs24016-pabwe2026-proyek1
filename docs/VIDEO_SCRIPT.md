> **Catatan:** back-end kini berada di repository terpisah (`ifs24016-pabwe2026-proyek1-backend`). Bagian dokumen ini yang menyebut folder `server/` merujuk ke repository tersebut.

# Naskah & Checklist Video YouTube (menjalankan aplikasi di komputer lokal)

Syarat dosen: video **dimulai dari `git clone`**. Untuk membuktikan itu nyata, rekam di folder yang **belum** berisi proyek (hapus/pindahkan folder `ifs24016-pabwe2026-proyek1` lama sebelum merekam).
Jangan menampilkan isi `.env`, token, atau secret. Rekam layar penuh dengan font terminal besar. Durasi target 8–12 menit. Ganti `<…>` dengan nilai asli Anda.

## Persiapan sebelum merekam
- [ ] Repository sudah di-push dan publik; `bun.lock` sudah ter-commit.
- [ ] Folder `ifs24016-pabwe2026-proyek1` lokal dihapus; tidak ada proses di port 3000/5173.
- [ ] Tab browser siap: halaman repository GitHub, (opsional) Jenkins, URL aplikasi online.
- [ ] Zoom browser & font terminal diperbesar; notifikasi dimatikan.

## Naskah per adegan

1. **Pembuka (GitHub).** *"Halo, saya <nama>, NIM <nim>. Ini video menjalankan aplikasi TanaRead, pelacak kebiasaan membaca, dengan ReactJS Vite, Express.js, dan SQLite. Kita mulai dari repository GitHub."* Tunjukkan halaman repo & README.
2. **Clone.** Buka PowerShell di folder kerja kosong:
   ```powershell
   git clone <URL_REPOSITORY_GITHUB>
   cd ifs24016-pabwe2026-proyek1
   ```
   *"Perintah clone mengunduh seluruh kode ke komputer lokal."* Tunjukkan `dir`.
3. **Prasyarat.** `bun --version` dan `git --version`.
4. **Instal dependency.**
   ```powershell
   bun install --frozen-lockfile
   cd server; bun install --frozen-lockfile; cd ..
   ```
   Jelaskan: front-end (React, Vite, Recharts) di root dan back-end (Express, CORS) di `server/` diinstal terpisah.
5. **Environment.** `Copy-Item server\.env.example server\.env` → jelaskan variabel (`PORT`, `DB_PATH`, `APP_TIMEZONE`) **tanpa** membuka nilai rahasia (di proyek ini memang tidak ada secret).
6. **Inisialisasi database.** `bun run db:init` → tunjukkan pesan "Database siap … versi skema 1/1". Jelaskan: skema dibuat otomatis, aman dijalankan ulang, data tidak dihapus. (Opsional demo: `bun run seed`, sebutkan bahwa ini hanya data contoh lokal.)
7. **Jalankan Express (terminal 1).** `bun run dev:server` → "TanaRead API berjalan di port 3000".
8. **Jalankan React + Vite (terminal 2).** `bun run dev` → buka `http://localhost:5173`.
9. **Pengujian API (terminal 3).** (Endpoint data butuh login: lihat contoh `-SessionVariable` di `docs/API.md`.)
   ```powershell
   Invoke-RestMethod http://localhost:3000/api/health
   Invoke-RestMethod http://localhost:3000/api/books
   Invoke-RestMethod http://localhost:3000/api/dashboard/summary
   ```
   Tunjukkan satu kasus error, mis. `Invoke-RestMethod http://localhost:3000/api/books/99999` (404).
10a. **Registrasi & login.** Buka aplikasi (otomatis ke halaman Masuk), tunjukkan validasi form kosong, daftar akun baru, lalu keluar dan masuk lagi. Tunjukkan bahwa `Invoke-RestMethod http://localhost:3000/api/books` tanpa login ditolak (401).
10. **Demo UI – CRUD buku.** Tambah buku (tunjukkan validasi: kosongkan judul), edit, cari, filter status/kategori, hapus dengan dialog konfirmasi.
11. **Demo Reading Log.** Buka detail buku → catat aktivitas → tunjukkan progres & status berubah; coba halaman akhir > total (ditolak); catat sampai tamat → status Selesai.
12. **Dashboard & statistik.** Tunjukkan kartu ringkasan, grafik 7 hari, halaman Statistik (ganti periode) dan jelaskan definisi metrik.
13. **Test otomatis.** `bun run test:server` lalu `bun run test:client` → tunjukkan hasil **apa adanya**.
14. **Build.** `bun run build` → "built in …".
15. **Jenkins** *(hanya bila sudah benar-benar berjalan)*: tunjukkan job `ifs24016-pabwe2026-proyek1`, Stage View, Console Output sukses, Test Result.
16. **Aplikasi online** *(hanya bila sudah dideploy)*: buka URL online, `/api/health`, tambah data.
17. **Penutup.** *"Demikian demonstrasi TanaRead dari clone repository sampai berjalan lokal. Terima kasih."*

## Setelah merekam
- [ ] Unggah ke YouTube (Unlisted/Public sesuai ketentuan dosen), pastikan bisa dibuka tanpa login.
- [ ] Tempel URL ke Dokumen Proyek (Lampiran B) dan README.
- [ ] Pastikan video benar-benar dimulai dari `git clone`.

# Panduan Deployment Front-end

Front-end dideploy ke **Vercel** oleh pipeline Jenkins (`Jenkinsfile` dosen). Back-end dideploy dari repository terpisah.

## Urutan yang benar

1. **Deploy back-end lebih dulu** (lihat `docs/DEPLOYMENT.md` di repository back-end) dan catat URL-nya, mis. `https://api-proyek1.contoh.com`.
   Pastikan `https://<url-backend>/api/health` menjawab `{"status":"ok","database":"ok"}`.
2. **Edit `vercel.json`** di repository ini: ganti `GANTI-DENGAN-URL-BACKEND` dengan host back-end tanpa `https://`
   (hasil akhir: `"destination": "https://api-proyek1.contoh.com/api/:path*"`). Commit dan push.
3. **Siapkan lockfile**: `bun install`, pastikan `bun.lock` ter-commit.
4. **Cek lokal**: `bun run test:coverage` dan `bun run build`.
5. **Kirim tugas** Jenkins, SonarQube, dan Check Source Code dengan URL repository front-end ini.
6. **Kirim Check UI** dengan URL `*.vercel.app` hasil deploy.

## Verifikasi setelah deploy

- [ ] `https://<app>.vercel.app` menampilkan halaman login.
- [ ] `https://<app>.vercel.app/api/health` menjawab `ok` (bukan 404/HTML/500).
- [ ] Daftar akun, masuk, tambah buku dan aktivitas; data muncul di dashboard.
- [ ] Muat ulang di `/books` atau `/statistics` tetap membuka aplikasi.
- [ ] Cookie `tanaread_session` tersimpan (DevTools → Application → Cookies).

## Mengapa lewat rewrite Vercel

Cookie sesi bertanda `SameSite=Lax`. Bila browser memanggil domain back-end langsung dari domain lain, cookie tidak terkirim.
Dengan rewrite, browser hanya memanggil domain Vercel dan Vercel meneruskan `/api/*`, sehingga cookie berlaku di satu domain.

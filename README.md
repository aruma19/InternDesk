# BID TIK — Sistem Pendataan Mahasiswa Magang

Rebuild dari versi Laravel (`website_bid_tik`) menjadi stack **React (Vite) + Node.js/Express + MySQL**.

## Struktur Folder

```
website-bid-tik/
├── backend/            # REST API (Express + MySQL + JWT)
│   ├── src/
│   │   ├── config/         # koneksi database
│   │   ├── controllers/    # logika bisnis tiap resource
│   │   ├── middleware/     # auth (JWT) & upload file (multer)
│   │   ├── routes/         # definisi endpoint
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/         # file hasil upload (permohonan & lampiran laporan)
│   └── .env.example
├── frontend/            # SPA React (Vite + Tailwind CSS)
│   └── src/
│       ├── api/             # axios instance
│       ├── components/      # layout, ProtectedRoute, StatusBadge
│       ├── context/          # AuthContext (JWT di localStorage)
│       └── pages/
│           ├── user/         # login, register, dashboard, form, laporan
│           └── admin/        # login, dashboard, kelola data & laporan
├── database/
│   └── schema.sql       # skema + data (siap import ke MySQL)
└── README.md
```

## Perubahan dari versi Laravel

- **Auth**: session Laravel → **JWT** (disimpan di `localStorage`, dikirim via header `Authorization: Bearer <token>`).
- **Admin bypass hardcoded** (`admin`/`admin123`) dihapus, diganti akun admin sungguhan di tabel `users` (lihat kredensial default di bawah).
- **Database**: tabel bawaan Laravel (`cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `migrations`, `sessions`) dihapus karena tidak relevan lagi — hanya menyisakan `users`, `intern_forms`, `internship_reports`.
- **Registrasi mandiri**: ditambahkan endpoint `POST /api/auth/register` supaya mahasiswa bisa membuat akun sendiri (di versi lama akun harus dibuat manual oleh admin).
- Password bcrypt lama **tetap kompatibel** dan sudah dimigrasikan ke `database/schema.sql`, tidak perlu di-hash ulang.

## Menjalankan Secara Lokal

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

Ini akan membuat database `intern_systems` beserta seluruh tabel dan data migrasi.

### 2. Backend

```bash
cd backend
cp .env.example .env     # sesuaikan DB_PASSWORD, JWT_SECRET, dll
npm install
npm run dev               # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env      # sesuaikan VITE_API_URL jika perlu
npm install
npm run dev                # http://localhost:5173
```

## Kredensial Default

| Peran | Email / Username | Password |
|---|---|---|
| Admin | `admin@bidtik.local` | `Admin#12345` |
| Mahasiswa (contoh data lama) | `charliepalangan@gmail.com` | *(password lama, tidak diketahui — gunakan fitur registrasi untuk akun baru)* |

> ⚠️ **Segera ganti password admin default** setelah deployment pertama (buat user admin baru dari halaman "Tambah User", lalu hapus/nonaktifkan akun default).

## Ringkasan API

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/register` | Registrasi mahasiswa |
| POST | `/api/auth/login` | Login mahasiswa |
| POST | `/api/auth/admin/login` | Login admin |
| GET  | `/api/auth/me` | Data user yang sedang login |
| GET  | `/api/intern-forms/me` | Form magang milik user |
| POST | `/api/intern-forms` | Isi form magang (multipart, field `file_permohonan`) |
| GET  | `/api/reports` | Daftar laporan magang milik user |
| POST | `/api/reports` | Buat laporan (multipart, field `files`, bisa banyak) |
| PUT/DELETE | `/api/reports/:id` | Update / hapus laporan |
| GET  | `/api/admin/dashboard` | Statistik dashboard admin |
| GET/PUT | `/api/admin/intern-forms` / `/:id` | Kelola data & status magang |
| GET/PUT | `/api/admin/reports` / `/:id/status` | Kelola & verifikasi laporan |
| POST | `/api/admin/users` | Tambah user baru |

## Catatan Deployment

- File upload disimpan di `backend/uploads/` dan disajikan statis lewat `/uploads/...`. Untuk produksi, pertimbangkan memindahkannya ke object storage (S3, dsb).
- Set `JWT_SECRET` yang kuat dan acak di `.env` sebelum deploy.
- Set `FRONTEND_URL` di `.env` backend agar CORS mengarah ke domain frontend yang benar.

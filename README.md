# Pawmart Frontend

Aplikasi frontend e-commerce React + Vite untuk Pawmart. Proyek ini menyediakan pengalaman belanja online dengan:

- Halaman beranda dengan produk unggulan
- Daftar produk dan halaman detail produk
- Keranjang belanja dan alur checkout
- Upload bukti pembayaran
- Halaman pesanan pengguna
- Area admin untuk dashboard, kategori barang, produk, dan order

> Frontend ini terhubung dengan backend API di `http://127.0.0.1:8000/api`.

## Fitur Utama

- Autentikasi user: login, register, logout
- Proteksi rute: halaman cart, checkout, orders hanya untuk user terautentikasi
- Area admin: hanya pengguna dengan peran admin dapat mengakses
- Konsumsi API dengan Axios dan interceptor JWT otomatis
- Penanganan 401 otomatis: jika token kadaluwarsa, user diarahkan kembali ke login
- Support upload file pembayaran via FormData
- Konversi URL gambar dari endpoint backend

## Struktur Halaman

- `/` - Beranda dengan produk unggulan
- `/products` - Daftar semua produk
- `/products/:id` - Detail produk
- `/login` - Halaman login
- `/register` - Halaman registrasi
- `/cart` - Keranjang belanja
- `/checkout` - Checkout order
- `/orders` - Daftar pesanan user
- `/orders/:id/payment` - Upload bukti pembayaran
- `/admin/dashboard` - Dashboard admin
- `/admin/categories` - Manajemen kategori
- `/admin/products` - Manajemen produk
- `/admin/orders` - Manajemen pesanan admin

## Teknologi

- React 19
- Vite
- React Router DOM 7
- Axios
- Tailwind CSS 4
- ESLint

## Instalasi

1. Pasang dependency:

```bash
npm install
```

2. Jalankan development server:

```bash
npm run dev
```

3. Buka browser di alamat yang ditampilkan, biasanya `http://localhost:5173`

## Konfigurasi API

Base URL API didefinisikan di `src/services/api.js`:

```js
const BASE_URL = "http://127.0.0.1:8000";
```

Jika backend berjalan di alamat atau port lain, silakan ubah nilai `BASE_URL` sesuai.

## Catatan Penting

- Proyek ini adalah frontend; backend API diperlukan untuk fungsi autentikasi, produk, keranjang, pesanan, dan kategori.
- Interceptor Axios otomatis menyisipkan token JWT dari `localStorage` ke setiap request.
- Untuk upload file pembayaran, `FormData` digunakan dan header `Content-Type` dihapus agar Axios dapat mengatur boundary secara otomatis.

## Struktur Folder Utama

- `src/components` - komponen UI seperti `ProductCard`, `HeroSection`, `UserNavbar`, `UserFooter`, `AdminSidebar`
- `src/layouts` - layout utama untuk user dan admin
- `src/pages` - halaman aplikasi untuk user, admin, dan auth
- `src/routes` - konfigurasi routing dengan middleware
- `src/services` - helper API Axios dan endpoint service
- `src/middleware/auth.js` - middleware autentikasi dan otorisasi

## Scripts

- `npm run dev` - jalankan server pengembangan
- `npm run build` - bangun aplikasi untuk produksi
- `npm run lint` - jalankan ESLint
- `npm run preview` - preview build produksi

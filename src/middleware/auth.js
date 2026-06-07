import { redirect } from "react-router-dom";

// cek apakah user sudah login dengan lihat token di localStorage
// kalau nggak ada token berarti belum login, langsung tendang ke /login
// ini dipasang di route yang butuh login (semua halaman kecuali /login dan /register)
export const authMiddleware = () => {
    const token = localStorage.getItem("token");
    if (!token) return redirect("/login");
    return null;
};

// kebalikan dari authMiddleware
// kalau user sudah punya token (berarti sudah login) tapi coba buka /login atau /register,
// langsung redirect ke halaman utama biar nggak bisa balik ke form login lagi
export const authLogin = () => {
    const token = localStorage.getItem("token");
    if (token) return redirect("/");
    return null;
};

// middleware khusus buat halaman admin
// dua lapis pengecekan:
// 1. kalau belum login sama sekali -> ke /login
// 2. kalau sudah login tapi role-nya bukan admin -> ke / (halaman user biasa)
// ini yang ngebuat user biasa nggak bisa akses /admin/* meskipun mereka punya token
export const adminMiddleware = () => {
    const token = localStorage.getItem("token");
    if (!token) return redirect("/login");

    // data user disimpen sebagai string JSON waktu login, jadi perlu di-parse dulu
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") return redirect("/");

    return null;
};
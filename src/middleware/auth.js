import { redirect } from "react-router-dom";

// cek apakah user sudah login
// kalau belum ada token di localStorage -> redirect ke /login
export const authMiddleware = () => {
    const token = localStorage.getItem("token");
    if (!token) return redirect("/login");
    return null;
};

// kebalikan dari authMiddleware
// kalau user sudah login dan coba akses /login atau /register -> redirect ke /
export const authLogin = () => {
    const token = localStorage.getItem("token");
    if (token) return redirect("/");
    return null;
};

// cek apakah user yang login adalah admin
// kalau belum login -> redirect ke /login
// kalau bukan admin -> redirect ke /
export const adminMiddleware = () => {
    const token = localStorage.getItem("token");
    if (!token) return redirect("/login");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") return redirect("/");

    return null;
};
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { logout } from "../services/api";

export default function AdminLayout() {
    const location = useLocation(); // ambil path yang aktif sekarang
    const navigate = useNavigate();

    // ambil data user dari localStorage
    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    async function handleLogout() {
        try {
            await logout();
        } catch (err) {
            // tetap logout meski API gagal
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar
                user={user}
                activePath={location.pathname} // ← kirim path aktif
                onLogout={handleLogout}         // ← kirim fungsi logout
            />
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
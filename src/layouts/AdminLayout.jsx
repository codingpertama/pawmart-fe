import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

// Layout untuk halaman admin
// Sidebar di kiri, konten di kanan
export default function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar selalu muncul di semua halaman admin */}
            <AdminSidebar />

            {/* Konten halaman yang aktif */}
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
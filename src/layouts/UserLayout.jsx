import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import CartProvider from "../context/CartContext";

// Layout untuk halaman user
// Outlet = tempat halaman anak dirender (CatalogPage, CartPage, dll)
export default function UserLayout() {
    return (
        <CartProvider>
            <div className="min-h-screen bg-gray-50">
                {/* Navbar selalu muncul di semua halaman user */}
                <UserNavbar />

                {/* Konten halaman yang aktif */}
                <main className="max-w-6xl mx-auto px-6 py-8">
                    <Outlet />
                </main>
            </div>
        </CartProvider>
    );
}
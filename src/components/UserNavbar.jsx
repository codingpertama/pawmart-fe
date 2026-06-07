import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuShoppingCart, LuChevronDown, LuPackage, LuLogOut } from "react-icons/lu";
import Avatar from 'react-avatar';
import { useCart } from "../context/CartContext";

// Props:
// - user  : objek { name, email } kalau sudah login, null kalau belum
// - cartCount : jumlah item di keranjang
export default function UserNavbar({ user = null }) {
    const { cartCount } = useCart();
    const navigate = useNavigate();
    // kalau user prop kosong, coba ambil dari localStorage
    const loggedInUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);
    // state buat buka/tutup dropdown
    const [isOpen, setIsOpen] = useState(false);

    // handler untuk logout
    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsOpen(false);
        navigate("/login");
    }

    return (
        <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-30 shadow-sm">

            {/* Logo */}
            <div className="flex items-center gap-2">
                <img src="/images/logo-pawmart.jpg" alt="PawMart Logo" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-bold text-xl text-gray-800">
                    Paw<span className="text-orange-500">Mart</span>
                </span>
            </div>

            {/* Kanan: beda tampilan tergantung status login */}
            <div className="flex items-center gap-3">

                {loggedInUser ? (
                    // ── SUDAH LOGIN ──
                    <>
                        {/* Tombol keranjang dengan badge */}
                        <button onClick={() => navigate("/cart")} className="relative p-2 rounded-xl hover:bg-orange-50 transition text-gray-600">
                            <LuShoppingCart size={22} />
                            {/* badge hanya muncul kalau ada item di keranjang */}
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </button>

                        {/* Avatar + nama, klik buat dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-3 py-1 hover:bg-orange-50 transition"
                            >
                                {/* lingkaran inisial */}
                                <Avatar name={loggedInUser.name} size="32" round={true} />
                                <span className="text-sm font-semibold text-gray-800">
                                    {loggedInUser.name.split(" ")[0]}
                                </span>
                                <LuChevronDown
                                    size={16}
                                    className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Dropdown menu */}
                            {isOpen && (
                                <>
                                    {/* overlay untuk nutup dropdown saat klik di luar */}
                                    <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-40" />

                                    <div className="absolute right-0 top-12 z-50 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg py-2">
                                        {/* <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center gap-2 transition">
                                            <LuUser size={16} className="text-gray-400" />
                                            Profil / akun saya
                                        </button> */}
                                        <button onClick={() => navigate("/orders")} className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center gap-2 transition">
                                            <LuPackage size={16} className="text-gray-400" />
                                            Pesanan saya
                                        </button>
                                        <hr className="my-1 border-gray-100" />
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2 transition">
                                            <LuLogOut size={16} />
                                            Keluar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    // ── BELUM LOGIN ──
                    <>
                        <a
                            href="/login"
                            className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition"
                        >
                            Masuk
                        </a>
                        <a
                            href="/register"
                            className="text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition"
                        >
                            Daftar
                        </a>
                    </>
                )}

            </div>
        </nav>
    );
}
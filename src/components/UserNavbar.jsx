import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuShoppingCart, LuChevronDown, LuPackage, LuLogOut } from "react-icons/lu";
import Avatar from 'react-avatar';
import { useCart } from "../context/CartContext";

// Props:
// - user : objek { name, email } kalau sudah login, null kalau belum
export default function UserNavbar({ user = null }) {

    // ambil cartCount dari CartContext — ini yang bikin badge keranjang update otomatis
    // tanpa Context, harus lempar cartCount sebagai props dari halaman ke navbar, ribet
    const { cartCount } = useCart();
    const navigate = useNavigate();

    // kalau prop user nggak dikasih dari parent, coba ambil dari localStorage sebagai fallback
    // ini penting biar navbar tetap bisa nampilin nama user meskipun prop-nya lupa dikirim
    const loggedInUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);

    // kontrol buka/tutup dropdown profil
    const [isOpen, setIsOpen] = useState(false);

    // hapus token dan data user dari localStorage, tutup dropdown, lalu redirect ke login
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

            {/* Bagian kanan navbar — tampilannya beda tergantung status login */}
            <div className="flex items-center gap-3">

                {loggedInUser ? (
                    // tampilan kalau sudah login: ikon cart + avatar dropdown
                    <>
                        {/* Tombol keranjang dengan badge counter */}
                        <button
                            onClick={() => navigate("/cart")}
                            className="relative p-2 rounded-xl hover:bg-orange-50 transition text-gray-600"
                        >
                            <LuShoppingCart size={22} />
                            {/* badge hanya muncul kalau cartCount lebih dari 0 */}
                            {/* angka dibatasi "9+" biar badge nggak melar kalau itemnya banyak */}
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </button>

                        {/* Tombol avatar + nama + dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-3 py-1 hover:bg-orange-50 transition"
                            >
                                {/* react-avatar otomatis generate lingkaran inisial dari nama user */}
                                <Avatar name={loggedInUser.name} size="32" round={true} />

                                {/* tampilkan nama depan saja: split(" ")[0] ambil kata pertama sebelum spasi */}
                                <span className="text-sm font-semibold text-gray-800">
                                    {loggedInUser.name.split(" ")[0]}
                                </span>

                                {/* ikon panah rotasi 180 derajat kalau dropdown terbuka */}
                                <LuChevronDown
                                    size={16}
                                    className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Dropdown menu — hanya render kalau isOpen true */}
                            {isOpen && (
                                <>
                                    {/* div transparan full-screen di belakang dropdown
                                        klik di area mana saja di luar dropdown akan nutup menu ini
                                        z-40 biar di bawah dropdown (z-50) tapi di atas konten halaman */}
                                    <div
                                        onClick={() => setIsOpen(false)}
                                        className="fixed inset-0 z-40"
                                    />

                                    <div className="absolute right-0 top-12 z-50 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg py-2">
                                        <button
                                            onClick={() => navigate("/orders")}
                                            className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center gap-2 transition"
                                        >
                                            <LuPackage size={16} className="text-gray-400" />
                                            Pesanan saya
                                        </button>
                                        <hr className="my-1 border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2 transition"
                                        >
                                            <LuLogOut size={16} />
                                            Keluar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    // tampilan kalau belum login: tombol masuk dan daftar
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
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getCarts, updateCart, deleteCart } from "../../services/api";
import { CartContext } from "../../context/CartContext";
import { getImageUrl } from "../../services/api";

export default function CartPage() {
    const navigate = useNavigate();
    const { fetchCartCount } = useContext(CartContext);

    const [carts, setCarts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);

    // ambil data cart saat halaman dibuka
    useEffect(() => {
        loadCarts();
    }, []);

    async function loadCarts() {
        try {
            const response = await getCarts();
            setCarts(response.data.data.items);
            setTotalPrice(response.data.data.total_price);
        } catch (err) {
            console.error("Gagal ambil cart:", err);
        } finally {
            setLoading(false);
        }
    }

    // update quantity item di cart
    async function handleUpdateQty(cartId, newQty) {
        // kalau quantity 0 atau kurang, hapus item
        if (newQty < 1) {
            handleDelete(cartId);
            return;
        }
        try {
            await updateCart(cartId, { quantity: newQty });
            await loadCarts();          // refresh data cart
            await fetchCartCount();     // update badge navbar
        } catch (err) {
            alert(err.response?.data?.message || "Gagal update quantity.");
        }
    }

    // hapus satu item dari cart
    async function handleDelete(cartId) {
        try {
            await deleteCart(cartId);
            await loadCarts();
            await fetchCartCount();
        } catch (err) {
            alert("Gagal menghapus item.");
        }
    }

    const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(totalPrice);

    // ── LOADING ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400 text-sm">Memuat keranjang...</p>
            </div>
        );
    }

    // ── CART KOSONG ──
    if (carts.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-5xl">🛒</p>
                <p className="text-gray-500 font-semibold">Keranjang kamu masih kosong</p>
                <button
                    onClick={() => navigate("/")}
                    className="bg-orange-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition"
                >
                    Mulai Belanja
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Keranjang Belanja</h1>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* List item cart */}
                <div className="flex-1 flex flex-col gap-4">
                    {carts.map((cart) => (
                        <div
                            key={cart.id}
                            className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center"
                        >
                            {/* Gambar produk */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                {cart.product.image_url ? (
                                    <img
                                        src={getImageUrl(cart.product.image_url)}
                                        alt={cart.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                        🛍️
                                    </div>
                                )}
                            </div>

                            {/* Info produk */}
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                                    {cart.product.category?.name}
                                </p>
                                <p className="font-bold text-gray-800 mb-1">
                                    {cart.product.name}
                                </p>
                                <p className="text-orange-500 font-bold">
                                    {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                    }).format(cart.product.price)}
                                </p>
                            </div>

                            {/* Kontrol quantity */}
                            <div className="flex items-center gap-2">
                                {/* tombol kurang */}
                                <button
                                    onClick={() => handleUpdateQty(cart.id, cart.quantity - 1)}
                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-700 font-bold transition flex items-center justify-center"
                                >
                                    −
                                </button>

                                <span className="w-8 text-center font-semibold text-gray-800">
                                    {cart.quantity}
                                </span>

                                {/* tombol tambah */}
                                <button
                                    onClick={() => handleUpdateQty(cart.id, cart.quantity + 1)}
                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-700 font-bold transition flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>

                            {/* Tombol hapus */}
                            <button
                                onClick={() => handleDelete(cart.id)}
                                className="text-red-400 hover:text-red-600 text-sm font-semibold transition ml-2"
                            >
                                Hapus
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary & checkout */}
                <div className="lg:w-72">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
                        <h2 className="font-bold text-gray-800 mb-4">Ringkasan Belanja</h2>

                        {/* Detail item */}
                        <div className="flex flex-col gap-2 mb-4">
                            {carts.map((cart) => (
                                <div key={cart.id} className="flex justify-between text-sm text-gray-500">
                                    <span className="truncate flex-1 mr-2">{cart.product.name} x{cart.quantity}</span>
                                    <span className="font-semibold text-gray-700">
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                        }).format(cart.product.price * cart.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <hr className="border-gray-100 mb-4" />

                        {/* Total */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-gray-800">Total</span>
                            <span className="font-bold text-orange-500 text-lg">{formattedTotal}</span>
                        </div>

                        {/* Tombol checkout */}
                        <button
                            onClick={() => navigate("/checkout")}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition"
                        >
                            Checkout →
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
                        >
                            Lanjut Belanja
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
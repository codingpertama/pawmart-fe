import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getCarts, createOrder } from "../../services/api";
import { CartContext } from "../../context/CartContext";
import { getImageUrl } from "../../services/api";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { clearCartCount } = useContext(CartContext);

    const [carts, setCarts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [shippingAddress, setShippingAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState("");

    // ambil data cart saat halaman dibuka
    useEffect(() => {
        loadCarts();
    }, []);

    async function loadCarts() {
        try {
            const response = await getCarts();
            const data = response.data.data;

            // kalau cart kosong, redirect ke cart
            if (data.items.length === 0) {
                navigate("/cart");
                return;
            }

            setCarts(data.items);
            setTotalPrice(data.total_price);
        } catch (err) {
            console.error("Gagal ambil cart:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCheckout() {
        // validasi alamat wajib diisi
        if (!shippingAddress.trim()) {
            setError("Alamat pengiriman wajib diisi.");
            return;
        }

        setCheckoutLoading(true);
        setError("");

        try {
            const response = await createOrder({
                shipping_address: shippingAddress,
            });

            const order = response.data.data;

            // cart sudah dihapus di backend, reset badge navbar
            clearCartCount();

            // redirect ke halaman upload bukti bayar
            navigate(`/orders/${order.id}/payment`);

        } catch (err) {
            const message = err.response?.data?.message || "Checkout gagal. Coba lagi.";
            setError(message);
        } finally {
            setCheckoutLoading(false);
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
                <p className="text-gray-400 text-sm">Memuat checkout...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* Kiri: form alamat + list item */}
                <div className="flex-1 flex flex-col gap-4">

                    {/* Form alamat pengiriman */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <h2 className="font-bold text-gray-800 mb-4">Alamat Pengiriman</h2>

                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                                {error}
                            </div>
                        )}

                        <textarea
                            placeholder="Masukkan alamat lengkap pengiriman..."
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none"
                        />
                    </div>

                    {/* List item yang akan dibeli */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <h2 className="font-bold text-gray-800 mb-4">Produk yang Dipesan</h2>

                        <div className="flex flex-col gap-4">
                            {carts.map((cart) => (
                                <div key={cart.id} className="flex gap-4 items-center">
                                    {/* Gambar */}
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                        {cart.product.image_url ? (
                                            <img
                                                src={getImageUrl(cart.product.image_url)}
                                                alt={cart.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">
                                                🛍️
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {cart.product.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {cart.quantity} x{" "}
                                            {new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                            }).format(cart.product.price)}
                                        </p>
                                    </div>

                                    {/* Subtotal */}
                                    <p className="font-bold text-gray-800 text-sm">
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                        }).format(cart.product.price * cart.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Kanan: summary & tombol checkout */}
                <div className="lg:w-72">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
                        <h2 className="font-bold text-gray-800 mb-4">Ringkasan</h2>

                        {/* Total item */}
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span>Total item</span>
                            <span>{carts.length} produk</span>
                        </div>

                        <hr className="border-gray-100 my-4" />

                        {/* Total harga */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-gray-800">Total</span>
                            <span className="font-bold text-orange-500 text-lg">
                                {formattedTotal}
                            </span>
                        </div>

                        {/* Tombol checkout */}
                        <button
                            onClick={handleCheckout}
                            disabled={checkoutLoading}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition"
                        >
                            {checkoutLoading ? "Memproses..." : "Buat Pesanan →"}
                        </button>

                        <button
                            onClick={() => navigate("/cart")}
                            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
                        >
                            ← Kembali ke Keranjang
                        </button>

                        {/* Info pembayaran */}
                        <p className="text-xs text-gray-400 text-center mt-4">
                            Setelah checkout, kamu akan diminta upload bukti pembayaran.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getCarts, createOrder } from "../../services/api";
import { CartContext } from "../../context/CartContext";
import { LuShoppingBag, LuArrowLeft, LuArrowRight } from "react-icons/lu";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { clearCartCount } = useContext(CartContext);

    const [carts, setCarts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [shippingAddress, setShippingAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCarts();
    }, []);

    async function loadCarts() {
        try {
            const response = await getCarts();
            const data = response.data.data;

            // kalau cart kosong langsung redirect, tidak perlu tampilkan halaman checkout
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
        if (!shippingAddress.trim()) {
            setError("Alamat pengiriman wajib diisi.");
            return;
        }

        setCheckoutLoading(true);
        setError("");

        try {
            const response = await createOrder({ shipping_address: shippingAddress });
            const order = response.data.data;

            // cart sudah dihapus di backend saat checkout berhasil
            // reset badge di navbar supaya jadi 0
            clearCartCount();

            // redirect ke halaman upload bukti bayar dengan id order yang baru dibuat
            navigate(`/orders/${order.id}/payment`);
        } catch (err) {
            const message = err.response?.data?.message || "Checkout gagal. Coba lagi.";
            setError(message);
        } finally {
            setCheckoutLoading(false);
        }
    }

    // format harga dihitung sekali di sini, tidak perlu diulang di dalam JSX
    const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(totalPrice);

    const formatPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-400 text-sm">Memuat checkout...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-6">

                <div className="flex-1 flex flex-col gap-4">

                    {/* form alamat — nilai dikontrol lewat state shippingAddress */}
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

                    {/* daftar produk yang akan dibeli — diambil dari data cart */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <h2 className="font-bold text-gray-800 mb-4">Produk yang Dipesan</h2>

                        <div className="flex flex-col gap-4">
                            {carts.map((cart) => (
                                <div key={cart.id} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                        {cart.product.image ? (
                                            <img
                                                src={`http://127.0.0.1:8000/storage/${cart.product.image}`}
                                                alt={cart.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <LuShoppingBag size={20} className="text-orange-200" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {cart.product.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {cart.quantity} x {formatPrice(cart.product.price)}
                                        </p>
                                    </div>

                                    <p className="font-bold text-gray-800 text-sm">
                                        {formatPrice(cart.product.price * cart.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* sticky supaya summary tetap keliatan saat scroll */}
                <div className="lg:w-72">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
                        <h2 className="font-bold text-gray-800 mb-4">Ringkasan</h2>

                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span>Total item</span>
                            <span>{carts.length} produk</span>
                        </div>

                        <hr className="border-gray-100 my-4" />

                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-gray-800">Total</span>
                            <span className="font-bold text-orange-500 text-lg">{formattedTotal}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={checkoutLoading}
                            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition"
                        >
                            {checkoutLoading ? "Memproses..." : (
                                <>
                                    Buat Pesanan
                                    <LuArrowRight size={16} />
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => navigate("/cart")}
                            className="w-full mt-3 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
                        >
                            <LuArrowLeft size={16} />
                            Kembali ke Keranjang
                        </button>

                        <p className="text-xs text-gray-400 text-center mt-4">
                            Setelah checkout, kamu akan diminta upload bukti pembayaran.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
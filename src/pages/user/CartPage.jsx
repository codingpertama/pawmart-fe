import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getCarts, updateCart, deleteCart } from "../../services/api";
import { CartContext } from "../../context/CartContext";
import { LuShoppingBag, LuShoppingCart, LuArrowRight } from "react-icons/lu";

export default function CartPage() {
    const navigate = useNavigate();
    const { fetchCartCount } = useContext(CartContext);

    const [carts, setCarts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);

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

    async function handleUpdateQty(cartId, newQty) {
        // kalau quantity dikurangi sampai 0, hapus item dari cart
        if (newQty < 1) {
            handleDelete(cartId);
            return;
        }
        try {
            await updateCart(cartId, { quantity: newQty });
            // refresh data cart dan badge navbar setelah update
            await loadCarts();
            await fetchCartCount();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal update quantity.");
        }
    }

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

    const formatPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-400 text-sm">Memuat keranjang...</p>
            </div>
        );
    }

    if (carts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <LuShoppingCart size={28} className="text-gray-300" />
                </div>
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

                <div className="flex-1 flex flex-col gap-4">
                    {carts.map((cart) => (
                        <div
                            key={cart.id}
                            className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center"
                        >
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                {cart.product.image ? (
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${cart.product.image}`}
                                        alt={cart.product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <LuShoppingBag size={24} className="text-orange-200" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                                    {cart.product.category?.name}
                                </p>
                                <p className="font-bold text-gray-800 mb-1">
                                    {cart.product.name}
                                </p>
                                <p className="text-orange-500 font-bold">
                                    {formatPrice(cart.product.price)}
                                </p>
                            </div>

                            {/* tombol kurang — kalau quantity sudah 1 dan dikurang lagi, item akan dihapus */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleUpdateQty(cart.id, cart.quantity - 1)}
                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-700 font-bold transition flex items-center justify-center"
                                >
                                    −
                                </button>

                                <span className="w-8 text-center font-semibold text-gray-800">
                                    {cart.quantity}
                                </span>

                                <button
                                    onClick={() => handleUpdateQty(cart.id, cart.quantity + 1)}
                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-700 font-bold transition flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() => handleDelete(cart.id)}
                                className="text-red-400 hover:text-red-600 text-sm font-semibold transition ml-2"
                            >
                                Hapus
                            </button>
                        </div>
                    ))}
                </div>

                {/* sticky supaya summary tetap keliatan waktu scroll list produk */}
                <div className="lg:w-72">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
                        <h2 className="font-bold text-gray-800 mb-4">Ringkasan Belanja</h2>

                        <div className="flex flex-col gap-2 mb-4">
                            {carts.map((cart) => (
                                <div key={cart.id} className="flex justify-between text-sm text-gray-500">
                                    <span className="truncate flex-1 mr-2">
                                        {cart.product.name} x{cart.quantity}
                                    </span>
                                    <span className="font-semibold text-gray-700">
                                        {formatPrice(cart.product.price * cart.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <hr className="border-gray-100 mb-4" />

                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-gray-800">Total</span>
                            <span className="font-bold text-orange-500 text-lg">{formattedTotal}</span>
                        </div>

                        <button
                            onClick={() => navigate("/checkout")}
                            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition"
                        >
                            Checkout
                            <LuArrowRight size={16} />
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
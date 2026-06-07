import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../services/api";
import { getImageUrl } from "../../services/api";

export default function OrdersPage() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("semua"); // semua | diproses | selesai

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const response = await getOrders();
            setOrders(response.data.data);
        } catch (err) {
            console.error("Gagal ambil pesanan:", err);
        } finally {
            setLoading(false);
        }
    }

    // filter orders berdasarkan tab yang aktif
    const filteredOrders = orders.filter((order) => {
        if (activeTab === "semua") return true;
        return order.status === activeTab;
    });

    const formattedPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);

    // ── LOADING ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400 text-sm">Memuat pesanan...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Pesanan Saya</h1>

            {/* Tab filter */}
            <div className="flex gap-2 mb-6">
                {["semua", "diproses", "selesai"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition capitalize ${
                            activeTab === tab
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-orange-50"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Kosong */}
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <p className="text-5xl">📦</p>
                    <p className="text-gray-500 font-semibold">Belum ada pesanan</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-orange-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition"
                    >
                        Mulai Belanja
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white border border-gray-100 rounded-2xl p-6"
                        >
                            {/* Header order */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">
                                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p className="font-bold text-gray-800">
                                        Pesanan #{order.id}
                                    </p>
                                </div>

                                {/* Badge status */}
                                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                    order.status === "selesai"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-yellow-100 text-yellow-600"
                                }`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* List item produk */}
                            <div className="flex flex-col gap-3 mb-4">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        {/* Gambar */}
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                            {item.product?.image_url ? (
                                                <img
                                                    src={getImageUrl(item.product.image_url)}
                                                    alt={item.product.name}
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
                                            <p className="text-sm font-semibold text-gray-800">
                                                {item.product?.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {item.quantity} x {formattedPrice(item.price)}
                                            </p>
                                        </div>

                                        {/* Subtotal */}
                                        <p className="text-sm font-bold text-gray-800">
                                            {formattedPrice(item.quantity * item.price)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-100 mb-4" />

                            {/* Footer order */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Total Pembayaran</p>
                                    <p className="font-bold text-orange-500 text-lg">
                                        {formattedPrice(order.total_price)}
                                    </p>
                                </div>

                                {/* Tombol upload bukti kalau belum ada */}
                                {!order.payment_proof && order.status === "diproses" && (
                                    <button
                                        onClick={() => navigate(`/orders/${order.id}/payment`)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                                    >
                                        Upload Bukti Bayar
                                    </button>
                                )}

                                {/* Kalau sudah upload bukti bayar */}
                                {order.payment_proof && order.status === "diproses" && (
                                    <span className="text-xs text-blue-500 font-semibold bg-blue-50 px-3 py-1.5 rounded-full">
                                        Menunggu Konfirmasi
                                    </span>
                                )}

                                {/* Kalau sudah selesai */}
                                {order.status === "selesai" && (
                                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full">
                                        Pesanan Selesai ✓
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
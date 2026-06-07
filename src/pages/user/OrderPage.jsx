import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../services/api";
import { LuShoppingBag, LuPackage } from "react-icons/lu";

export default function OrdersPage() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("semua");

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

    // filter dijalankan setiap render, tidak perlu useEffect
    // kalau tab "semua" semua order lolos, kalau tab lain filter by status
    const filteredOrders = orders.filter((order) => {
        if (activeTab === "semua") return true;
        return order.status === activeTab;
    });

    const formattedPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-400 text-sm">Memuat pesanan...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Pesanan Saya</h1>

            {/* tab filter — diklik untuk ganti activeTab */}
            <div className="flex gap-2 mb-6">
                {["semua", "diproses", "selesai"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition capitalize ${activeTab === tab
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-orange-50"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <LuPackage size={28} className="text-gray-300" />
                    </div>
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
                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6">

                            {/* header tiap card order */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">
                                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p className="font-bold text-gray-800">Pesanan #{order.id}</p>
                                </div>

                                {/* warna badge berbeda tergantung status */}
                                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${order.status === "selesai"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-yellow-100 text-yellow-600"
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* list produk yang dipesan dalam order ini */}
                            <div className="flex flex-col gap-3 mb-4">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                            {item.product?.image ? (
                                                <img
                                                    src={`http://127.0.0.1:8000/storage/${item.product.image}`}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <LuShoppingBag size={20} className="text-orange-200" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {item.product?.name}
                                            </p>
                                            {/* item.price adalah snapshot harga saat checkout,
                                                bukan harga produk sekarang — jadi histori tetap akurat */}
                                            <p className="text-xs text-gray-400">
                                                {item.quantity} x {formattedPrice(item.price)}
                                            </p>
                                        </div>

                                        <p className="text-sm font-bold text-gray-800">
                                            {formattedPrice(item.quantity * item.price)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-100 mb-4" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Total Pembayaran</p>
                                    <p className="font-bold text-orange-500 text-lg">
                                        {formattedPrice(order.total_price)}
                                    </p>
                                </div>

                                {/* tombol dan badge di kanan berubah tergantung kondisi order */}
                                {!order.payment_proof && order.status === "diproses" && (
                                    <button
                                        onClick={() => navigate(`/orders/${order.id}/payment`)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                                    >
                                        Upload Bukti Bayar
                                    </button>
                                )}

                                {order.payment_proof && order.status === "diproses" && (
                                    <span className="text-xs text-blue-500 font-semibold bg-blue-50 px-3 py-1.5 rounded-full">
                                        Menunggu Konfirmasi
                                    </span>
                                )}

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
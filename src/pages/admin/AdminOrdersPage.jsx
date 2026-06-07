import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus, exportOrders } from "../../services/api";
import { getImageUrl } from "../../services/api";
import { LuChevronDown, LuChevronUp, LuDownload } from "react-icons/lu";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("semua");

    // expandedId: ID order yang sedang dibuka detailnya
    const [expandedId, setExpandedId] = useState(null);

    // state konfirmasi update status
    const [statusTarget, setStatusTarget] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);

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

    // filter berdasarkan tab aktif
    const filteredOrders = orders.filter((order) => {
        if (activeTab === "semua") return true;
        return order.status === activeTab;
    });

    // buka/tutup detail order
    function toggleExpand(id) {
        setExpandedId(expandedId === id ? null : id);
    }

    // konfirmasi selesai
    async function handleUpdateStatus() {
        if (!statusTarget) return;
        setStatusLoading(true);
        try {
            await updateOrderStatus(statusTarget.id, { status: "selesai" });
            await loadOrders();
            setStatusTarget(null);
        } catch (err) {
            alert("Gagal update status pesanan.");
        } finally {
            setStatusLoading(false);
        }
    }

    // export excel — trigger download
    async function handleExport() {
        try {
            const response = await exportOrders();
            // buat link download dari blob response
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `pesanan-pawmart-${new Date().toLocaleDateString("id-ID")}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Gagal export data.");
        }
    }

    const formattedPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm">Memuat pesanan...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pesanan</h1>
                    <p className="text-sm text-gray-400 mt-1">Kelola semua pesanan masuk</p>
                </div>
                {/* Tombol export excel */}
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                    <LuDownload size={16} />
                    Export Excel
                </button>
            </div>

            {/* Tab filter */}
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
                        {/* badge jumlah */}
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab
                                ? "bg-white/20 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}>
                            {tab === "semua"
                                ? orders.length
                                : orders.filter((o) => o.status === tab).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* List pesanan */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-gray-400 text-sm">Belum ada pesanan.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                        >
                            {/* Header row — klik untuk expand */}
                            <div
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition"
                                onClick={() => toggleExpand(order.id)}
                            >
                                <div className="flex items-center gap-4">
                                    {/* ID & tanggal */}
                                    <div>
                                        <p className="font-bold text-gray-800">Pesanan #{order.id}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(order.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>

                                    {/* Nama pembeli */}
                                    <div className="hidden md:block">
                                        <p className="text-xs text-gray-400">Pembeli</p>
                                        <p className="text-sm font-semibold text-gray-700">
                                            {order.user?.name}
                                        </p>
                                    </div>

                                    {/* Total */}
                                    <div className="hidden md:block">
                                        <p className="text-xs text-gray-400">Total</p>
                                        <p className="text-sm font-semibold text-orange-500">
                                            {formattedPrice(order.total_price)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Badge status */}
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${order.status === "selesai"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-yellow-100 text-yellow-600"
                                        }`}>
                                        {order.status}
                                    </span>

                                    {/* Icon expand */}
                                    {expandedId === order.id
                                        ? <LuChevronUp size={18} className="text-gray-400" />
                                        : <LuChevronDown size={18} className="text-gray-400" />
                                    }
                                </div>
                            </div>

                            {/* Detail — muncul kalau di-expand */}
                            {expandedId === order.id && (
                                <div className="border-t border-gray-100 p-5">

                                    {/* Info pembeli & alamat */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Pembeli</p>
                                            <p className="text-sm font-semibold text-gray-800">{order.user?.name}</p>
                                            <p className="text-xs text-gray-400">{order.user?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Alamat Pengiriman</p>
                                            <p className="text-sm font-semibold text-gray-800">{order.shipping_address}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Bukti Pembayaran</p>
                                            {order.payment_proof ? (

                                                <a
                                                    href={getImageUrl(`/storage/${order.payment_proof }`)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-sm font-semibold text-blue-500 hover:underline"
                                                >
                                                    Lihat Bukti →
                                                </a>
                                            ) : (
                                                <p className="text-sm text-gray-400">Belum diupload</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* List item produk */}
                                    <div className="flex flex-col gap-3 mb-5">
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                            Item Dipesan
                                        </p>
                                        {order.order_items.map((item) => (
                                            <div key={item.id} className="flex gap-3 items-center">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                                    {item.product?.image_url ? (
                                                        <img
                                                            src={getImageUrl(item.product.image_url)}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lg">
                                                            🛍️
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {item.product?.name}
                                                    </p>
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

                                    {/* Total & tombol konfirmasi */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400">Total Pembayaran</p>
                                            <p className="font-bold text-orange-500 text-lg">
                                                {formattedPrice(order.total_price)}
                                            </p>
                                        </div>

                                        {/* Tombol konfirmasi selesai — hanya muncul kalau masih diproses */}
                                        {order.status === "diproses" && (
                                            <button
                                                onClick={() => setStatusTarget(order)}
                                                className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                                            >
                                                Konfirmasi Selesai
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── MODAL KONFIRMASI STATUS ── */}
            {statusTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
                        <h2 className="font-bold text-gray-800 mb-2">Konfirmasi Pesanan Selesai?</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Pesanan{" "}
                            <span className="font-semibold text-gray-700">#{statusTarget.id}</span>{" "}
                            dari{" "}
                            <span className="font-semibold text-gray-700">{statusTarget.user?.name}</span>{" "}
                            akan ditandai sebagai selesai.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStatusTarget(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={statusLoading}
                                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-xl transition text-sm"
                            >
                                {statusLoading ? "Memproses..." : "Ya, Selesai"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
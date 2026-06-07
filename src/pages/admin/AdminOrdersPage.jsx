import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus, exportOrders } from "../../services/api";
import { getImageUrl } from "../../services/api";
import { LuChevronDown, LuChevronUp, LuDownload } from "react-icons/lu";

export default function AdminOrdersPage() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // tab aktif: "semua", "diproses", atau "selesai"
    const [activeTab, setActiveTab] = useState("semua");

    // expandedId nyimpen ID order yang lagi dibuka detailnya
    // kalau null berarti semua order sedang tertutup
    const [expandedId, setExpandedId] = useState(null);

    // statusTarget = order yang mau dikonfirmasi selesai
    // dipakai buat isi konten modal konfirmasi
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

    // filter orders berdasarkan tab yang aktif
    // kalau "semua" → tampilkan semua, selainnya → filter by status
    const filteredOrders = orders.filter((order) => {
        if (activeTab === "semua") return true;
        return order.status === activeTab;
    });

    // toggle expand/collapse detail order
    // kalau order yang diklik sudah terbuka → tutup (set null)
    // kalau order lain yang diklik → buka yang itu, tutup yang lama
    function toggleExpand(id) {
        setExpandedId(expandedId === id ? null : id);
    }

    // update status order ke "selesai" setelah admin konfirmasi
    async function handleUpdateStatus() {
        if (!statusTarget) return;
        setStatusLoading(true);
        try {
            await updateOrderStatus(statusTarget.id, { status: "selesai" });
            await loadOrders();
            setStatusTarget(null); // tutup modal setelah berhasil
        } catch (err) {
            alert("Gagal update status pesanan.");
        } finally {
            setStatusLoading(false);
        }
    }

    // export data pesanan ke file Excel
    // cara kerjanya: API kembalikan binary (blob), lalu dibikin jadi link download sementara
    async function handleExport() {
        try {
            const response = await exportOrders();

            // buat object URL dari blob yang diterima
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // buat elemen <a> secara programatik, klik otomatis, lalu hapus
            // ini cara standar buat trigger download file dari JavaScript tanpa buka tab baru
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `pesanan-pawmart-${new Date().toLocaleDateString("id-ID")}.xlsx`
            );
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

            {/* Header: judul + tombol export */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pesanan</h1>
                    <p className="text-sm text-gray-400 mt-1">Kelola semua pesanan masuk</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                    <LuDownload size={16} />
                    Export Excel
                </button>
            </div>

            {/* Tab filter: semua, diproses, selesai */}
            {/* badge di setiap tab dihitung langsung dari array orders */}
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

            {/* List pesanan yang sudah difilter */}
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
                            {/* Baris utama order — klik buat buka/tutup detail */}
                            <div
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition"
                                onClick={() => toggleExpand(order.id)}
                            >
                                <div className="flex items-center gap-4">
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

                                    {/* Info pembeli dan total disembunyikan di layar kecil (hidden md:block) */}
                                    <div className="hidden md:block">
                                        <p className="text-xs text-gray-400">Pembeli</p>
                                        <p className="text-sm font-semibold text-gray-700">
                                            {order.user?.name}
                                        </p>
                                    </div>

                                    <div className="hidden md:block">
                                        <p className="text-xs text-gray-400">Total</p>
                                        <p className="text-sm font-semibold text-orange-500">
                                            {formattedPrice(order.total_price)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* badge warna tergantung status */}
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${order.status === "selesai"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-yellow-100 text-yellow-600"
                                        }`}>
                                        {order.status}
                                    </span>

                                    {/* ikon panah berubah tergantung order ini sedang dibuka atau tidak */}
                                    {expandedId === order.id
                                        ? <LuChevronUp size={18} className="text-gray-400" />
                                        : <LuChevronDown size={18} className="text-gray-400" />
                                    }
                                </div>
                            </div>

                            {/* Bagian detail — hanya muncul kalau expandedId cocok dengan order.id ini */}
                            {expandedId === order.id && (
                                <div className="border-t border-gray-100 p-5">

                                    {/* Info pembeli, alamat, dan bukti bayar dalam 3 kolom */}
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
                                                // kalau ada bukti bayar, tampilkan link yang buka di tab baru
                                                <a
                                                    href={getImageUrl(`/storage/${order.payment_proof}`)}
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

                                    {/* Daftar produk yang dipesan dalam order ini */}
                                    <div className="flex flex-col gap-3 mb-5">
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                            Item Dipesan
                                        </p>
                                        {order.order_items.map((item) => (
                                            <div key={item.id} className="flex gap-3 items-center">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                                    {item.product?.image ? (
                                                        <img
                                                            src={`http://127.0.0.1:8000/storage/${item.product.image}`}
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
                                                    {/* item.price adalah harga snapshot saat transaksi, bukan harga produk sekarang */}
                                                    <p className="text-xs text-gray-400">
                                                        {item.quantity} x {formattedPrice(item.price)}
                                                    </p>
                                                </div>
                                                {/* subtotal per item: quantity dikali harga saat beli */}
                                                <p className="text-sm font-bold text-gray-800">
                                                    {formattedPrice(item.quantity * item.price)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <hr className="border-gray-100 mb-4" />

                                    {/* Total dan tombol konfirmasi */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400">Total Pembayaran</p>
                                            <p className="font-bold text-orange-500 text-lg">
                                                {formattedPrice(order.total_price)}
                                            </p>
                                        </div>

                                        {/* tombol konfirmasi hanya muncul kalau status masih "diproses" */}
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

            {/* MODAL KONFIRMASI UBAH STATUS KE SELESAI */}
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
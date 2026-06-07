import { useState, useEffect } from "react";
import { getProducts, getOrders } from "../../services/api";
import { LuBox, LuClipboardList, LuCircleCheck, LuClock } from "react-icons/lu";

export default function DashboardPage() {

    // semua angka yang ditampilin di stat cards
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        ordersSelesai: 0,
        ordersDiproses: 0,
    });

    // 5 pesanan terbaru untuk ditampilkan di tabel bawah
    const [recentOrders, setRecentOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            // ambil data produk dan order bersamaan biar lebih cepat
            const [productsRes, ordersRes] = await Promise.all([
                getProducts(),
                getOrders(),
            ]);

            const products = productsRes.data.data;
            const orders = ordersRes.data.data;

            // statistik dihitung langsung dari data yang baru diambil
            // filter() dipakai buat ngitung order per status tanpa request tambahan ke API
            setStats({
                totalProducts: products.length,
                totalOrders: orders.length,
                ordersSelesai: orders.filter((o) => o.status === "selesai").length,
                ordersDiproses: orders.filter((o) => o.status === "diproses").length,
            });

            // slice(0, 5) ambil 5 elemen pertama dari array
            // asumsi: API sudah mengembalikan data urut dari yang terbaru
            setRecentOrders(orders.slice(0, 5));

        } catch (err) {
            console.error("Gagal load dashboard:", err);
        } finally {
            setLoading(false);
        }
    }

    // format angka jadi Rupiah, contoh: 75000 → "Rp 75.000"
    const formattedPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm">Memuat dashboard...</p>
            </div>
        );
    }

    return (
        <div>

            {/* Judul halaman */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-sm text-gray-400 mt-1">Selamat datang di panel admin PawMart</p>
            </div>

            {/* 4 stat cards: produk, total order, diproses, selesai */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-400 font-medium">Total Produk</p>
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                            <LuBox size={18} className="text-blue-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-400 font-medium">Total Pesanan</p>
                        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                            <LuClipboardList size={18} className="text-orange-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-400 font-medium">Diproses</p>
                        <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
                            <LuClock size={18} className="text-yellow-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.ordersDiproses}</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-400 font-medium">Selesai</p>
                        <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                            <LuCircleCheck size={18} className="text-green-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.ordersSelesai}</p>
                </div>

            </div>

            {/* Tabel 5 pesanan terbaru */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-bold text-gray-800 mb-4">Pesanan Terbaru</h2>

                {recentOrders.length === 0 ? (
                    <p className="text-gray-400 text-sm">Belum ada pesanan.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b border-gray-100">
                                    <th className="pb-3 font-semibold">ID</th>
                                    <th className="pb-3 font-semibold">Pembeli</th>
                                    <th className="pb-3 font-semibold">Total</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>

                                        <td className="py-3 font-semibold text-gray-800">
                                            #{order.id}
                                        </td>

                                        {/* nama pembeli diambil dari relasi order.user */}
                                        <td className="py-3 text-gray-600">
                                            {order.user?.name}
                                        </td>

                                        <td className="py-3 font-semibold text-gray-800">
                                            {formattedPrice(order.total_price)}
                                        </td>

                                        {/* badge status: hijau kalau selesai, kuning kalau diproses */}
                                        <td className="py-3">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.status === "selesai"
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-yellow-100 text-yellow-600"
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>

                                        {/* format tanggal ke bahasa Indonesia, contoh: "5 Jun 2025" */}
                                        <td className="py-3 text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}
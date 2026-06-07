import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../services/api";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { LuShoppingBag, LuShoppingCart, LuPackageX } from "react-icons/lu";

// ProductCard menerima satu prop: product (objek dari API)
// komponen ini dipakai berulang di halaman katalog untuk setiap produk
export default function ProductCard({ product }) {
    const navigate = useNavigate();

    // loading khusus buat tombol "Tambah ke Keranjang" aja
    // biar tombolnya nggak bisa diklik dua kali saat lagi proses
    const [loading, setLoading] = useState(false);

    // ambil fungsi tambahKeCart dari CartContext
    // setelah berhasil tambah, CartContext otomatis update badge keranjang di navbar
    const { tambahKeCart } = useCart();

    // format harga sekali di awal, nggak perlu dijadikan fungsi
    // karena product.price nggak akan berubah selama card ini hidup
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(product.price);

    // klik gambar atau nama produk → navigasi ke halaman detail
    function handleClickDetail() {
        navigate(`/products/${product.id}`);
    }

    // klik tombol tambah ke keranjang
    // kalau belum login → redirect ke /login dulu
    // kalau sudah login → panggil tambahKeCart dari Context
    async function handleAddToCart() {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        setLoading(true);
        const result = await tambahKeCart(product.id);
        // kalau gagal (misal stok habis di backend), tampilin pesan errornya
        if (!result.success) alert(result.message);
        setLoading(false);
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition group">

            {/* Area gambar — klik navigasi ke detail produk */}
            {/* class "group" di parent dipakai buat trigger animasi scale di sini lewat "group-hover:scale-105" */}
            <div
                className="h-48 w-full overflow-hidden cursor-pointer bg-orange-50"
                onClick={handleClickDetail}
            >
                {product.image_url ? (
                    <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                ) : (
                    // fallback kalau produk belum punya foto
                    <div className="h-full w-full flex items-center justify-center">
                        <LuShoppingBag size={40} className="text-orange-200" />
                    </div>
                )}
            </div>

            {/* Konten teks di bawah gambar */}
            <div className="p-4">

                {/* Nama kategori dari relasi product.category */}
                <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-1">
                    {product.category?.name}
                </p>

                {/* Nama produk — klik juga bisa ke detail */}
                <p
                    className="text-sm font-bold text-gray-800 truncate mb-2 cursor-pointer hover:text-orange-500 transition"
                    onClick={handleClickDetail}
                >
                    {product.name}
                </p>

                <p className="text-base font-bold text-orange-500 mb-3">
                    {formattedPrice}
                </p>

                {/* Tombol tambah ke keranjang — isinya berubah tergantung 3 kondisi:
                    1. loading (sedang proses) → tampilkan teks "Menambahkan..."
                    2. stok habis              → tampilkan "Stok Habis" dan tombol di-disable
                    3. normal                  → tampilkan "Tambah ke Keranjang" */}
                <button
                    onClick={handleAddToCart}
                    disabled={loading || product.stock === 0}
                    className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-500 hover:text-white disabled:bg-gray-50 disabled:text-gray-300 text-orange-500 text-sm font-semibold py-2.5 rounded-xl transition"
                >
                    {loading ? (
                        <>
                            <LuShoppingCart size={15} />
                            Menambahkan...
                        </>
                    ) : product.stock === 0 ? (
                        <>
                            <LuPackageX size={15} />
                            Stok Habis
                        </>
                    ) : (
                        <>
                            <LuShoppingCart size={15} />
                            Tambah ke Keranjang
                        </>
                    )}
                </button>

            </div>
        </div>
    );
}
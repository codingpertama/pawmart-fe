import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../services/api";
import { useState } from "react";
import { useCart } from "../context/CartContext";

// Komponen card satu produk
// Props:
// - product: objek { id, name, price, image_url, category }
export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // format harga ke rupiah, misal 45000 -> "Rp 45.000"
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(product.price);

    // klik gambar/nama produk -> ke halaman detail
    function handleClickDetail() {
        navigate(`/products/${product.id}`);
    }

    const { tambahKeCart } = useCart();

    // klik tombol tambah ke keranjang
    async function handleAddToCart() {
        // cek apakah user sudah login
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);
        const result = await tambahKeCart(product.id);
        if (result.success) {
            alert("Produk berhasil ditambahkan ke keranjang!");
        } else {
            alert(result.message);
        }
        setLoading(false);
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition">

            {/* Gambar produk — klik ke halaman detail */}
            <div
                className="h-52 w-full overflow-hidden cursor-pointer"
                onClick={handleClickDetail}
            >
                {product.image_url ? (
                    <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="h-full w-full object-cover hover:scale-105 transition duration-300"
                    />
                ) : (
                    // placeholder kalau belum ada gambar
                    <div className="h-full w-full bg-orange-50 flex items-center justify-center text-4xl">
                        🛍️
                    </div>
                )}
            </div>

            {/* Info produk */}
            <div className="p-4">
                {/* Nama kategori */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    {product.category?.name}
                </p>

                {/* Nama produk — klik ke halaman detail */}
                <p
                    className="text-base font-bold text-gray-800 truncate mb-3 cursor-pointer hover:text-orange-500 transition"
                    onClick={handleClickDetail}
                >
                    {product.name}
                </p>

                {/* Harga */}
                <p className="text-lg font-bold text-orange-500 mb-3">
                    {formattedPrice}
                </p>

                {/* Tombol tambah ke keranjang */}
                <button
                    onClick={handleAddToCart}
                    disabled={loading || product.stock === 0}
                    className="w-full bg-gray-100 hover:bg-orange-500 hover:text-white disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition"
                >
                    {loading
                        ? "Menambahkan..."
                        : product.stock === 0
                        ? "Stok Habis"
                        : "Tambah ke Keranjang"}
                </button>
            </div>

        </div>
    );
}
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, addToCart, getImageUrl } from "../../services/api";
import { CartContext } from "../../context/CartContext";

export default function ProductDetailPage() {
    const { id } = useParams(); // ambil id dari URL /products/:id
    const navigate = useNavigate();
    const { tambahKeCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // ambil detail produk saat halaman dibuka
    useEffect(() => {
        loadProduct();
    }, [id]);

    async function loadProduct() {
        try {
            const response = await getProductById(id);
            setProduct(response.data.data);
        } catch (err) {
            setError("Produk tidak ditemukan.");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddToCart() {
        // cek login dulu
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        setCartLoading(true);
        setSuccessMsg("");
        setError("");

        const result = await tambahKeCart(product.id);
        if (result.success) {
            setSuccessMsg("Produk berhasil ditambahkan ke keranjang!");
        } else {
            setError(result.message);
        }
        setCartLoading(false);
    }

    // format harga ke rupiah
    const formattedPrice = product
        ? new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(product.price)
        : "";

    // ── LOADING STATE ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400 text-sm">Memuat produk...</p>
            </div>
        );
    }

    // ── ERROR STATE ──
    if (error && !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="text-orange-500 text-sm font-semibold hover:underline"
                    >
                        ← Kembali ke beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">

            {/* Tombol back */}
            <button
                onClick={() => navigate(-1)}
                className="text-sm text-gray-400 hover:text-orange-500 font-semibold mb-6 flex items-center gap-1 transition"
            >
                ← Kembali
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Gambar produk */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-orange-50 h-80">
                    {product.image_url ? (
                        <img
                            src={getImageUrl(product.image_url)}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-6xl">
                            🛍️
                        </div>
                    )}
                </div>

                {/* Info produk */}
                <div className="flex flex-col justify-between">
                    <div>
                        {/* Kategori */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            {product.category?.name}
                        </p>

                        {/* Nama produk */}
                        <h1 className="text-2xl font-bold text-gray-800 mb-3">
                            {product.name}
                        </h1>

                        {/* Harga */}
                        <p className="text-3xl font-bold text-orange-500 mb-4">
                            {formattedPrice}
                        </p>

                        {/* Deskripsi */}
                        {product.description && (
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                {product.description}
                            </p>
                        )}

                        {/* Stok */}
                        <p className="text-sm text-gray-400 mb-6">
                            Stok tersedia:{" "}
                            <span className={`font-semibold ${product.stock > 0 ? "text-green-500" : "text-red-400"}`}>
                                {product.stock > 0 ? `${product.stock} item` : "Habis"}
                            </span>
                        </p>
                    </div>

                    {/* Pesan sukses / error */}
                    {successMsg && (
                        <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-3 mb-4">
                            {successMsg}
                        </div>
                    )}
                    {error && product && (
                        <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    {/* Tombol aksi */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={cartLoading || product.stock === 0}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white font-semibold py-3 rounded-xl transition"
                        >
                            {cartLoading
                                ? "Menambahkan..."
                                : product.stock === 0
                                    ? "Stok Habis"
                                    : "Tambah ke Keranjang"}
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
                        >
                            Lanjut Belanja
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
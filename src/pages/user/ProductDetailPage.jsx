import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getImageUrl } from "../../services/api";
import { CartContext } from "../../context/CartContext";
import { LuShoppingBag, LuArrowLeft } from "react-icons/lu";

export default function ProductDetailPage() {
    // id diambil dari URL, misal /products/3 → id = "3"
    const { id } = useParams();
    const navigate = useNavigate();
    const { tambahKeCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // [id] di dependency array artinya useEffect jalan ulang
    // kalau id di URL berubah, misal pindah dari /products/1 ke /products/2
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
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        setCartLoading(true);
        setSuccessMsg("");
        setError("");

        // tambahKeCart dari CartContext — fungsi ini sekaligus update badge navbar
        const result = await tambahKeCart(product.id);
        if (result.success) {
            setSuccessMsg("Produk berhasil ditambahkan ke keranjang!");
        } else {
            setError(result.message);
        }
        setCartLoading(false);
    }

    const formattedPrice = product
        ? new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(product.price)
        : "";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-400 text-sm">Memuat produk...</p>
            </div>
        );
    }

    // kalau produk tidak ditemukan, tampilkan error fullpage
    if (error && !product) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
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

            {/* navigate(-1) berarti balik ke halaman sebelumnya di history browser */}
            <button
                onClick={() => navigate(-1)}
                className="text-sm text-gray-400 hover:text-orange-500 font-semibold mb-6 flex items-center gap-1 transition"
            >
                <LuArrowLeft size={16} />
                Kembali
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* gambar produk */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-orange-50 h-80">
                    {product.image_url ? (
                        <img
                            src={getImageUrl(product.image_url)}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <LuShoppingBag size={48} className="text-orange-200" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">
                            {product.category?.name}
                        </p>

                        <h1 className="text-2xl font-bold text-gray-800 mb-3">
                            {product.name}
                        </h1>

                        <p className="text-3xl font-bold text-orange-500 mb-4">
                            {formattedPrice}
                        </p>

                        {/* deskripsi hanya ditampilkan kalau ada isinya */}
                        {product.description && (
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                {product.description}
                            </p>
                        )}

                        {/* warna stok berubah tergantung kondisi — hijau kalau ada, merah kalau habis */}
                        <p className="text-sm text-gray-400 mb-6">
                            Stok tersedia:{" "}
                            <span className={`font-semibold ${product.stock > 0 ? "text-green-500" : "text-red-400"}`}>
                                {product.stock > 0 ? `${product.stock} item` : "Habis"}
                            </span>
                        </p>
                    </div>

                    {successMsg && (
                        <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-3 mb-4">
                            {successMsg}
                        </div>
                    )}

                    {/* error ini hanya muncul kalau produk ada tapi ada error lain, misal stok habis */}
                    {error && product && (
                        <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

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
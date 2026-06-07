import { useState, useEffect } from "react";
import { getProducts, getCategories } from "../../services/api";
import ProductCard from "../../components/ProductCard";

export default function ProductsPage() {
    // ── STATE ──────────────────────────────────────────────────────────────
    const [products, setProducts] = useState([]);       // semua produk dari API
    const [categories, setCategories] = useState([]);   // daftar kategori dari API
    const [search, setSearch] = useState("");           // kata kunci pencarian
    const [activeCat, setActiveCat] = useState(null);   // null = semua kategori
    const [loading, setLoading] = useState(true);

    // ── LOAD DATA ──────────────────────────────────────────────────────────
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // ambil produk dan kategori secara bersamaan biar lebih cepat
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts(),
                getCategories(),
            ]);
            setProducts(productsRes.data.data);
            setCategories(categoriesRes.data.data);
        } catch (err) {
            console.error("Gagal ambil data:", err);
        } finally {
            setLoading(false);
        }
    };

    // ── FILTER LOGIC ───────────────────────────────────────────────────────
    // filter produk berdasarkan search dan kategori aktif
    const filteredProducts = products.filter((p) => {
        // cocokkan nama produk dengan kata kunci (case-insensitive)
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        // kalau activeCat null berarti "Semua", skip filter kategori
        const matchCat = activeCat === null || p.category_id === activeCat;
        return matchSearch && matchCat;
    });

    // ── LOADING STATE ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-sm text-gray-400">Memuat produk...</p>
            </div>
        );
    }

    // ── RENDER ─────────────────────────────────────────────────────────────
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">

            {/* ── Header ── */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Semua Produk</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Temukan produk terbaik untuk hewan peliharaanmu
                </p>
            </div>

            {/* ── Search bar ── */}
            <div className="relative mb-4">
                {/* icon search di kiri */}
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    🔍
                </span>
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-orange-400 transition"
                />
            </div>

            {/* ── Filter chip kategori ── */}
            <div className="flex gap-2 flex-wrap mb-6">
                {/* chip "Semua" — aktif kalau activeCat null */}
                <button
                    onClick={() => setActiveCat(null)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        activeCat === null
                            ? "bg-orange-500 text-white"
                            : "bg-white border border-gray-200 text-gray-500 hover:bg-orange-50"
                    }`}
                >
                    Semua
                </button>

                {/* chip per kategori — dari API */}
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCat(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                            activeCat === cat.id
                                ? "bg-orange-500 text-white"
                                : "bg-white border border-gray-200 text-gray-500 hover:bg-orange-50"
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* ── Label jumlah hasil ── */}
            <p className="text-sm text-gray-400 mb-4">
                Menampilkan{" "}
                <span className="font-semibold text-gray-600">
                    {filteredProducts.length}
                </span>{" "}
                produk
            </p>

            {/* ── Grid produk ── */}
            {filteredProducts.length === 0 ? (
                // tampilan kalau hasil filter kosong
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-5xl mb-4">😿</p>
                    <p className="text-gray-500 font-semibold">Produk tidak ditemukan</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Coba kata kunci lain atau pilih kategori berbeda
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        // pakai ProductCard yang sama persis dengan homepage
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
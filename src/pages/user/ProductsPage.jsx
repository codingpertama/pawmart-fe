import { useState, useEffect } from "react";
import { getProducts, getCategories } from "../../services/api";
import ProductCard from "../../components/ProductCard";
import { LuSearch, LuPackageSearch } from "react-icons/lu";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [activeCat, setActiveCat] = useState(null); // null berarti semua kategori ditampilkan
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // ambil produk dan kategori sekaligus pakai Promise.all
            // lebih cepat dari nunggu satu-satu karena keduanya jalan paralel
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
    }

    // filter dijalankan setiap kali search atau activeCat berubah
    // tidak perlu useEffect karena ini cuma komputasi dari state yang sudah ada
    const filteredProducts = products.filter((p) => {
        // cek apakah nama produk mengandung kata kunci pencarian
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        // kalau activeCat null, semua kategori lolos filter
        const matchCat = activeCat === null || p.category_id === activeCat;
        return matchSearch && matchCat;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-sm text-gray-400">Memuat produk...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Semua Produk</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Temukan produk terbaik untuk hewan peliharaanmu
                </p>
            </div>

            {/* search bar — value dikontrol React lewat state search */}
            <div className="relative mb-4">
                <LuSearch
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
            </div>

            {/* chip filter kategori — diklik untuk set activeCat */}
            <div className="flex gap-2 flex-wrap mb-6">
                {/* chip "Semua" — set activeCat ke null untuk reset filter */}
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

                {/* chip per kategori dari API */}
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

            <p className="text-sm text-gray-400 mb-4">
                Menampilkan{" "}
                <span className="font-semibold text-gray-600">{filteredProducts.length}</span>{" "}
                produk
            </p>

            {filteredProducts.length === 0 ? (
                // tampilan kalau tidak ada produk yang cocok dengan filter
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <LuPackageSearch size={28} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-semibold">Produk tidak ditemukan</p>
                    <p className="text-sm text-gray-400">
                        Coba kata kunci lain atau pilih kategori berbeda
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
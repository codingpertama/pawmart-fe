import { useState, useEffect } from "react";
import ProductCard from "./components/ProductCard";
import { getProducts } from "./services/api";
import HeroSection from "./components/HeroSection";

export default function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // ambil data produk dari API saat halaman pertama kali dibuka
    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const response = await getProducts();
            // ambil 4 produk pertama saja untuk ditampilkan di homepage
            setProducts(response.data.data.slice(0, 4));
        } catch (err) {
            console.error("Gagal ambil produk:", err);
            setProducts([]); // set products ke kosong biar gak undefined
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {/* Banner hero */}
            <HeroSection />

            {/* Section produk unggulan */}
            <div id="produk">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Produk Unggulan</h2>
                        <p className="text-sm text-gray-400">Pilihan terbaik untuk kebahagiaan mereka</p>
                    </div>
                    {/* Link ke halaman semua produk - nanti disambungin */}
                    <a href="/products" className="text-sm font-semibold text-orange-500 hover:underline">
                        Lihat Semua →
                    </a>
                </div>

                {loading ? (
                    // tampilan saat data masih loading
                    <p className="text-sm text-gray-400">Memuat produk...</p>
                ) : products.length === 0 ? (
                    // tampilan kalau produk kosong
                    <p className="text-sm text-gray-400">Belum ada produk tersedia.</p>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
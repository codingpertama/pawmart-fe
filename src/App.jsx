import { useState, useEffect } from "react";
import ProductCard from "./components/ProductCard";
import { getProducts } from "./services/api";
import HeroSection from "./components/HeroSection";

export default function App() {
    // products: array produk yang ditampilkan di homepage
    // loading: true selama data belum datang dari API
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect dengan [] artinya fungsi di dalamnya cuma jalan
    // sekali, pas pertama kali halaman dibuka — mirip "onMount"
    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const response = await getProducts();

            // response.data → isi JSON dari Laravel
            // response.data.data → array produknya (sesuai format { success, message, data })
            // .slice(0, 4) → ambil 4 elemen pertama aja buat homepage
            setProducts(response.data.data.slice(0, 4));
        } catch (err) {
            console.error("Gagal ambil produk:", err);
            setProducts([]);
        } finally {
            // finally selalu jalan, baik sukses maupun gagal
            // jadi loading pasti berhenti walau API error
            setLoading(false);
        }
    }

    return (
        <div>
            <HeroSection />

            <div id="produk">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Produk Unggulan</h2>
                        <p className="text-sm text-gray-400">Pilihan terbaik untuk kebahagiaan mereka</p>
                    </div>
                    <a href="/products" className="text-sm font-semibold text-orange-500 hover:underline">
                        Lihat Semua →
                    </a>
                </div>

                {/* Rendering kondisional:
                    - kalau masih loading → tampilkan teks loading
                    - kalau produk kosong → tampilkan pesan kosong
                    - kalau ada produk → tampilkan grid */}
                {loading ? (
                    <p className="text-sm text-gray-400">Memuat produk...</p>
                ) : products.length === 0 ? (
                    <p className="text-sm text-gray-400">Belum ada produk tersedia.</p>
                ) : (
                    // key={product.id} wajib ada saat render list
                    // supaya React bisa track perubahan tiap item
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
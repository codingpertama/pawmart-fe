export default function UserFooter() {
    return (
        <footer className="bg-white border-t border-gray-100 mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-10">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <img src="/images/logo-pawmart.jpg" alt="PawMart Logo" className="w-8 h-8 rounded-lg object-cover" />
                            <span className="font-bold text-xl text-gray-800">
                                Paw<span className="text-orange-500">Mart</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Toko perlengkapan hewan peliharaan terpercaya. Semua kebutuhan anabul tersedia di sini.
                        </p>
                    </div>

                    {/* Navigasi */}
                    <div>
                        <p className="font-bold text-gray-800 mb-3">Navigasi</p>
                        <div className="flex flex-col gap-2">
                            <a href="/" className="text-sm text-gray-400 hover:text-orange-500 transition">Beranda</a>
                            <a href="/products" className="text-sm text-gray-400 hover:text-orange-500 transition">Semua Produk</a>
                            <a href="/cart" className="text-sm text-gray-400 hover:text-orange-500 transition">Keranjang</a>
                            <a href="/orders" className="text-sm text-gray-400 hover:text-orange-500 transition">Pesanan Saya</a>
                        </div>
                    </div>

                    {/* Kontak */}
                    <div>
                        <p className="font-bold text-gray-800 mb-3">Kontak</p>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-400">pawmart@email.com</p>
                            <p className="text-sm text-gray-400">0812-3456-7890</p>
                            <p className="text-sm text-gray-400">Bogor, Jawa Barat</p>
                        </div>
                    </div>

                </div>

                <hr className="border-gray-100 mb-6" />

                {/* Copyright */}
                <p className="text-center text-xs text-gray-300">
                    © 2025 PawMart. All rights reserved. — Dibuat oleh Rafa hafiz.
                </p>

            </div>
        </footer>
    );
}
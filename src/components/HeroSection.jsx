import { Link } from 'react-router-dom';

export default function HeroSection() {
    return (
        <section className="bg-[#FEFAF3] rounded-3xl px-14 py-16 flex items-center justify-between gap-12 mb-10 min-h-[380px]">

            {/* Kolom kiri */}
            <div className="flex-1 flex flex-col items-start">
                <h1 className="text-[38px] font-semibold leading-[1.2] text-[#1a1208] mb-4">
                    Semua Kebutuhan
                    Hewan Peliharaan
                    <span className="text-[#C87941]"> Ada di Sini</span>
                </h1>

                <p className="text-sm text-gray-400 leading-relaxed mb-9 max-w-xs">
                    Produk premium untuk kucing, anjing, dan hewan
                    peliharaanmu — kualitas terbaik, harga terjangkau.
                </p>

                <Link
                    to="/products"
                    className="bg-[#7B4E2D] hover:bg-[#6a4126] text-white text-sm font-semibold px-7 py-3 rounded-full transition-colors duration-200"
                >
                    Belanja Sekarang
                </Link>
            </div>

            {/* Kolom kanan — foto */}
            <img
                src="/images/cat-dog.png"
                alt="hewan peliharaan"
                className="flex-shrink-0 w-[320px] h-[300px] object-cover rounded-[20px]"
            />

        </section>
    );
}
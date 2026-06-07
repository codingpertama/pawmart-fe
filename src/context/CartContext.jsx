import { createContext, useState, useContext, useEffect } from "react";
import { addToCart, getCarts } from "../services/api";

// createContext() bikin "channel" baru
// nantinya semua komponen yang mau akses data cart harus subscribe ke channel ini
export const CartContext = createContext();

// CartProvider adalah komponen pembungkus
// dia yang pegang state cartCount dan semua fungsi yang berhubungan dengan cart
// cara pakainya: bungkus seluruh aplikasi pakai <CartProvider> di App.jsx atau main.jsx
// setelah itu, komponen manapun di dalam bungkusan itu bisa akses data cart lewat useCart()
export default function CartProvider({ children }) {

    // angka yang muncul di badge ikon keranjang
    const [cartCount, setCartCount] = useState(0);

    // langsung fetch jumlah cart pas aplikasi pertama kali dibuka
    // biar badge keranjang langsung akurat tanpa perlu klik dulu
    useEffect(() => {
        fetchCartCount();
    }, []);

    // minta data cart ke API, ambil total_items-nya, simpan ke state
    // kalau user belum login (nggak ada token), langsung set 0 aja tanpa hit API
    async function fetchCartCount() {
        const token = localStorage.getItem("token");
        if (!token) {
            setCartCount(0);
            return;
        }
        try {
            const response = await getCarts();
            setCartCount(response.data.data.total_items);
        } catch {
            // kalau API error (misal token expired), anggap cart kosong
            setCartCount(0);
        }
    }

    // fungsi buat tambah produk ke cart
    // selalu kirim quantity 1 dulu — kalau produk sudah ada di cart, backend yang handle penambahan qty
    // setelah berhasil, langsung refetch cart count biar badge di navbar update otomatis
    // return object { success, message } biar komponen yang manggil bisa tau hasilnya
    async function tambahKeCart(productId) {
        try {
            await addToCart({ product_id: productId, quantity: 1 });
            await fetchCartCount();
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Gagal menambahkan ke keranjang.";
            return { success: false, message };
        }
    }

    // reset count ke 0 tanpa hit API
    // dipanggil setelah checkout berhasil atau user logout
    // biar badge keranjang langsung hilang/reset tanpa nunggu fetch lagi
    function clearCartCount() {
        setCartCount(0);
    }

    // value berisi semua yang mau "disiarkan" ke komponen lain
    // komponen yang pakai useCart() bisa akses: cartCount, fetchCartCount, tambahKeCart, clearCartCount
    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount, tambahKeCart, clearCartCount }}>
            {children}
        </CartContext.Provider>
    );
}

// custom hook ini cuma shortcut biar nggak perlu nulis useContext(CartContext) setiap kali
// tanpa ini: const { cartCount } = useContext(CartContext)  ← harus import CartContext juga
// dengan ini: const { cartCount } = useCart()              ← lebih bersih
export function useCart() {
    return useContext(CartContext);
}
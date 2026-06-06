import { createContext, useState, useContext, useEffect } from "react";
import { addToCart, getCarts } from "../services/api";

export const CartContext = createContext();

export default function CartProvider({ children }) {
    const [cartCount, setCartCount] = useState(0);

    // fetch cart count saat pertama kali load
    useEffect(() => {
        fetchCartCount();
    }, []);

    // ambil jumlah cart dari API, simpan ke state
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
            setCartCount(0);
        }
    }

    // tambah produk ke cart via API
    async function tambahKeCart(productId) {
        try {
            await addToCart({ product_id: productId, quantity: 1 });
            // setelah berhasil, update count
            await fetchCartCount();
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Gagal menambahkan ke keranjang.";
            return { success: false, message };
        }
    }

    // reset cart count ke 0 (dipanggil setelah checkout atau logout)
    function clearCartCount() {
        setCartCount(0);
    }

    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount, tambahKeCart, clearCartCount }}>
            {children}
        </CartContext.Provider>
    );
}

// custom hook biar gampang dipanggil
export function useCart() {
    return useContext(CartContext);
}
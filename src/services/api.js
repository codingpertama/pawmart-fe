import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000"; // ← pisahin base URL

const api = axios.create({
    baseURL: `${BASE_URL}/api`, // ← pakai variable
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// interceptor: otomatis sisipkan token JWT ke setiap request kalau ada
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// helper konversi image_url jadi URL lengkap
// "/storage/products/xxx.jpg" → "http://127.0.0.1:8000/storage/products/xxx.jpg"
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${BASE_URL}${imagePath}`;
};

// ── AUTH ──
export const register = (data) => api.post("/register", data);
export const login = (data) => api.post("/login", data);
export const logout = () => api.post("/logout");
export const profile = () => api.get("/profile");
export const getProducts = () => api.get("/products");
export const getProductById = (id) => api.get(`/products/${id}`);
export const addToCart = (data) => api.post("/carts", data);
export const getCarts = () => api.get("/carts");
export const updateCart = (id, data) => api.put(`/carts/${id}`, data);
export const deleteCart = (id) => api.delete(`/carts/${id}`);

export default api;
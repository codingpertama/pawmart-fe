import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000"; // ← pisahin base URL

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
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

    // kalau body-nya FormData, hapus Content-Type
    // biar axios set otomatis dengan boundary yang benar
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }

    return config;
});

// kalau dapat 401 dari API → token expired → auto logout
api.interceptors.response.use(
    (response) => response, // kalau sukses, terusin aja
    (error) => {
        if (error.response?.status === 401) {
            // hapus data login dari localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // redirect ke halaman login
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

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
export const createOrder = (data) => api.post("/orders", data);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const uploadPayment = (id, data) => api.post(`/orders/${id}/payment`, data);
export const getOrders = () => api.get("/orders");

export const getCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.post(`/products/${id}`, data); // POST bukan PUT
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
export const exportOrders = () => api.get("/export/orders", { responseType: "blob" }); // blob penting untuk file download

export default api;
import axios from "axios";

// base URL backend — ganti ini kalau deploy ke server lain
const BASE_URL = "http://127.0.0.1:8000";

// buat instance axios dengan konfigurasi default
// semua request di project ini pakai instance 'api' ini, bukan axios langsung
const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// REQUEST INTERCEPTOR
// jalan otomatis sebelum setiap request dikirim
api.interceptors.request.use((config) => {
    // kalau ada token di localStorage, sisipkan ke header Authorization
    // format JWT: "Bearer <token>"
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // kalau body request berupa FormData (ada file yang diupload),
    // hapus Content-Type supaya axios bisa set sendiri dengan boundary yang benar
    // tanpa boundary, Laravel tidak bisa baca file yang dikirim
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }

    return config;
});

// RESPONSE INTERCEPTOR
// jalan otomatis setelah setiap response diterima
api.interceptors.response.use(
    // kalau response sukses (2xx), langsung terusin
    (response) => response,

    // kalau response error
    (error) => {
        // 401 = Unauthenticated → token expired atau tidak valid
        // paksa logout dan redirect ke login
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        // lempar error ke pemanggil supaya bisa di-catch di komponen
        return Promise.reject(error);
    }
);

// HELPER

// konversi path gambar relatif dari API jadi URL lengkap yang bisa ditampilkan
// contoh: "/storage/products/xxx.jpg" → "http://127.0.0.1:8000/storage/products/xxx.jpg"
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${BASE_URL}${imagePath}`;
};

// AUTH
export const register = (data) => api.post("/register", data);
export const login    = (data) => api.post("/login", data);
export const logout   = ()     => api.post("/logout");
export const profile  = ()     => api.get("/profile");

// PRODUCTS
export const getProducts    = ()         => api.get("/products");
export const getProductById = (id)       => api.get(`/products/${id}`);
export const createProduct  = (data)     => api.post("/products", data);
export const updateProduct  = (id, data) => api.post(`/products/${id}`, data); // POST bukan PUT karena ada upload file (multipart/form-data tidak support PUT)
export const deleteProduct  = (id)       => api.delete(`/products/${id}`);

// CATEGORIES
export const getCategories    = ()         => api.get("/categories");
export const createCategory   = (data)     => api.post("/categories", data);
export const updateCategory   = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory   = (id)       => api.delete(`/categories/${id}`);

// CART
export const getCarts    = ()         => api.get("/carts");
export const addToCart   = (data)     => api.post("/carts", data);
export const updateCart  = (id, data) => api.put(`/carts/${id}`, data);
export const deleteCart  = (id)       => api.delete(`/carts/${id}`);

// ORDERS
export const getOrders         = ()         => api.get("/orders");
export const getOrderById      = (id)       => api.get(`/orders/${id}`);
export const createOrder       = (data)     => api.post("/orders", data);
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);

// upload bukti bayar — dikirim sebagai FormData karena ada file foto
export const uploadPayment = (id, data) => api.post(`/orders/${id}/payment`, data);

// export Excel — responseType blob karena response-nya file biner, bukan JSON
export const exportOrders = () => api.get("/export/orders", { responseType: "blob" });

export default api;
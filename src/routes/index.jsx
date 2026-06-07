import { createBrowserRouter } from "react-router-dom";
import { authMiddleware, authLogin, adminMiddleware } from "../middleware/auth";

import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import App from "../App";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import CartPage from "../pages/user/CartPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import PaymentPage from "../pages/user/PaymentPage";
import OrdersPage from "../pages/user/OrderPage";
import ProductsPageUser from "../pages/user/ProductsPage";

import DashboardPage from "../pages/admin/DashboardPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import ProductsPage from "../pages/admin/ProductsPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";

export const router = createBrowserRouter([

    // halaman publik dan auth, semua pakai UserLayout
    // login dan register punya loader authLogin supaya kalau sudah login
    // tidak bisa balik ke halaman ini, langsung redirect ke home
    {
        path: "/",
        element: <UserLayout />,
        children: [
            { path: "/",            element: <App /> },
            { path: "/products",    element: <ProductsPageUser /> },
            { path: "/products/:id",element: <ProductDetailPage /> },
            { path: "/login",       element: <LoginPage />,    loader: authLogin },
            { path: "/register",    element: <RegisterPage />, loader: authLogin },
        ],
    },

    // halaman yang butuh login, loader authMiddleware akan redirect ke /login
    // kalau user belum punya token di localStorage
    {
        path: "/",
        element: <UserLayout />,
        loader: authMiddleware,
        children: [
            { path: "/cart",                 element: <CartPage /> },
            { path: "/checkout",             element: <CheckoutPage /> },
            { path: "/orders",               element: <OrdersPage /> },
            { path: "/orders/:id/payment",   element: <PaymentPage /> },
        ],
    },

    // halaman admin, loader adminMiddleware cek dua hal:
    // 1. user sudah login (ada token)
    // 2. role user adalah admin
    // kalau salah satu tidak terpenuhi, redirect ke halaman yang sesuai
    {
        path: "/admin",
        element: <AdminLayout />,
        loader: adminMiddleware,
        children: [
            { path: "/admin/dashboard",  element: <DashboardPage /> },
            { path: "/admin/categories", element: <CategoriesPage /> },
            { path: "/admin/products",   element: <ProductsPage /> },
            { path: "/admin/orders",     element: <AdminOrdersPage /> },
        ],
    },
]);
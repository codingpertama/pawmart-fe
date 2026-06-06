import { createBrowserRouter } from "react-router-dom";
import { authMiddleware, authLogin, adminMiddleware } from "../middleware/auth";

// layouts
import UserLayout from "../layouts/UserLayout";
// import AdminLayout from "../layouts/AdminLayout";

// pages - auth
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// pages - user
import App from "../App";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import CartPage from "../pages/user/CartPage";
// import CheckoutPage from "../pages/user/CheckoutPage";
// import OrdersPage from "../pages/user/OrdersPage";

// // pages - admin
// import DashboardPage from "../pages/admin/DashboardPage";
// import CategoriesPage from "../pages/admin/CategoriesPage";
// import ProductsPage from "../pages/admin/ProductsPage";
// import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
// import UsersPage from "../pages/admin/UsersPage";

export const router = createBrowserRouter([
    // Public & Auth routes under UserLayout
    {
        path: "/",
        element: <UserLayout />,
        children: [
            {
                path: "/",
                element: <App />,
            },
            {
                path: "/products/:id",
                element: <ProductDetailPage/>
            },
            {
                path: "/login",
                element: <LoginPage />,
                loader: authLogin,
            },
            {
                path: "/register",
                element: <RegisterPage />,
                loader: authLogin,
            },
        ],
    },

    // User routes (butuh login)
    {
        path: "/",
        element: <UserLayout />,
        loader: authMiddleware,
        children: [
            {
                path: "/cart",
                element: <CartPage />,
            },
    //         {
    //             path: "/checkout",
    //             element: <CheckoutPage />,
    //         },
    //         {
    //             path: "/orders",
    //             element: <OrdersPage />,
    //         },
        ],
    },

    // // Admin routes (butuh login + role admin)
    // {
    //     path: "/admin",
    //     element: <AdminLayout />,
    //     loader: adminMiddleware,
    //     children: [
    //         {
    //             path: "/admin/dashboard",
    //             element: <DashboardPage />,
    //         },
    //         {
    //             path: "/admin/categories",
    //             element: <CategoriesPage />,
    //         },
    //         {
    //             path: "/admin/products",
    //             element: <ProductsPage />,
    //         },
    //         {
    //             path: "/admin/orders",
    //             element: <AdminOrdersPage />,
    //         },
    //         {
    //             path: "/admin/users",
    //             element: <UsersPage />,
    //         },
    //     ],
    // },
]);
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";

export default function LoginPage() {
    const [formValue, setFormValue] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // validasi form sebelum kirim ke API
    function handleSubmitForm() {
        if (formValue.email == "" || formValue.password == "") {
            setError("Pastikan email dan password terisi.");
        } else {
            setError("");
            // lanjut ke fungsi API
            authLogin();
        }
    }

    // fungsi login ke API pakai axios
    async function authLogin() {
        setLoading(true);
        try {
            const response = await login(formValue);
            const data = response.data;

            console.log("response:", data); // ← tambah ini

            // simpan token dan data user ke localStorage
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            // redirect berdasarkan role
            if (data.data.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }

        } catch (err) {
            const message = err.response?.data?.message || "Email atau password salah.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <img src="/logo.png" alt="Logo PawMart" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-2xl text-gray-800">
                        Paw<span className="text-orange-500">Mart</span>
                    </span>
                </div>

                {/* Card form */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">

                    <h1 className="text-xl font-bold text-gray-800 mb-1">Masuk ke akun kamu</h1>
                    <p className="text-sm text-gray-400 mb-6">
                        Belum punya akun?{" "}
                        <a href="/register" className="text-orange-500 font-semibold hover:underline">
                            Daftar di sini
                        </a>
                    </p>

                    {/* Pesan error */}
                    {error != "" && (
                        <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Email</label>
                            <input
                                type="email"
                                placeholder="contoh@email.com"
                                onChange={(e) => setFormValue({ ...formValue, email: e.target.value })}
                                className="..."
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Password</label>
                            <input
                                type="password"
                                placeholder="Masukkan password"
                                onChange={(e) => setFormValue({ ...formValue, password: e.target.value })}
                                className="..."
                            />
                        </div>

                        {/* Tombol submit */}
                        <button
                            type="button"
                            onClick={handleSubmitForm}
                            disabled={loading}
                            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold text-sm h-11 rounded-xl transition mt-1"
                        >
                            {loading ? "Sedang masuk..." : "Masuk"}
                        </button>

                    </div>

                </div>

                <p className="text-center text-xs text-gray-300 mt-6">
                    © 2025 PawMart. All rights reserved.
                </p>

            </div>
        </div>
    );
}
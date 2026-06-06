import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/api";

export default function RegisterPage() {
    const [formValue, setFormValue] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // validasi form sebelum kirim ke API
    function handleSubmitForm() {
        if (formValue.name == "" || formValue.email == "" || formValue.password == "") {
            setError("Pastikan nama, email, dan password terisi.");
        } else {
            setError("");
            authRegister();
        }
    }

    // fungsi register ke API pakai axios
    async function authRegister() {
        setLoading(true);
        try {
            const response = await register(formValue);
            const data = response.data;

            // simpan token dan data user ke localStorage (sama kayak login)
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            // langsung redirect ke home, gak perlu login lagi
            navigate("/");

        } catch (err) {
            const message = err.response?.data?.message || "Registrasi gagal. Coba lagi.";
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

                    <h1 className="text-xl font-bold text-gray-800 mb-1">Buat akun baru</h1>
                    <p className="text-sm text-gray-400 mb-6">
                        Sudah punya akun?{" "}
                        <a href="/login" className="text-orange-500 font-semibold hover:underline">
                            Masuk di sini
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
                            <label className="text-sm font-semibold text-gray-600">Nama lengkap</label>
                            <input
                                type="text"
                                placeholder="Rafa Kurnia"
                                onchange={(e) => setFormValue({ ...formValue, name: e.target.value })}
                                className="border border-gray-200 rounded-xl px-4 h-11 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Email</label>
                            <input
                                type="email"
                                placeholder="contoh@email.com"
                                onchange={(e) => setFormValue({ ...formValue, email: e.target.value })}
                                className="border border-gray-200 rounded-xl px-4 h-11 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">
                                No. HP{" "}
                                <span className="text-gray-300 font-normal">(opsional)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="08xxxxxxxxxx"
                                onchange={(e) => setFormValue({ ...formValue, phone: e.target.value })}
                                className="border border-gray-200 rounded-xl px-4 h-11 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Password</label>
                            <input
                                type="password"
                                placeholder="Minimal 8 karakter"
                                onchange={(e) => setFormValue({ ...formValue, password: e.target.value })}
                                className="border border-gray-200 rounded-xl px-4 h-11 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmitForm}
                            disabled={loading}
                            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold text-sm h-11 rounded-xl transition mt-1"
                        >
                            {loading ? "Sedang mendaftar..." : "Daftar"}
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
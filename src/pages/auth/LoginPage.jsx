import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/api";
import { LuMail, LuLock, LuArrowRight, LuEye, LuEyeOff } from "react-icons/lu";

export default function LoginPage() {

    // form login cuma butuh 2 field: email dan password
    const [formValue, setFormValue] = useState({ email: "", password: "" });

    // state error buat tampilin pesan kalau login gagal
    const [error, setError] = useState("");

    // loading buat disable tombol pas nunggu response dari API
    const [loading, setLoading] = useState(false);

    // toggle show/hide teks password
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    // validasi dulu sebelum kirim ke API
    // kalau email atau password kosong, stop di sini dan tampilin error
    function handleSubmitForm() {
        if (!formValue.email || !formValue.password) {
            setError("Pastikan email dan password terisi.");
            return;
        }
        setError("");
        authLogin();
    }

    // fungsi yang hit API login
    // bedanya sama register: setelah berhasil, redirect-nya tergantung role user
    // kalau admin → ke dashboard, kalau user biasa → ke halaman utama
    async function authLogin() {
        setLoading(true);
        try {
            const response = await login(formValue);
            const data = response.data;

            // simpen token dan data user di localStorage
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            // cek role, terus arahkan ke halaman yang sesuai
            if (data.data.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            // kalau backend kasih pesan error, tampilin itu — kalau nggak ada, pakai fallback
            const message = err.response?.data?.message || "Email atau password salah.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    // biar bisa submit pakai Enter, nggak harus klik tombol
    function handleKeyDown(e) {
        if (e.key === "Enter") handleSubmitForm();
    }

    return (
        <div className="flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">

                {/* Logo di atas card */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <img src="/images/logo-pawmart.jpg" alt="Logo PawMart" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-2xl text-gray-800">
                        Paw<span className="text-orange-500">Mart</span>
                    </span>
                </div>

                {/* Card form login */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                    <h1 className="text-xl font-bold text-gray-800 mb-1">Selamat datang kembali</h1>
                    <p className="text-sm text-gray-400 mb-6">
                        Belum punya akun?{" "}
                        <Link to="/register" className="text-orange-500 font-semibold hover:underline">
                            Daftar di sini
                        </Link>
                    </p>

                    {/* Kotak error hanya muncul kalau state error ada isinya */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">

                        {/* Input email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Email</label>
                            <div className="relative">
                                {/* ikon pakai absolute biar posisinya di dalam input tanpa ganggu layout */}
                                <LuMail
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                                <input
                                    type="email"
                                    placeholder="contoh@email.com"
                                    onChange={(e) => setFormValue({ ...formValue, email: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-4 h-11 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                />
                            </div>
                        </div>

                        {/* Input password dengan toggle show/hide */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Password</label>
                            <div className="relative">
                                <LuLock
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                                {/* type-nya dinamis: kalau showPassword true → text, kalau false → password (tersembunyi) */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan password"
                                    onChange={(e) => setFormValue({ ...formValue, password: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-10 h-11 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                />
                                {/* tombol mata di kanan untuk toggle lihat/sembunyikan password */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Tombol masuk — otomatis disabled pas loading biar nggak bisa diklik dua kali */}
                        <button
                            type="button"
                            onClick={handleSubmitForm}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold text-sm h-11 rounded-xl transition mt-1"
                        >
                            {loading ? (
                                "Sedang masuk..."
                            ) : (
                                <>
                                    Masuk
                                    <LuArrowRight size={16} />
                                </>
                            )}
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
}
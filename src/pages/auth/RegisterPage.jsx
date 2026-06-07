import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/api";
import { LuUser, LuMail, LuPhone, LuLock, LuArrowRight, LuEye, LuEyeOff } from "react-icons/lu";

export default function RegisterPage() {

    // state buat nyimpen nilai tiap input form
    const [formValue, setFormValue] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    // state buat pesan error kalau ada yang salah
    const [error, setError] = useState("");

    // state loading buat disable tombol pas lagi nunggu response API
    const [loading, setLoading] = useState(false);

    // state toggle show/hide password
    const [showPassword, setShowPassword] = useState(false);

    // navigate dipakai buat redirect ke halaman lain setelah register berhasil
    const navigate = useNavigate();

    // validasi form sebelum kirim ke API
    // kalau nama, email, atau password kosong langsung stop dan tampilin error
    function handleSubmitForm() {
        if (!formValue.name || !formValue.email || !formValue.password) {
            setError("Pastikan nama, email, dan password terisi.");
            return;
        }
        setError("");
        authRegister();
    }

    // fungsi utama yang kirim data ke API register
    // kalau berhasil, token dan data user disimpen di localStorage terus redirect ke "/"
    // kalau gagal, tampilin pesan error dari response API
    async function authRegister() {
        setLoading(true);
        try {
            const response = await register(formValue);
            const data = response.data;

            // simpen token JWT dan data user biar bisa dipakai di halaman lain
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            navigate("/");
        } catch (err) {
            // ambil pesan error dari response backend, kalau nggak ada pakai fallback
            const message = err.response?.data?.message || "Registrasi gagal. Coba lagi.";
            setError(message);
        } finally {
            // apapun hasilnya, loading dimatiin
            setLoading(false);
        }
    }

    // biar user bisa tekan Enter buat submit, nggak harus klik tombol
    function handleKeyDown(e) {
        if (e.key === "Enter") handleSubmitForm();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">

                {/* Logo PawMart di atas card */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <img src="/images/logo-pawmart.jpg" alt="Logo PawMart" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-2xl text-gray-800">
                        Paw<span className="text-orange-500">Mart</span>
                    </span>
                </div>

                {/* Card utama tempat form register */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                    <h1 className="text-xl font-bold text-gray-800 mb-1">Buat akun baru</h1>
                    <p className="text-sm text-gray-400 mb-6">
                        Sudah punya akun?{" "}
                        <Link to="/login" className="text-orange-500 font-semibold hover:underline">
                            Masuk di sini
                        </Link>
                    </p>

                    {/* Pesan error hanya muncul kalau state error ada isinya */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">

                        {/* Input nama lengkap */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Nama Lengkap</label>
                            <div className="relative">
                                {/* ikon kiri pakai absolute biar nggak geser layout input */}
                                <LuUser size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="nama kamu"
                                    onChange={(e) => setFormValue({ ...formValue, name: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-4 h-11 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                />
                            </div>
                        </div>

                        {/* Input email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Email</label>
                            <div className="relative">
                                <LuMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="email"
                                    placeholder="contoh@email.com"
                                    onChange={(e) => setFormValue({ ...formValue, email: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-4 h-11 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                />
                            </div>
                        </div>

                        {/* Input nomor HP — opsional, boleh dikosongkan */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">
                                No. HP{" "}
                                <span className="text-gray-300 font-normal">(opsional)</span>
                            </label>
                            <div className="relative">
                                <LuPhone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="08xxxxxxxxxx"
                                    onChange={(e) => setFormValue({ ...formValue, phone: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-4 h-11 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                />
                            </div>
                        </div>

                        {/* Input password dengan toggle show/hide */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Password</label>
                            <div className="relative">
                                <LuLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                {/* type berubah antara "text" dan "password" tergantung state showPassword */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimal 6 karakter"
                                    onChange={(e) => setFormValue({ ...formValue, password: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-10 h-11 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                />
                                {/* tombol mata di kanan buat toggle lihat/sembunyikan password */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Tombol submit — disabled otomatis pas loading biar nggak kena klik dua kali */}
                        <button
                            type="button"
                            onClick={handleSubmitForm}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold text-sm h-11 rounded-xl transition mt-1"
                        >
                            {loading ? (
                                "Sedang mendaftar..."
                            ) : (
                                <>
                                    Daftar
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
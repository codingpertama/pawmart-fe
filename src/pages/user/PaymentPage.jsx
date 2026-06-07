import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById, uploadPayment } from "../../services/api";

export default function PaymentPage() {
    const { id } = useParams(); // ambil order id dari URL /orders/:id/payment
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null); // preview foto sebelum upload
    const [loading, setLoading] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadOrder();
    }, [id]);

    async function loadOrder() {
        try {
            const response = await getOrderById(id);
            setOrder(response.data.data);
        } catch (err) {
            setError("Pesanan tidak ditemukan.");
        } finally {
            setLoading(false);
        }
    }

    // saat user pilih file, tampilkan preview
    function handleFileChange(e) {
        const selected = e.target.files[0];
        if (!selected) return;

        setFile(selected);

        // buat URL sementara untuk preview gambar
        const previewUrl = URL.createObjectURL(selected);
        setPreview(previewUrl);
    }

    async function handleUpload() {
        if (!file) {
            setError("Pilih foto bukti pembayaran dulu.");
            return;
        }

        console.log("file:", file);
        console.log("file name:", file.name);
        console.log("file type:", file.type);
        console.log("file size:", file.size);

        setUploadLoading(true);
        setError("");
        setSuccess("");

        try {
            // kirim sebagai FormData karena ada file
            const formData = new FormData();
            formData.append("payment_proof", file);

            for (let [key, value] of formData.entries()) {
                console.log("formData:", key, value);
            }

            await uploadPayment(id, formData);

            setSuccess("Bukti pembayaran berhasil diupload! Pesanan kamu sedang diproses.");

            // redirect ke halaman orders setelah 2 detik
            setTimeout(() => {
                navigate("/orders");
            }, 2000);

        } catch (err) {
            const message = err.response?.data?.message || "Gagal upload bukti bayar.";
            setError(message);
        } finally {
            setUploadLoading(false);
        }
    }

    const formattedTotal = order
        ? new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(order.total_price)
        : "";

    // ── LOADING ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400 text-sm">Memuat pesanan...</p>
            </div>
        );
    }

    // ── ERROR ──
    if (error && !order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-8">

            {/* Header */}
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Pesanan Berhasil Dibuat!
                </h1>
                <p className="text-sm text-gray-400">
                    Sekarang upload bukti pembayaran kamu
                </p>
            </div>

            {/* Ringkasan order */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h2>

                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">ID Pesanan</span>
                        <span className="font-semibold text-gray-800">#{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <span className="bg-yellow-100 text-yellow-600 text-xs font-semibold px-2 py-1 rounded-full">
                            {order.status}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Alamat</span>
                        <span className="font-semibold text-gray-800 text-right max-w-48">
                            {order.shipping_address}
                        </span>
                    </div>
                    <hr className="border-gray-100 my-1" />
                    <div className="flex justify-between">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="font-bold text-orange-500">{formattedTotal}</span>
                    </div>
                </div>
            </div>

            {/* Form upload bukti bayar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-bold text-gray-800 mb-2">Upload Bukti Pembayaran</h2>
                <p className="text-xs text-gray-400 mb-4">
                    Format: JPG, JPEG, PNG. Maks 2MB.
                </p>

                {/* Pesan error */}
                {error && (
                    <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                {/* Pesan sukses */}
                {success && (
                    <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-3 mb-4">
                        {success}
                    </div>
                )}

                {/* Area upload */}
                <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 transition mb-4">
                    {preview ? (
                        // tampilkan preview kalau sudah pilih foto
                        <img
                            src={preview}
                            alt="Preview bukti bayar"
                            className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                    ) : (
                        // placeholder sebelum pilih foto
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                            <span className="text-4xl">📷</span>
                            <p className="text-sm font-semibold">Klik untuk pilih foto</p>
                            <p className="text-xs">atau drag & drop di sini</p>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/jpg,image/jpeg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>

                {/* Tombol upload */}
                <button
                    onClick={handleUpload}
                    disabled={uploadLoading || !file}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white font-semibold py-3 rounded-xl transition"
                >
                    {uploadLoading ? "Mengupload..." : "Upload Bukti Bayar"}
                </button>

                {/* Skip — upload nanti */}
                <button
                    onClick={() => navigate("/orders")}
                    className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
                >
                    Upload Nanti
                </button>
            </div>

        </div>
    );
}
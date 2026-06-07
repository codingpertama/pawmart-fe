import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById, uploadPayment } from "../../services/api";
import { LuCircleCheck, LuUpload, LuImage, LuArrowLeft } from "react-icons/lu";

export default function PaymentPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null); // URL sementara untuk preview gambar sebelum diupload
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

    function handleFileChange(e) {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
        // URL.createObjectURL bikin URL sementara di browser untuk preview
        // URL ini tidak diupload ke server, cuma buat ditampilkan di halaman
        setPreview(URL.createObjectURL(selected));
    }

    async function handleUpload() {
        if (!file) {
            setError("Pilih foto bukti pembayaran dulu.");
            return;
        }

        setUploadLoading(true);
        setError("");
        setSuccess("");

        try {
            // file harus dikirim pakai FormData, bukan JSON biasa
            // karena axios butuh format ini untuk upload file
            const formData = new FormData();
            formData.append("payment_proof", file);
            await uploadPayment(id, formData);
            setSuccess("Bukti pembayaran berhasil diupload! Pesanan kamu sedang diproses.");
            // tunggu 2 detik biar user sempat baca pesan sukses, baru redirect
            setTimeout(() => navigate("/orders"), 2000);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-400 text-sm">Memuat pesanan...</p>
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-400 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-8">

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LuCircleCheck size={32} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Pesanan Berhasil Dibuat!
                </h1>
                <p className="text-sm text-gray-400">
                    Sekarang upload bukti pembayaran kamu
                </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
                <h2 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h2>
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">ID Pesanan</span>
                        <span className="font-semibold text-gray-800">#{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <span className="bg-yellow-100 text-yellow-600 text-xs font-semibold px-2.5 py-1 rounded-full">
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

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-bold text-gray-800 mb-1">Upload Bukti Pembayaran</h2>
                <p className="text-xs text-gray-400 mb-4">Format: JPG, JPEG, PNG. Maks 2MB.</p>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-3 mb-4">
                        {success}
                    </div>
                )}

                {/* label dipakai sebagai wrapper input file supaya area kliknya lebih luas
                    input file-nya disembunyikan, yang keliatan cuma tampilan custom di dalamnya */}
                <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 transition mb-4">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Preview bukti bayar"
                            className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-2">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                <LuImage size={22} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-600">Klik untuk pilih foto</p>
                            <p className="text-xs text-gray-400">atau drag & drop di sini</p>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/jpg,image/jpeg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>

                {/* disabled kalau file belum dipilih atau sedang proses upload */}
                <button
                    onClick={handleUpload}
                    disabled={uploadLoading || !file}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white font-semibold py-3 rounded-xl transition"
                >
                    <LuUpload size={16} />
                    {uploadLoading ? "Mengupload..." : "Upload Bukti Bayar"}
                </button>

                <button
                    onClick={() => navigate("/orders")}
                    className="w-full mt-3 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition"
                >
                    <LuArrowLeft size={16} />
                    Upload Nanti
                </button>
            </div>

        </div>
    );
}
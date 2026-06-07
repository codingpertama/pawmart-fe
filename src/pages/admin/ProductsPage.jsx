import { useState, useEffect } from "react";
import {
    getProducts,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../../services/api";
import { getImageUrl } from "../../services/api";
import { LuPencil, LuTrash2, LuPlus, LuX } from "react-icons/lu";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // state modal tambah/edit
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    // state form
    const [formData, setFormData] = useState({
        category_id: "",
        name: "",
        description: "",
        price: "",
        stock: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // state hapus
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // ambil produk dan kategori sekaligus
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts(),
                getCategories(),
            ]);
            setProducts(productsRes.data.data);
            setCategories(categoriesRes.data.data);
        } catch (err) {
            console.error("Gagal load data:", err);
        } finally {
            setLoading(false);
        }
    }

    // buka modal tambah
    function handleOpenAdd() {
        setEditTarget(null);
        setFormData({ category_id: "", name: "", description: "", price: "", stock: "" });
        setImageFile(null);
        setImagePreview(null);
        setFormError("");
        setModalOpen(true);
    }

    // buka modal edit
    function handleOpenEdit(product) {
        setEditTarget(product);
        setFormData({
            category_id: product.category_id,
            name:        product.name,
            description: product.description || "",
            price:       product.price,
            stock:       product.stock,
        });
        setImageFile(null);
        // tampilkan gambar lama sebagai preview
        setImagePreview(product.image_url ? getImageUrl(product.image_url) : null);
        setFormError("");
        setModalOpen(true);
    }

    function handleCloseModal() {
        setModalOpen(false);
        setEditTarget(null);
        setFormError("");
    }

    // handle perubahan input teks
    function handleFormChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    // handle pilih gambar
    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    // submit form tambah / edit
    async function handleSubmit() {
        // validasi sederhana
        if (!formData.category_id || !formData.name || !formData.price || !formData.stock) {
            setFormError("Kategori, nama, harga, dan stok wajib diisi.");
            return;
        }

        setFormLoading(true);
        setFormError("");

        try {
            // kirim sebagai FormData karena ada file gambar
            const data = new FormData();
            data.append("category_id",  formData.category_id);
            data.append("name",         formData.name);
            data.append("description",  formData.description);
            data.append("price",        formData.price);
            data.append("stock",        formData.stock);
            if (imageFile) {
                data.append("image", imageFile);
            }

            if (editTarget) {
                // edit — pakai POST + _method=PUT karena ada file
                data.append("_method", "PUT");
                await updateProduct(editTarget.id, data);
            } else {
                await createProduct(data);
            }

            await loadData();
            handleCloseModal();
        } catch (err) {
            const message = err.response?.data?.message || "Gagal menyimpan produk.";
            setFormError(message);
        } finally {
            setFormLoading(false);
        }
    }

    // hapus produk
    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteProduct(deleteTarget.id);
            await loadData();
            setDeleteTarget(null);
        } catch (err) {
            alert("Gagal menghapus produk.");
        } finally {
            setDeleteLoading(false);
        }
    }

    const formattedPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm">Memuat produk...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Produk</h1>
                    <p className="text-sm text-gray-400 mt-1">Kelola produk PawMart</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                    <LuPlus size={16} />
                    Tambah Produk
                </button>
            </div>

            {/* Tabel */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50">
                            <th className="px-6 py-4 font-semibold">Produk</th>
                            <th className="px-6 py-4 font-semibold">Kategori</th>
                            <th className="px-6 py-4 font-semibold">Harga</th>
                            <th className="px-6 py-4 font-semibold">Stok</th>
                            <th className="px-6 py-4 font-semibold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    Belum ada produk.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                    {/* Gambar + nama */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                                {product.image_url ? (
                                                    <img
                                                        src={getImageUrl(product.image_url)}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-lg">
                                                        🛍️
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-gray-800 max-w-40 truncate">
                                                {product.name}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {product.category?.name}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {formattedPrice(product.price)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                            product.stock > 0
                                                ? "bg-green-100 text-green-600"
                                                : "bg-red-100 text-red-500"
                                        }`}>
                                            {product.stock > 0 ? `${product.stock} item` : "Habis"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(product)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                            >
                                                <LuPencil size={13} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(product)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                                            >
                                                <LuTrash2 size={13} />
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── MODAL TAMBAH / EDIT ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-screen overflow-y-auto">

                        {/* Header modal */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-800">
                                {editTarget ? "Edit Produk" : "Tambah Produk"}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <LuX size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                                {formError}
                            </div>
                        )}

                        <div className="flex flex-col gap-4">

                            {/* Kategori */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-600">Kategori</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleFormChange}
                                    className="border border-gray-200 rounded-xl px-4 h-11 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                >
                                    <option value="">Pilih kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nama */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-600">Nama Produk</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="contoh: Royal Canin Kitten"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className="border border-gray-200 rounded-xl px-4 h-11 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                />
                            </div>

                            {/* Deskripsi */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-600">
                                    Deskripsi{" "}
                                    <span className="text-gray-300 font-normal">(opsional)</span>
                                </label>
                                <textarea
                                    name="description"
                                    placeholder="Deskripsi produk..."
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    rows={3}
                                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none"
                                />
                            </div>

                            {/* Harga & Stok */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-600">Harga (Rp)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="150000"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        className="border border-gray-200 rounded-xl px-4 h-11 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-600">Stok</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        placeholder="50"
                                        value={formData.stock}
                                        onChange={handleFormChange}
                                        className="border border-gray-200 rounded-xl px-4 h-11 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                    />
                                </div>
                            </div>

                            {/* Upload gambar */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-600">
                                    Foto Produk{" "}
                                    <span className="text-gray-300 font-normal">(opsional)</span>
                                </label>
                                <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-orange-400 transition">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-36 mx-auto rounded-lg object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400 py-2">
                                            <span className="text-3xl">📷</span>
                                            <p className="text-sm">Klik untuk pilih foto</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpg,image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                        </div>

                        {/* Tombol aksi */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={formLoading}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-xl transition text-sm"
                            >
                                {formLoading ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL KONFIRMASI HAPUS ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
                        <h2 className="font-bold text-gray-800 mb-2">Hapus Produk?</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Produk <span className="font-semibold text-gray-700">"{deleteTarget.name}"</span> akan dihapus permanen beserta fotonya.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-xl transition text-sm"
                            >
                                {deleteLoading ? "Menghapus..." : "Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
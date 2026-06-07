import { useState, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/api";
import { LuPencil, LuTrash2, LuPlus, LuX } from "react-icons/lu";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // state untuk modal tambah/edit
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null); // null = tambah, object = edit
    const [formName, setFormName] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    // state untuk konfirmasi hapus
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            const response = await getCategories();
            setCategories(response.data.data);
        } catch (err) {
            console.error("Gagal ambil kategori:", err);
        } finally {
            setLoading(false);
        }
    }

    // buka modal tambah
    function handleOpenAdd() {
        setEditTarget(null);
        setFormName("");
        setFormError("");
        setModalOpen(true);
    }

    // buka modal edit — isi form dengan data yang mau diedit
    function handleOpenEdit(category) {
        setEditTarget(category);
        setFormName(category.name);
        setFormError("");
        setModalOpen(true);
    }

    // tutup modal
    function handleCloseModal() {
        setModalOpen(false);
        setEditTarget(null);
        setFormName("");
        setFormError("");
    }

    // submit form tambah / edit
    async function handleSubmit() {
        if (!formName.trim()) {
            setFormError("Nama kategori wajib diisi.");
            return;
        }

        setFormLoading(true);
        setFormError("");

        try {
            if (editTarget) {
                // mode edit
                await updateCategory(editTarget.id, { name: formName });
            } else {
                // mode tambah
                await createCategory({ name: formName });
            }
            await loadCategories(); // refresh list
            handleCloseModal();
        } catch (err) {
            const message = err.response?.data?.message || "Gagal menyimpan kategori.";
            setFormError(message);
        } finally {
            setFormLoading(false);
        }
    }

    // hapus kategori
    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteCategory(deleteTarget.id);
            await loadCategories();
            setDeleteTarget(null);
        } catch (err) {
            alert("Gagal menghapus kategori.");
        } finally {
            setDeleteLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm">Memuat kategori...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kategori</h1>
                    <p className="text-sm text-gray-400 mt-1">Kelola kategori produk</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                    <LuPlus size={16} />
                    Tambah Kategori
                </button>
            </div>

            {/* Tabel */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50">
                            <th className="px-6 py-4 font-semibold">No</th>
                            <th className="px-6 py-4 font-semibold">Nama Kategori</th>
                            <th className="px-6 py-4 font-semibold">Dibuat</th>
                            <th className="px-6 py-4 font-semibold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                    Belum ada kategori.
                                </td>
                            </tr>
                        ) : (
                            categories.map((category, index) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {new Date(category.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* Tombol edit */}
                                            <button
                                                onClick={() => handleOpenEdit(category)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                            >
                                                <LuPencil size={13} />
                                                Edit
                                            </button>
                                            {/* Tombol hapus */}
                                            <button
                                                onClick={() => setDeleteTarget(category)}
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">

                        {/* Header modal */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-800">
                                {editTarget ? "Edit Kategori" : "Tambah Kategori"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <LuX size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        {formError && (
                            <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                                {formError}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5 mb-6">
                            <label className="text-sm font-semibold text-gray-600">
                                Nama Kategori
                            </label>
                            <input
                                type="text"
                                placeholder="contoh: Makanan Kucing"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 h-11 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                            />
                        </div>

                        {/* Tombol aksi */}
                        <div className="flex gap-3">
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
                        <h2 className="font-bold text-gray-800 mb-2">Hapus Kategori?</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Kategori <span className="font-semibold text-gray-700">"{deleteTarget.name}"</span> akan dihapus permanen.
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
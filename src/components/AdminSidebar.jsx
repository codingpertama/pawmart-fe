import { LuLayoutDashboard, LuTag, LuBox, LuClipboardList, LuUsers, LuLogOut } from "react-icons/lu";

// daftar menu navigasi sidebar admin
const navItems = [
  { label: "Dashboard",  path: "/admin/dashboard",  icon: <LuLayoutDashboard size={18} /> },
  { label: "Categories", path: "/admin/categories", icon: <LuTag size={18} /> },
  { label: "Products",   path: "/admin/products",   icon: <LuBox size={18} /> },
  { label: "Orders",     path: "/admin/orders",     icon: <LuClipboardList size={18} /> },
  { label: "Users",      path: "/admin/users",      icon: <LuUsers size={18} /> },
];

// Props:
// - user       : objek { name, email } admin yang sedang login
// - activePath : path halaman aktif, misal "/admin/products"
export default function AdminSidebar({ user, activePath }) {
  // ambil 2 inisial nama buat avatar
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col p-3 sticky top-0 shadow-sm">

      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-4 mb-2 border-b border-gray-100">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
          P
        </div>
        <span className="font-bold text-lg text-gray-800">
          Paw<span className="text-orange-500">Mart</span>
        </span>
        <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      {/* Menu navigasi */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          // cek apakah ini halaman yang sedang aktif
          const isActive = activePath === item.path;

          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition
                ${isActive
                  ? "bg-orange-500 text-white"               // aktif: pill oranye solid
                  : "text-gray-500 hover:bg-orange-50 hover:text-gray-800"  // default
                }`}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* dorong info user ke bawah */}
      <div className="flex-1" />

      {/* Info admin + tombol logout */}
      <div className="border-t border-gray-100 pt-3 flex flex-col gap-1">

        {/* nama dan email */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* tombol keluar */}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition w-full text-left">
          <LuLogOut size={18} />
          Keluar
        </button>

      </div>
    </aside>
  );
}
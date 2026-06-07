import { NavLink, useNavigate } from "react-router-dom";
import { LuLayoutDashboard, LuTag, LuBox, LuClipboardList, LuLogOut } from "react-icons/lu";
import Avatar from 'react-avatar';


const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <LuLayoutDashboard size={18} /> },
  { label: "Categories", path: "/admin/categories", icon: <LuTag size={18} /> },
  { label: "Products", path: "/admin/products", icon: <LuBox size={18} /> },
  { label: "Orders", path: "/admin/orders", icon: <LuClipboardList size={18} /> },
];

// Props:
// - user      : objek { name, email } admin yang sedang login
// - onLogout  : fungsi logout dari AdminLayout
export default function AdminSidebar({ user, onLogout }) {
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col p-3 sticky top-0 shadow-sm">

      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-4 mb-2 border-b border-gray-100">
        <img src="/images/logo-pawmart.jpg" alt="PawMart Logo" className="w-8 h-8 rounded-lg object-cover" />
        <span className="font-bold text-lg text-gray-800">
          Paw<span className="text-orange-500">Mart</span>
        </span>
        <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      {/* Menu navigasi — pakai NavLink biar active otomatis */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition ${isActive
                ? "bg-orange-500 text-white"
                : "text-gray-500 hover:bg-orange-50 hover:text-gray-800"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Info admin + tombol logout */}
      <div className="border-t border-gray-100 pt-3 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            <Avatar
              name={user?.name || "Admin"}
              size="32"
              round={true}
              textSizeRatio={2.5}
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* tombol logout — sambungin ke onLogout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition w-full text-left"
        >
          <LuLogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
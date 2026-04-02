import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Zap,
  Headphones,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Toast from '../components/Toast'
import { useDispatch } from "react-redux";
import { logout } from "../apiHandler/authApiHandler/authSlice";

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link to={path}>
    <motion.div
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center justify-between px-6 py-4 mb-2 rounded-2xl transition-all duration-300 group ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600"
      }`}
    >
      <div className="flex items-center gap-4">
        <Icon
          size={20}
          className={
            active
              ? "animate-pulse"
              : "group-hover:scale-110 transition-transform"
          }
        />
        <span className="text-xs font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
      {active && <ChevronRight size={16} />}
    </motion.div>
  </Link>
);

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showToast, setShowToast] = useState(false);

  const handleSignOut = () => {
    setShowToast(true);

    setTimeout(() => {
      localStorage.removeItem("access_token");
      dispatch(logout());
      navigate("/");
    }, 1500); // Delay redirect so they see the toast
  };

  // Primary Navigation Links
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    {
      icon: CalendarCheck,
      label: "Appointments",
      path: "/dashboard/appointments",
    },
  ];

  // Growth & Support Links (Phase 3)
  const supportItems = [
    { icon: Zap, label: "Upgrade", path: "/dashboard/upgrade" },
    { icon: Headphones, label: "Contact", path: "/dashboard/contact" },
  ];

  return (
    <>
      <aside className="w-80 h-screen sticky top-0 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-white/5 p-6 flex flex-col z-50">
        {/* Branding Section */}
        <div className="mb-12 px-4">
          <Link
            to="/"
            className="text-2xl font-black text-blue-600 tracking-tighter"
          >
            MediCare
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Provider Portal v1.0
            </p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <p className="px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
            Main Menu
          </p>
          <nav>
            {menuItems.map((item) => (
              <SidebarItem
                key={item.path}
                {...item}
                active={location.pathname === item.path}
              />
            ))}

            <div className="mt-10">
              <p className="px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                Growth & Help
              </p>
              {supportItems.map((item) => (
                <SidebarItem
                  key={item.path}
                  {...item}
                  active={location.pathname === item.path}
                />
              ))}
            </div>
          </nav>
        </div>

        {/* Logout / User Profile Section */}
        <div className="pt-6 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-red-500 transition-colors group"
          >
            <LogOut
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-xs font-black uppercase tracking-widest">
              Sign Out
            </span>
          </button>
        </div>
      </aside>
      <Toast
        message="Signed out successfully"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}

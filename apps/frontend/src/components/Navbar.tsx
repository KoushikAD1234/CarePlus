import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthModal from "../pages/AuthModal"; // Ensure the path matches your file structure

export default function Navbar({
  onHeroClick,
  onFeaturesClick,
  onPricingClick,
  onContactClick,
  onTrustClick,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  const navLinks = [
    { name: "Features", action: onFeaturesClick },
    { name: "Pricing", action: onPricingClick },
    { name: "Testimonials", action: onTrustClick },
    { name: "Contact Us", action: onContactClick },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-sm"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          {/* Logo */}
          <Link
            to="/"
            onClick={onHeroClick}
            className="text-2xl font-black text-blue-600 tracking-tighter hover:scale-105 transition-transform"
          >
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Care<span className="text-blue-600">Plus</span>
            </h2>
          </Link>

          {/* Center Menu Items */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={link.action}
                className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-all relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {/* <button
              onClick={() => openAuth("login")}
              className="hidden sm:block text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
            >
              Login
            </button> */}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAuth("register")}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all"
            >
              {/* Get Started */}
              Login / Register
            </motion.button>
          </div>
        </div>
      </nav>

      {/* The Separated Auth Modal Component */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}

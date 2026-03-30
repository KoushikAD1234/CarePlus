import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          {/* 1. Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
          />

          {/* 2. Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-blue-600 tracking-tighter">
                  MediCare
                </h2>
                <p className="text-sm text-gray-500 mt-2 font-bold uppercase tracking-widest">
                  {isLogin ? "Welcome Back" : "Join the Clinic"}
                </p>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {!isLogin && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 outline-none focus:border-blue-500 transition-all dark:text-white"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 outline-none focus:border-blue-500 transition-all dark:text-white"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 outline-none focus:border-blue-500 transition-all dark:text-white"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 mt-4"
                >
                  {isLogin ? "Sign In" : "Register Now"}
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  {isLogin ? "New here?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    {isLogin ? "Create Account" : "Login"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

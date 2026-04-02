import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react"; // Added useRef
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  registerUser,
} from "../apiHandler/authApiHandler/authSlice";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, X, ShieldCheck, ArrowRight } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Track if the user actually clicked 'Register' to avoid ghost triggers
  const wasRegistrationAttempted = useRef(false);

  const dispatch = useDispatch();
  const { loading, error, access_token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ email: form.email, password: form.password }));
    } else {
      wasRegistrationAttempted.current = true; // Mark that we are trying to register
      dispatch(registerUser(form));
    }
  };

  useEffect(() => {
    // 1. LOGIN SUCCESS LOGIC
    if (access_token && isOpen && isLogin) {
      setIsSuccess(true);
      const timer = setTimeout(() => {
        onClose();
        navigate("/dashboard", { replace: true });
        setIsSuccess(false);
      }, 1800);
      return () => clearTimeout(timer);
    }

    // 2. REGISTRATION SUCCESS LOGIC
    // Trigger only if: not loading, no error, we are in register mode, and we actually clicked register
    if (!isLogin && !loading && !error && wasRegistrationAttempted.current) {
      wasRegistrationAttempted.current = false; // Reset the ref immediately
      setRegSuccess(true);

      const timer = setTimeout(() => {
        setRegSuccess(false);
        setIsLogin(true); // Switch to Login UI
        setForm({ name: "", email: "", password: "" }); // Clear form
      }, 2500);

      return () => clearTimeout(timer);
    }

    // Reset attempt if an error occurs so it can be tried again
    if (error) {
      wasRegistrationAttempted.current = false;
    }
  }, [access_token, loading, error, isOpen, navigate, onClose, isLogin]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            layout
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-200 dark:border-white/5 overflow-hidden z-20"
          >
            <AnimatePresence mode="wait">
              {/* VIEW 1: LOGIN SUCCESS */}
              {isSuccess ? (
                <motion.div
                  key="login-success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 text-center flex flex-col items-center justify-center min-h-[450px]"
                >
                  <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-600/40">
                    <CheckCircle size={48} strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    Welcome Back!
                  </h2>
                  <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mt-3 animate-pulse">
                    Securing Session...
                  </p>
                </motion.div>
              ) : /* VIEW 2: REGISTRATION SUCCESS */
              regSuccess ? (
                <motion.div
                  key="reg-success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-12 text-center flex flex-col items-center justify-center min-h-[450px]"
                >
                  <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-green-500/40">
                    <CheckCircle size={48} strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    Account Created!
                  </h2>
                  <p className="text-gray-500 font-medium mt-2">
                    Please sign in with your credentials.
                  </p>
                  <div className="mt-8 flex items-center justify-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                    Switching to Login{" "}
                    <ArrowRight size={14} className="animate-bounce-x" />
                  </div>
                </motion.div>
              ) : (
                /* VIEW 3: THE FORM */
                <motion.div
                  key="form"
                  className="p-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4 border border-blue-100 dark:border-blue-800/30">
                      <ShieldCheck size={14} className="text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                        Secure Portal
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      Medi<span className="text-blue-600">Care</span>
                    </h2>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <AnimatePresence mode="popLayout">
                      {!isLogin && (
                        <motion.input
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          name="name"
                          type="text"
                          placeholder="Dr. Full Name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none transition-all dark:text-white font-medium shadow-inner"
                        />
                      )}
                    </AnimatePresence>

                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none transition-all dark:text-white font-medium shadow-inner"
                    />
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none transition-all dark:text-white font-medium shadow-inner"
                    />

                    <motion.button
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-blue-600/30 mt-6 flex items-center justify-center gap-3 disabled:bg-gray-400"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : isLogin ? (
                        "Enter Dashboard"
                      ) : (
                        "Register Account"
                      )}
                    </motion.button>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest mt-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                      >
                        {typeof error === "object" ? error.message : error}
                      </motion.p>
                    )}
                  </form>

                  <div className="mt-10 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      {isLogin ? "No account?" : "Already a member?"}
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 font-black hover:underline ml-2 transition-all"
                      >
                        {isLogin ? "Create One" : "Login"}
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

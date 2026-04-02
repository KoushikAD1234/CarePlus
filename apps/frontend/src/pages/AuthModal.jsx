import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  registerUser,
} from "../apiHandler/authApiHandler/authSlice";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Loader2,
  X,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
} from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // New State
  const [isSuccess, setIsSuccess] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false); // Success state for reset email

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const wasRegistrationAttempted = useRef(false);

  const dispatch = useDispatch();
  const { loading, error, access_token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isForgotPassword) {
      handleForgotPassword();
    } else if (isLogin) {
      dispatch(loginUser({ email: form.email, password: form.password }));
    } else {
      wasRegistrationAttempted.current = true;
      dispatch(registerUser(form));
    }
  };

  const handleForgotPassword = async () => {
    // Logic for calling your NestJS /auth/forgot-password endpoint
    console.log("Sending reset email to:", form.email);
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setIsForgotPassword(false);
      setIsLogin(true);
    }, 3000);
  };

  useEffect(() => {
    if (access_token && isOpen && isLogin) {
      setIsSuccess(true);
      const timer = setTimeout(() => {
        onClose();
        navigate("/dashboard", { replace: true });
        setIsSuccess(false);
      }, 1800);
      return () => clearTimeout(timer);
    }

    if (!isLogin && !loading && !error && wasRegistrationAttempted.current) {
      wasRegistrationAttempted.current = false;
      setRegSuccess(true);
      const timer = setTimeout(() => {
        setRegSuccess(false);
        setIsLogin(true);
        setForm({ name: "", email: "", password: "" });
      }, 2500);
      return () => clearTimeout(timer);
    }

    if (error) {
      wasRegistrationAttempted.current = false;
    }
  }, [access_token, loading, error, isOpen, navigate, onClose, isLogin]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-md"
          />

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
              ) : /* VIEW 2: REGISTRATION SUCCESS / RESET SUCCESS */
              regSuccess || resetSent ? (
                <motion.div
                  key="action-success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-12 text-center flex flex-col items-center justify-center min-h-[450px]"
                >
                  <div
                    className={`w-24 h-24 ${
                      resetSent ? "bg-amber-500" : "bg-green-500"
                    } rounded-[2.5rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-opacity-40`}
                  >
                    {resetSent ? (
                      <Mail size={48} />
                    ) : (
                      <CheckCircle size={48} strokeWidth={3} />
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {resetSent ? "Check Your Email" : "Account Created!"}
                  </h2>
                  <p className="text-gray-500 font-medium mt-2">
                    {resetSent
                      ? "We've sent a recovery link to your inbox."
                      : "Please sign in with your credentials."}
                  </p>
                </motion.div>
              ) : (
                /* VIEW 3: THE FORM (LOGIN / REGISTER / FORGOT) */
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
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">
                      {isForgotPassword
                        ? "Password Recovery"
                        : isLogin
                        ? "Provider Login"
                        : "New Registration"}
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLogin && !isForgotPassword && (
                      <motion.input
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        name="name"
                        type="text"
                        placeholder="Dr. Full Name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none transition-all dark:text-white font-medium shadow-inner"
                      />
                    )}

                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none transition-all dark:text-white font-medium shadow-inner"
                    />

                    {!isForgotPassword && (
                      <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none transition-all dark:text-white font-medium shadow-inner"
                      />
                    )}

                    {isLogin && !isForgotPassword && (
                      <div className="text-right px-2">
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <motion.button
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-blue-600/30 mt-6 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : isForgotPassword ? (
                        "Send Recovery Link"
                      ) : isLogin ? (
                        "Enter Dashboard"
                      ) : (
                        "Register Account"
                      )}
                    </motion.button>
                  </form>

                  <div className="mt-10 text-center">
                    {isForgotPassword ? (
                      <button
                        onClick={() => setIsForgotPassword(false)}
                        className="flex items-center justify-center gap-2 w-full text-xs font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-all"
                      >
                        <ArrowLeft size={14} /> Back to Login
                      </button>
                    ) : (
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {isLogin ? "No account?" : "Already a member?"}
                        <button
                          type="button"
                          onClick={() => setIsLogin(!isLogin)}
                          className="text-blue-600 font-black hover:underline ml-2"
                        >
                          {isLogin ? "Create One" : "Login"}
                        </button>
                      </p>
                    )}
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

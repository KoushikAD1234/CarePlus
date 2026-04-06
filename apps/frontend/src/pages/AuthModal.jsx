import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../apiHandler/authApiHandler/authSlice";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Loader2,
  X,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    newPassword: "",
  });

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
      resetStep === 1 ? handleSendOTP() : handleResetPassword();
    } else if (isLogin) {
      dispatch(loginUser({ email: form.email, password: form.password }));
    } else {
      wasRegistrationAttempted.current = true;
      dispatch(registerUser(form));
    }
  };

  const handleSendOTP = async () => {
    dispatch(forgotPassword(form.email));
    setResetStep(2);
  };

  const handleResetPassword = async () => {
    dispatch(
      resetPassword({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      })
    );

    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setIsForgotPassword(false);
      setResetStep(1);
      setIsLogin(true);
      setForm({ ...form, otp: "", newPassword: "" });
    }, 3000);
  };

  const toggleForgotPassword = (val) => {
    setIsForgotPassword(val);
    setResetStep(1);
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
        setForm({
          name: "",
          email: "",
          password: "",
          otp: "",
          newPassword: "",
        });
      }, 2500);
      return () => clearTimeout(timer);
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
              {isSuccess ? (
                <motion.div
                  key="login-success"
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
              ) : regSuccess || resetSent ? (
                <motion.div
                  key="action-success"
                  className="p-12 text-center flex flex-col items-center justify-center min-h-[450px]"
                >
                  <div
                    className={`w-24 h-24 ${
                      resetSent ? "bg-amber-500" : "bg-green-500"
                    } rounded-[2.5rem] flex items-center justify-center text-white mb-6 shadow-2xl`}
                  >
                    {resetSent ? (
                      <KeyRound size={48} />
                    ) : (
                      <CheckCircle size={48} strokeWidth={3} />
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {resetSent ? "Password Reset!" : "Account Created!"}
                  </h2>
                  <p className="text-gray-500 font-medium mt-2 text-sm">
                    {resetSent
                      ? "Your password has been updated."
                      : "Please sign in with your credentials."}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className="p-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                        ? `Reset Password: Step ${resetStep}`
                        : isLogin
                        ? "Provider Login"
                        : "New Registration"}
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLogin && !isForgotPassword && (
                      <input
                        name="name"
                        type="text"
                        placeholder="Dr. Full Name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium"
                      />
                    )}

                    {(!isForgotPassword || resetStep === 1) && (
                      <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium shadow-inner"
                      />
                    )}

                    {!isForgotPassword && (
                      <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium"
                      />
                    )}

                    {isForgotPassword && resetStep === 2 && (
                      <>
                        <motion.input
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          name="otp"
                          type="text"
                          placeholder="Enter 6-Digit OTP"
                          required
                          value={form.otp}
                          onChange={handleChange}
                          className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium"
                        />
                        <motion.input
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          name="newPassword"
                          type="password"
                          placeholder="New Password"
                          required
                          value={form.newPassword}
                          onChange={handleChange}
                          className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium"
                        />
                      </>
                    )}

                    {isLogin && !isForgotPassword && (
                      <div className="text-right px-2">
                        <button
                          type="button"
                          onClick={() => toggleForgotPassword(true)}
                          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600"
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
                        resetStep === 1 ? (
                          "Send OTP"
                        ) : (
                          "Reset Password"
                        )
                      ) : isLogin ? (
                        "Enter Dashboard"
                      ) : (
                        "Register Account"
                      )}
                    </motion.button>
                  </form>

                  {/* --- NEW TOGGLE BUTTONS SECTION --- */}
                  <div className="mt-8 flex flex-col gap-4 text-center">
                    {!isForgotPassword ? (
                      <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all"
                      >
                        {isLogin
                          ? "Don't have an account? Create one"
                          : "Already have an account? Sign In"}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (resetStep === 2) setResetStep(1);
                          else toggleForgotPassword(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full text-xs font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-all"
                      >
                        <ArrowLeft size={14} /> Back to{" "}
                        {resetStep === 2 ? "Step 1" : "Login"}
                      </button>
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

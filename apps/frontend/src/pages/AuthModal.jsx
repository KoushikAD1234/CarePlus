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
  AlertCircle,
} from "lucide-react";

// Robust error parser that extracts text from any Redux error format
// Universal error string extractor & user-friendly formatter
const getFriendlyErrorMessage = (err) => {
  if (!err) return "Something went wrong. Please check your information and try again.";

  // 1. Extract the actual text string out of complex Redux/Axios error structures
  let rawText = "";

  if (typeof err === "string") {
    rawText = err;
  } else if (Array.isArray(err)) {
    rawText = err.join(" ");
  } else if (typeof err === "object") {
    // Check common nested locations from NestJS, Express, Axios, and Redux Toolkit
    const candidate = err.message || err.data?.message || err.response?.data?.message || err.error;
    
    if (Array.isArray(candidate)) {
      rawText = candidate.join(" ");
    } else if (typeof candidate === "string") {
      rawText = candidate;
    } else if (typeof candidate === "object") {
      rawText = JSON.stringify(candidate);
    } else {
      rawText = JSON.stringify(err);
    }
  }

  const cleanMsg = String(rawText).toLowerCase();

  // 2. Keyword Matching
  if (
    cleanMsg.includes("401") ||
    cleanMsg.includes("invalid") ||
    cleanMsg.includes("unauthorized") ||
    cleanMsg.includes("wrong") ||
    cleanMsg.includes("credentials") ||
    cleanMsg.includes("password")
  ) {
    return "Incorrect email or password. Please double-check your details and try again.";
  }

  if (
    cleanMsg.includes("already") ||
    cleanMsg.includes("exist") ||
    cleanMsg.includes("registered") ||
    cleanMsg.includes("duplicate") ||
    cleanMsg.includes("409")
  ) {
    return "An account with this email address already exists. Try logging in instead.";
  }

  if (
    cleanMsg.includes("otp") ||
    cleanMsg.includes("code") ||
    cleanMsg.includes("expired")
  ) {
    return "The verification code you entered is invalid or has expired. Please check your inbox and try again.";
  }

  if (
    cleanMsg.includes("network") ||
    cleanMsg.includes("fetch") ||
    cleanMsg.includes("503") ||
    cleanMsg.includes("connect")
  ) {
    return "Unable to connect to our servers. Please check your internet connection and try again.";
  }

  if (cleanMsg.includes("500") || cleanMsg.includes("server")) {
    return "We're experiencing temporary system trouble. Please try again in a few moments.";
  }

  // 3. Fallback: If it's a short string (like a custom validation error from backend), show it directly
  if (typeof rawText === "string" && rawText.length > 0 && rawText.length < 120 && !rawText.includes("{")) {
    return rawText;
  }

  return "Please check the information you entered and try again.";
};

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    registration_number: "",
    specialization: "",
    address: "",
    password: "",
    fees: "",
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
      dispatch(
        registerUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          qualification: form.qualification,
          registration_number: form.registration_number,
          fees: Number(form.fees),
          specialization: form.specialization,
          address: form.address,
          password: form.password,
        })
      );
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
      setForm({
        name: "",
        email: "",
        phone: "",
        qualification: "",
        registration_number: "",
        fees: "",
        specialization: "",
        address: "",
        password: "",
        otp: "",
        newPassword: "",
      });
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
          phone: "",
          qualification: "",
          registration_number: "",
          fees: "",
          specialization: "",
          address: "",
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
            className={`relative w-full ${
              !isLogin && !isForgotPassword ? "max-w-2xl" : "max-w-md"
            } bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-200 dark:border-white/5 overflow-hidden z-20 transition-all duration-300`}
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
                  className="p-8 sm:p-10 max-h-[85vh] overflow-y-auto"
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

                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4 border border-blue-100 dark:border-blue-800/30">
                      <ShieldCheck size={14} className="text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                        Secure Portal
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      Care<span className="text-blue-600">Plus</span>
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">
                      {isForgotPassword
                        ? `Reset Password: Step ${resetStep}`
                        : isLogin
                        ? "Provider Login"
                        : "New Doctor Registration"}
                    </p>
                  </div>

                  {/* --- CUSTOMIZED USER-FRIENDLY ERROR BANNER --- */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 text-red-700 dark:text-red-300 shadow-sm"
                      >
                        <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl shrink-0 text-red-600 dark:text-red-400">
                          <AlertCircle size={18} />
                        </div>
                        <div className="text-xs leading-relaxed">
                          <p className="font-extrabold uppercase tracking-wider text-[10px] text-red-600 dark:text-red-400 mb-0.5">
                            {isForgotPassword
                              ? "Reset Issue"
                              : isLogin
                              ? "Sign-In Problem"
                              : "Registration Notice"}
                          </p>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            {getFriendlyErrorMessage(error)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* --- REGISTRATION SPECIFIC FIELDS --- */}
                    {!isLogin && !isForgotPassword && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          name="name"
                          type="text"
                          placeholder="Dr. Full Name *"
                          required
                          value={form.name}
                          onChange={handleChange}
                          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
                        />
                        <input
                          name="phone"
                          type="tel"
                          placeholder="Phone Number *"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
                        />
                        <input
                          name="qualification"
                          type="text"
                          placeholder="Qualification (e.g. MBBS, MD) *"
                          required
                          value={form.qualification}
                          onChange={handleChange}
                          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
                        />
                        <input
                          name="registration_number"
                          type="text"
                          placeholder="Medical Reg. Number *"
                          required
                          value={form.registration_number}
                          onChange={handleChange}
                          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
                        />
                        <input
                          name="specialization"
                          type="text"
                          placeholder="Specialization *"
                          required
                          value={form.specialization}
                          onChange={handleChange}
                          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
                        />
                        <input
                          name="address"
                          type="text"
                          placeholder="Clinic Address"
                          value={form.address}
                          onChange={handleChange}
                          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
                        />
                        <input
                          name="fees"
                          type="number"
                          placeholder="Consultation Fees *"
                          required
                          value={form.fees}
                          onChange={handleChange}
                          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
                        />
                      </div>
                    )}

                    {/* --- COMMON EMAIL FIELD --- */}
                    {(!isForgotPassword || resetStep === 1) && (
                      <input
                        name="email"
                        type="email"
                        placeholder="Email Address *"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-4.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm shadow-inner"
                      />
                    )}

                    {/* --- COMMON PASSWORD FIELD --- */}
                    {!isForgotPassword && (
                      <input
                        name="password"
                        type="password"
                        placeholder="Password *"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-4.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
                      />
                    )}

                    {/* --- FORGOT PASSWORD STEP 2 --- */}
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
                          className="w-full p-4.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
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
                          className="w-full p-4.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 outline-none dark:text-white font-medium text-sm"
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
                      className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-widest py-4.5 rounded-2xl shadow-xl shadow-blue-600/30 mt-6 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
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

                  {/* --- TOGGLE BUTTONS SECTION --- */}
                  <div className="mt-6 flex flex-col gap-4 text-center">
                    {!isForgotPassword ? (
                      <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all cursor-pointer"
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
                        className="flex items-center justify-center gap-2 w-full text-xs font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-all cursor-pointer"
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

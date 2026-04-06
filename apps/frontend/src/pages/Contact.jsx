import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import {
  Mail,
  Phone,
  Send,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { submitContact } from "../apiHandler/authApiHandler/contactSlice";

const ContactMethod = ({ icon: Icon, label, value, href }) => (
  <motion.a
    href={href}
    whileHover={{ y: -5 }}
    className="flex items-center gap-5 p-6 rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-lg shadow-blue-500/5 transition-all group"
  >
    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
        {label}
      </p>
      <p className="font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </motion.a>
);

export default function Contact() {
  const dispatch = useDispatch();
  const userEmail = useSelector((state) => state.auth?.user?.email);

  // Status State: 'idle' | 'loading' | 'success' | 'error'
  const [status, setStatus] = useState("idle");
  const [formData, setFormData] = useState({
    name: "",
    subject: "Technical Issue",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Assuming submitContact returns a promise or you can unwrap it
      await dispatch(submitContact({ ...formData, email: userEmail })).unwrap();
      setStatus("success");
      setFormData({ name: "", subject: "Technical Issue", message: "" });

      // Reset back to idle after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          How can we <span className="text-blue-600">help?</span>
        </h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto">
          Whether you need technical support or have questions about billing,
          our team is here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-16">
          <ContactMethod
            icon={Mail}
            label="Email Support"
            value="koushikjio1234@gmail.com"
            href="mailto:koushikjio1234@gmail.com"
          />
          <ContactMethod
            icon={Phone}
            label="Phone"
            value="+91 9101334649"
            href="tel:+919101334649"
          />
          <ContactMethod
            icon={Globe}
            label="Location"
            value="E-City, Bengaluru"
            href="#"
          />
        </div>

        <div className="lg:col-span-3 relative">
          <form
            onSubmit={handleSubmit}
            className={`p-10 rounded-[3rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-2xl space-y-6 transition-all ${status === "success" ? "opacity-20 pointer-events-none blur-sm" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. Name"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600 outline-none transition-all dark:text-white font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600 outline-none transition-all dark:text-white font-medium"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Billing Query">Billing Query</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Describe your issue..."
                className="w-full px-6 py-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600 outline-none transition-all dark:text-white font-medium resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${
                status === "error"
                  ? "bg-red-500 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
              }`}
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" size={18} />
              ) : status === "error" ? (
                <>
                  <AlertCircle size={18} /> Try Again
                </>
              ) : (
                <>
                  <Send size={18} /> Send Inquiry
                </>
              )}
            </button>
          </form>

          {/* Success Overlay */}
          <AnimatePresence>
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-10"
              >
                <div className="p-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-4">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Message Sent!
                </h3>
                <p className="text-gray-500 font-medium mt-2">
                  We'll get back to you at <br />
                  <span className="text-blue-600">{userEmail}</span>
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

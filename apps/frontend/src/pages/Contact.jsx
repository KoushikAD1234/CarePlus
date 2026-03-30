import { motion } from "framer-motion";
import { Mail, Phone, MessageSquare, Send, Globe } from "lucide-react";

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
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to send to your NestJS backend
    alert("Message sent successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          How can we <span className="text-blue-600">help?</span>
        </h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto">
          Whether you need technical support for your WhatsApp bot or have
          questions about billing, our team is here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left: Contact Info */}
        <div className="lg:col-span-2 space-y-4">
          <ContactMethod
            icon={Mail}
            label="Email Support"
            value="support@medicare.com"
            href="mailto:support@medicare.com"
          />
          <ContactMethod
            icon={Phone}
            label="Phone"
            value="+91 98765 43210"
            href="tel:+919876543210"
          />
          <ContactMethod
            icon={Globe}
            label="Location"
            value="Tinsukia, Assam, India"
            href="#"
          />

          <div className="p-8 rounded-[2.5rem] bg-blue-600 text-white mt-8 relative overflow-hidden">
            <MessageSquare className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
            <h3 className="font-black mb-2 uppercase tracking-widest text-sm">
              Priority Support
            </h3>
            <p className="text-blue-100 text-xs leading-relaxed font-medium">
              Pro users get a dedicated WhatsApp account manager for 24/7
              technical assistance.
            </p>
          </div>
        </div>

        {/* Right: Query Form */}
        <div className="lg:col-span-3">
          <form
            onSubmit={handleSubmit}
            className="p-10 rounded-[3rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-2xl space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Dr. Name"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600 outline-none transition-all dark:text-white font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Subject
                </label>
                <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600 outline-none transition-all dark:text-white font-medium">
                  <option>Technical Issue</option>
                  <option>Billing Query</option>
                  <option>Feature Request</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                Message
              </label>
              <textarea
                rows="5"
                placeholder="Describe your issue..."
                className="w-full px-6 py-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600 outline-none transition-all dark:text-white font-medium resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Send size={18} /> Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Calendar, UserCircle, Send, MapPin } from "lucide-react";
import { useState } from "react";

export default function WalkInModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "Male",
    address: "",
    type: "Walk-in",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Pass data back to parent
    onClose(); // Close modal
    setFormData({
      name: "",
      phone: "",
      age: "",
      gender: "Male",
      address: "",
      type: "Walk-in",
    }); // Reset
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-[160]"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  New Walk-in
                </h2>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
                  Manual Entry
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Name Input */}
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Patient Full Name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium transition-all"
                  />
                </div>

                {/* Phone Input */}
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp Number"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Age Input */}
                  <div className="relative">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      required
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Gender Select */}
                  <div className="relative">
                    <UserCircle
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium transition-all appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-5 text-gray-400"
                    size={18}
                  />
                  <textarea
                    placeholder="Residential Address"
                    rows="3"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium transition-all resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Send size={16} /> Register Appointment
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

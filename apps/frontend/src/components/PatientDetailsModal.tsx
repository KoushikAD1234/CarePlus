import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Phone,
  Calendar,
  UserCircle,
  MapPin,
  Clock,
  Edit2,
  Save,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function PatientDetailsModal({
  isOpen,
  onClose,
  appointment,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Reset form ONLY when a NEW appointment is selected
  useEffect(() => {
    if (appointment?.id) {
      setFormData({ ...appointment });
      setIsEditing(false); // Only lock the form when switching patients
    }
  }, [appointment?.id]); // Track the ID specifically

  if (!appointment) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onUpdate(formData);
    // Note: We don't necessarily call setIsEditing(false) here
    // if the parent's onUpdate closes the modal anyway.
  };

  const toggleEdit = (e) => {
    e.preventDefault(); // Critical: stops form from submitting
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...appointment }); // Revert changes
    setIsEditing(false);
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
            onClick={isEditing ? null : onClose} // Prevent accidental close while editing
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-[160]"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Patient Profile
                </h2>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
                  {isEditing ? "Editing Mode" : "Information Details"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div className="space-y-3">
                {/* Patient Name */}
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    disabled={!isEditing}
                    value={formData.patient_name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, patient_name: e.target.value })
                    }
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-bold disabled:opacity-50 transition-all"
                    placeholder="Patient Name"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    disabled={!isEditing}
                    value={formData.patient_phone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        patient_phone: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium disabled:opacity-50 transition-all"
                    placeholder="Phone Number"
                  />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={formData.age || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium disabled:opacity-50 transition-all"
                      placeholder="Age"
                    />
                  </div>
                  <div className="relative">
                    <UserCircle
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <select
                      disabled={!isEditing}
                      value={formData.gender || "Male"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium appearance-none disabled:opacity-50 transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Time & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Clock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="datetime-local"
                      disabled={!isEditing}
                      value={
                        formData.appointment_time
                          ? new Date(formData.appointment_time)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointment_time: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-[10px] font-bold disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <select
                      disabled={!isEditing}
                      value={formData.type || "Walk-in"}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-xs font-black uppercase tracking-widest appearance-none disabled:opacity-50 transition-all"
                    >
                      <option value="First Visit">First Visit</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Walk-in">Walk-in</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-4 text-gray-400"
                    size={18}
                  />
                  <textarea
                    disabled={!isEditing}
                    rows="2"
                    placeholder="Residential Address"
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium transition-all resize-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {!isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={toggleEdit}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} /> Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-8 py-4 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={16} /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-8 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
                    >
                      <RotateCcw size={16} /> Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

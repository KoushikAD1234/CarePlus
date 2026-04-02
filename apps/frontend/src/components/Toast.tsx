import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function Toast({
  message,
  type = "success",
  isVisible,
  onClose,
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, scale: 0.95, x: "-50%" }}
          className="fixed bottom-10 left-1/2 z-[200] min-w-[320px]"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 p-4 rounded-[1.5rem] shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {type === "success" ? (
                <div className="p-2 bg-green-500/10 text-green-500 rounded-xl">
                  <CheckCircle size={18} />
                </div>
              ) : (
                <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
                  <AlertCircle size={18} />
                </div>
              )}
              <span className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-white">
                {message}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QueryForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for your NestJS backend would go here
    setIsSubmitted(true);
  };

  return (
    <div className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/20 blur-[120px] rounded-full -z-10" />

      <div className="max-w-2xl mx-auto p-10 rounded-3xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl transition-all min-h-[400px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                  Have <span className="text-blue-600">Questions?</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Our team usually responds within 2 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white"
                    placeholder="Your Name"
                  />
                  <input
                    type="email"
                    required
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white"
                    placeholder="Email Address"
                  />
                </div>
                <textarea
                  rows="4"
                  required
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white resize-none"
                  placeholder="How can we help you?"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                ✓
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Message Sent!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Thank you, Koushik. We'll get back to you shortly.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { useState } from "react";
// Ensure this component is imported and styled similarly
import BackgroundBlobs from "./BackgroundBlobs";
import AuthModal from '../pages/AuthModal'

export default function Hero( {onExploreClick }) {
  const [authMode, setAuthMode] = useState("login");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Animation Variants for the whole container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25, // Stagger each child's entrance
        delayChildren: 0.1, // A slight delay before starting
      },
    },
  };

  // Variants for individual text elements (Title, Subtitle)
  const textVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // Variants for the main Headline (adds a nice "slide-in" effect)
  const headlineVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: "easeOut" },
    },
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center relative overflow-hidden bg-white dark:bg-gray-950 transition-colors">
      {/* 1. Enhanced BackgroundBlobs (Needs subtle opacity) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }} // Make blobs subtle
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 z-0"
      >
        <BackgroundBlobs />
      </motion.div>

      {/* 2. Main Animated Container */}
      <motion.div
        className="max-w-4xl z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Badge */}
        <motion.div variants={textVariants} className="inline-block mb-5">
          <span className="text-blue-600 font-bold uppercase tracking-widest text-[11px] bg-blue-100 dark:bg-blue-900/40 px-5 py-2.5 rounded-full shadow-inner">
            Next-Gen Clinic Platform
          </span>
        </motion.div>

        {/* Staggered Headline */}
        <motion.h1
          variants={headlineVariants}
          className="text-5xl md:text-7xl font-black leading-tight mb-8 text-gray-900 dark:text-white"
        >
          Simplify Your Clinic
          <span className="block text-blue-500 drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]">
            Management
          </span>
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          variants={textVariants}
          className="text-xl text-gray-300 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Effortlessly handle appointments, patient records, and medical
          workflows. Focused on care, designed for efficiency.
        </motion.p>

        {/* Animated Buttons with Interaction */}
        <motion.div
          variants={textVariants}
          className="flex flex-col sm:flex-row justify-center items-center gap-5"
        >
          <motion.button
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openAuth("login")}
            className="w-full sm:w-auto bg-blue-600 px-8 py-4 rounded-2xl text-white font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-700 transition-all duration-300"
          >
            Get Started →
          </motion.button>

          {/* THE UPDATED EXPLORE BUTTON */}
          <motion.button
            onClick={onExploreClick}
            className="border-2 border-gray-200 dark:border-white/10 px-8 py-4 rounded-2xl 
                       text-gray-900 dark:text-white font-black uppercase tracking-tight
                       hover:bg-gray-50 dark:hover:bg-white/5 hover:border-blue-500 
                       active:scale-95 transition-all duration-200"
          >
            Explore Platform
          </motion.button>
        </motion.div>
      </motion.div>
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

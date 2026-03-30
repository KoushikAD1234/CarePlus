import { motion } from "framer-motion";

export default function BackgroundBlobs() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl absolute top-[-150px] left-[-150px]"
        animate={{ x: [0, 120, 0], y: [0, 80, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      <motion.div
        className="w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl absolute bottom-[-150px] right-[-150px]"
        animate={{ x: [0, -100, 0], y: [0, -60, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />
    </div>
  );
}

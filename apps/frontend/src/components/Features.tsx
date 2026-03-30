import { motion } from "framer-motion";

export default function Features() {
  const features = [
    {
      title: "Smart Booking",
      desc: "Patients can book 24/7 with real-time doctor availability sync.",
      icon: "📅",
      color: "blue",
    },
    {
      title: "Doctor Portal",
      desc: "Manage schedules, prescriptions, and digital consultations easily.",
      icon: "🩺",
      color: "indigo",
    },
    {
      title: "E-Health Records",
      desc: "Securely store and retrieve patient history with 256-bit encryption.",
      icon: "📂",
      color: "cyan",
    },
    {
      title: "Clinic Analytics",
      desc: "Track revenue, patient flow, and peak hours with visual charts.",
      icon: "📈",
      color: "purple",
    },
    {
      title: "Whatsapp Integration",
      desc: "Book apoointments just by sending details in whatsapp.",
      icon: "🖥️",
      color: "blue",
    },
    {
      title: "AI Agents",
      desc: "Manage appointments and calls with our smart AI agents.",
      icon: "🤖",
      color: "indigo",
    },
    {
      title: "Time Saving",
      desc: "AI enabled system which will manage appointments and records seamlessly.",
      icon: "⏱️",
      color: "cyan",
    },
    {
      title: "E-Prescription",
      desc: "Generate prescription in PDF form and send it directly to patient whatsapp number.",
      icon: "📝",
      color: "purple",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="py-32 px-6 bg-white dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto text-center mb-20">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-blue-600 font-bold uppercase tracking-widest text-xs bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full"
        >
          Powerful Infrastructure
        </motion.span>
        <h2 className="text-4xl md:text-5xl font-black mt-6 mb-4 text-gray-900 dark:text-white">
          Everything You Need to <span className="text-blue-600">Scale</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Tailored tools designed specifically for modern healthcare providers
          and clinic administrators.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{
              y: -10,
              boxShadow: "0 20px 40px -20px rgba(0,0,0,0.1)",
            }}
            className="group p-8 rounded-[2.5rem] bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 relative overflow-hidden"
          >
            {/* Subtle background glow on hover */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />

            <div className="mb-6 w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {f.icon}
            </div>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {f.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {f.desc}
            </p>

            <div className="mt-6 flex items-center text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Feature <span>→</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";

export default function Subscription() {
  const plans = [
    {
      name: "Basic",
      price: "799",
      description: "Small private practices.",
      features: ["50 Appointments/mo", "Basic Records", "Email Support"],
    },
    {
      name: "Plus",
      price: "1,399",
      highlight: true,
      description: "Growing medical clinics.",
      features: [
        "Unlimited Appointments",
        "SMS Reminders",
        "Priority Support",
        "Analytics",
      ],
    },
    {
      name: "Pro",
      price: "1,799",
      description: "Multi-doctor hospitals.",
      features: [
        "Multi-Clinic Sync",
        "Inventory",
        "Custom Domain",
        "Dedicated Manager",
      ],
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }, // Cards appear one after another
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="py-24 px-6 bg-white dark:bg-gray-950 transition-colors duration-500">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black mb-4 text-gray-900 dark:text-white"
        >
          Choose Your <span className="text-blue-600">Plan</span>
        </motion.h2>
        <p className="text-gray-500 dark:text-gray-400">
          Professional tools for professional healthcare.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {plans.map((p, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{
              y: -12,
              scale: p.highlight ? 1.07 : 1.03,
              boxShadow: "0px 20px 40px rgba(59, 130, 246, 0.15)",
            }}
            className={`relative p-8 rounded-[2rem] border transition-colors duration-300 ${
              p.highlight
                ? "bg-white dark:bg-gray-900 border-blue-500 shadow-xl z-10"
                : "bg-gray-50/50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800"
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">
                Recommended
              </div>
            )}

            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {p.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-gray-900 dark:text-white">
                ₹{p.price}
              </span>
              <span className="text-gray-400 text-sm">/mo</span>
            </div>

            <ul className="space-y-4 mb-10">
              {p.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {feature}
                </li>
              ))}
            </ul>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`w-full py-4 rounded-2xl font-black tracking-wide transition-all ${
                p.highlight
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 hover:bg-blue-700"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Get Started
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

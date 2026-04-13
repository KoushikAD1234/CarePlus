import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Helper component for the counting animation
const Counter = ({ target, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 60);
    const handle = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(handle);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(handle);
  }, [target]);

  return <span>{count.toLocaleString()}</span>;
};

function TrustSection() {
  const stats = [
    { label: "Clinics Joined", value: 120, suffix: "+" },
    { label: "Active Doctors", value: 450, suffix: "" },
    { label: "Appointments Booked", value: 15000, suffix: "+" },
  ];

  const testimonials = [
    {
      quote:
        "CarePlus transformed our daily workflow. The automated SMS reminders reduced our no-shows by 40%.",
      author: "Dr. Arpan Das",
      role: "Chief Surgeon, City Hospital",
      img: "👨‍⚕️",
    },
    {
      quote:
        "The most intuitive backend I've used. My staff learned the entire system in less than a day.",
      author: "Dr. Sarah Ahmed",
      role: "Founder, CareClinic",
      img: "👩‍⚕️",
    },
  ];

  return (
    <div className="py-24 px-6 bg-gray-50/50 dark:bg-gray-900/20 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* 1. Animated Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="text-center p-8 rounded-3xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 shadow-xl shadow-blue-500/5"
            >
              <h3 className="text-4xl md:text-5xl font-black text-blue-600 mb-2">
                <Counter target={stat.value} />
                {stat.suffix}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 2. Testimonials Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Trusted by{" "}
            <span className="text-blue-600">Leading Professionals</span>
          </h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full" />
        </div>

        {/* 3. Testimonial Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 shadow-lg relative"
            >
              <span className="absolute top-6 right-8 text-6xl text-blue-500/10 font-serif">
                “
              </span>
              <p className="text-gray-600 dark:text-gray-300 italic mb-8 relative z-10 leading-relaxed">
                {t.quote}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                  {t.img}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {t.author}
                  </h4>
                  <p className="text-blue-600 text-xs font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrustSection;

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Crown,
  ShieldCheck,
  Rocket,
  MessageCircle,
} from "lucide-react";

const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
    <div className="p-1 rounded-full bg-blue-500/10 text-blue-600">
      <Check size={14} />
    </div>
    {text}
  </div>
);

const PricingCard = ({
  title,
  price,
  description,
  features,
  icon: Icon,
  popular,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`relative p-10 rounded-[3rem] border transition-all duration-500 flex flex-col h-full ${
      popular
        ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/30 scale-105 z-10"
        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-white/5 shadow-xl"
    }`}
  >
    {popular && (
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-amber-400 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
        Most Popular
      </div>
    )}

    <div className="mb-8">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
          popular
            ? "bg-white/20 text-white"
            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
        }`}
      >
        <Icon size={28} />
      </div>
      <h3
        className={`text-2xl font-black tracking-tight ${
          popular ? "text-white" : "text-gray-900 dark:text-white"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-xs mt-2 font-medium ${
          popular ? "text-blue-100" : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </div>

    <div className="mb-8 flex items-baseline gap-1">
      <span className="text-4xl font-black tracking-tighter">₹{price}</span>
      <span
        className={`text-xs font-bold ${
          popular ? "text-blue-200" : "text-gray-400"
        }`}
      >
        /month
      </span>
    </div>

    <div className="space-y-4 flex-1 mb-10">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3 text-sm font-medium">
          <div
            className={`p-1 rounded-full ${
              popular
                ? "bg-white/20 text-white"
                : "bg-blue-500/10 text-blue-600"
            }`}
          >
            <Check size={14} />
          </div>
          <span
            className={
              popular ? "text-blue-50" : "text-gray-600 dark:text-gray-400"
            }
          >
            {f}
          </span>
        </div>
      ))}
    </div>

    <button
      className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
        popular
          ? "bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
      }`}
    >
      {popular ? "Upgrade to Pro" : "Current Plan"}
    </button>
  </motion.div>
);

export default function Upgrade() {
  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Crown size={14} /> Premium Access
        </div>
        <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          Scale your <span className="text-blue-600">Practice.</span>
        </h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto">
          From basic WhatsApp booking to a full AI-powered medical assistant.
          Choose the plan that fits your clinic.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center px-4">
        <PricingCard
          title="Free Trial"
          price="0"
          description="Perfect for testing with up to 50 patients."
          icon={Rocket}
          features={[
            "WhatsApp Bot Basic",
            "Dashboard Access",
            "50 Appointments/mo",
            "Email Support",
          ]}
          delay={0.1}
        />

        <PricingCard
          popular
          title="Professional"
          price="2,499"
          description="Unlimited automation for busy clinics."
          icon={Crown}
          features={[
            "Unlimited WhatsApp Slots",
            "Automated Reminders",
            "Revenue Analytics",
            "Priority Support",
            "Custom Bot Training",
          ]}
          delay={0.2}
        />

        <PricingCard
          title="Enterprise"
          price="5,999"
          description="Multi-doctor support and API access."
          icon={ShieldCheck}
          features={[
            "Multi-Doctor Dashboard",
            "White-labeled Bot",
            "EMR Integration",
            "Dedicated Manager",
            "Advanced Reporting",
          ]}
          delay={0.3}
        />
      </div>

      {/* Trust Section */}
      <div className="p-12 rounded-[3rem] bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 text-blue-600 shadow-sm">
            <MessageCircle size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900 dark:text-white">
              Need a custom plan?
            </h4>
            <p className="text-sm text-gray-500 font-medium">
              Talk to us for custom clinic integrations.
            </p>
          </div>
        </div>
        <button className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
          Contact Sales
        </button>
      </div>
    </div>
  );
}

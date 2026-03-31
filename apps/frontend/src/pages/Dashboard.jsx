import { motion } from "framer-motion";
import { Users, Calendar, IndianRupee, Zap, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const AnalyticsCard = ({ title, value, icon: Icon, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5 }}
    className="p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-xl shadow-blue-500/5 relative group"
  >
    <div className="flex justify-between items-start mb-6">
      <div
        className={`p-4 rounded-2xl bg-opacity-10 ${color.bg} ${color.text}`}
      >
        <Icon size={24} />
      </div>
      <div className="flex items-center gap-1 text-green-500 text-xs font-black bg-green-500/10 px-2 py-1 rounded-lg">
        {trend} <ArrowUpRight size={14} />
      </div>
    </div>

    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
      {title}
    </p>
    <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
      {value}
    </h3>
  </motion.div>
);

export default function DashboardHome() {
  const stats = [
    {
      title: "Today's Total Patients",
      value: "1,284",
      icon: Users,
      trend: "+12%",
      color: { bg: "bg-blue-500", text: "text-blue-600" },
    },
    {
      title: "Today's Appointments",
      value: "18",
      icon: Calendar,
      trend: "+4%",
      color: { bg: "bg-purple-500", text: "text-purple-600" },
    },
    {
      title: "Revenue (Today)",
      value: "₹42.5k",
      icon: IndianRupee,
      trend: "+18%",
      color: { bg: "bg-green-500", text: "text-green-600" },
    },
    {
      title: "Bot Efficiency",
      value: "94%",
      icon: Zap,
      trend: "+2%",
      color: { bg: "bg-orange-500", text: "text-orange-600" },
    },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-blue-600">Dr. Koushik</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Here is what's happening in your clinic today.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Current Session
          </p>
          <p className="font-bold text-sm dark:text-white">
            Monday, 30 March 2026
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <AnalyticsCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* Secondary Row: Simple Chart Placeholder & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            Patient Inflow
          </h3>
          {/* This is where your Chart will go in Phase 2 */}
          <div className="h-64 w-full bg-gray-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              Analytics Chart Coming Soon
            </p>
          </div>
        </div>

        <div className="p-8 bg-blue-600 rounded-[3rem] shadow-2xl shadow-blue-600/20 text-white relative overflow-hidden">
          <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
          <h3 className="text-xl font-black mb-2">Upgrade to Pro</h3>
          <p className="text-blue-100 text-sm mb-8 leading-relaxed font-medium">
            Unlock advanced WhatsApp automations and detailed financial reports.
          </p>
          <Link
            to="upgrade"
            className="w-full py-4 px-10 cursor-pointer bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

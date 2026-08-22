import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  IndianRupee,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAppointments } from "../apiHandler/authApiHandler/appointmentSlice";
import { fetchProfile } from "../apiHandler/authApiHandler/doctorSlice";

const AnalyticsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  isPositive,
  color,
  delay,
}) => (
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
      <div
        className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${
          isPositive
            ? "text-green-500 bg-green-500/10"
            : "text-red-500 bg-red-500/10"
        }`}
      >
        {trend}{" "}
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
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
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth || {});
  const { profile: doctorProfile } = useSelector(
    (state) => state.doctors || {}
  );
  const { items: appointments } = useSelector(
    (state) => state.appointments || { items: [] }
  );

  // Fetch doctor profile and all appointments on initial mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchProfile(user.id));
      dispatch(fetchAppointments({ date: "all" }));
    }
  }, [dispatch, user?.id]);

  // Compute dynamic stats & percentage trends (Revenue calculated ONLY for COMPLETED appointments)
  const calculatedStats = useMemo(() => {
    const todayStr = new Date().toDateString();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    // 1. Filter today's and yesterday's appointments
    const todayAppts = appointments.filter(
      (a) => new Date(a.appointment_time).toDateString() === todayStr
    );
    const yesterdayAppts = appointments.filter(
      (a) => new Date(a.appointment_time).toDateString() === yesterdayStr
    );

    // 2. Count Unique Patients for Today & Yesterday
    const todayPatientsCount = new Set(
      todayAppts.map((a) => a.patient_id || a.patient_phone)
    ).size;
    const yesterdayPatientsCount = new Set(
      yesterdayAppts.map((a) => a.patient_id || a.patient_phone)
    ).size;

    // 3. REVENUE LOGIC: Only count appointments with status === "COMPLETED"
    const doctorFee = Number(doctorProfile?.fees) || 500;

    const todayCompletedAppts = todayAppts.filter(
      (a) => a.status === "COMPLETED"
    );
    const yesterdayCompletedAppts = yesterdayAppts.filter(
      (a) => a.status === "COMPLETED"
    );

    const todayRevenue = todayCompletedAppts.length * doctorFee;
    const yesterdayRevenue = yesterdayCompletedAppts.length * doctorFee;

    // Helper to calculate percentage growth/decay (+/- %)
    const getTrend = (current, previous) => {
      if (previous === 0) {
        return {
          trend: current > 0 ? "+100%" : "0%",
          isPositive: true,
        };
      }
      const percent = Math.round(((current - previous) / previous) * 100);
      return {
        trend: `${percent >= 0 ? "+" : ""}${percent}%`,
        isPositive: percent >= 0,
      };
    };

    const patientTrend = getTrend(todayPatientsCount, yesterdayPatientsCount);
    const apptTrend = getTrend(todayAppts.length, yesterdayAppts.length);
    const revenueTrend = getTrend(todayRevenue, yesterdayRevenue);

    // Format revenue display (e.g. ₹42.5k or ₹500)
    const formatRevenue = (amount) => {
      if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}k`;
      }
      return `₹${amount}`;
    };

    return [
      {
        title: "Today's Total Patients",
        value: todayPatientsCount.toLocaleString(),
        icon: Users,
        trend: patientTrend.trend,
        isPositive: patientTrend.isPositive,
        color: { bg: "bg-blue-500", text: "text-blue-600" },
      },
      {
        title: "Today's Appointments",
        value: todayAppts.length.toString(),
        icon: Calendar,
        trend: apptTrend.trend,
        isPositive: apptTrend.isPositive,
        color: { bg: "bg-purple-500", text: "text-purple-600" },
      },
      {
        title: "Revenue (Today)",
        value: formatRevenue(todayRevenue),
        icon: IndianRupee,
        trend: revenueTrend.trend,
        isPositive: revenueTrend.isPositive,
        color: { bg: "bg-green-500", text: "text-green-600" },
      },
      {
        title: "Bot Efficiency",
        value: "94%",
        icon: Zap,
        trend: "+2%",
        isPositive: true,
        color: { bg: "bg-orange-500", text: "text-orange-600" },
      },
    ];
  }, [appointments, doctorProfile]);

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome back,{" "}
            <span className="text-blue-600">
              Dr. {doctorProfile?.name || user?.name || "Doctor"}
            </span>
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
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {calculatedStats.map((stat, i) => (
          <AnalyticsCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* Secondary Row: Chart & Upgrade Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            Patient Inflow
          </h3>
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
            className="w-full py-4 px-10 cursor-pointer bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-colors inline-block text-center"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

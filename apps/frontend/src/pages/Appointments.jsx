import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  User,
  Phone,
  MoreVertical,
  Calendar as CalendarIcon,
  MessageSquare,
} from "lucide-react";

export default function Appointments() {
  const [activeFilter, setActiveFilter] = useState("today");
  const [completedIds, setCompletedIds] = useState([]);

  // Filter Logic
  const filters = [
    { label: "Day Before Yesterday", value: "db-yesterday" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "Day After Tomorrow", value: "da-tomorrow" },
  ];

  // Dummy Data for MVP
  const appointments = [
    {
      id: "101",
      name: "Koushik Dutta",
      phone: "+91 9876543210",
      time: "10:30 AM",
      status: "BOOKED",
    },
    {
      id: "102",
      name: "Ananya Sharma",
      phone: "+91 8877665544",
      time: "11:15 AM",
      status: "BOOKED",
    },
    {
      id: "103",
      name: "Rahul Verma",
      phone: "+91 7766554433",
      time: "12:00 PM",
      status: "COMPLETED",
    },
  ];

  const toggleComplete = (id) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Patient Schedule
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage and track your consultations
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-100 dark:border-blue-800/30">
          <CalendarIcon size={16} className="text-blue-600" />
          <span className="text-xs font-black uppercase tracking-widest text-blue-600">
            March 30, 2026
          </span>
        </div>
      </div>

      {/* 5-Date Filter Scrollable Bar */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-6 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
              activeFilter === f.value
                ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20"
                : "bg-white dark:bg-gray-900 border-gray-100 dark:border-white/5 text-gray-400 hover:border-blue-600/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {appointments.map((appt, i) => {
            const isCompleted =
              completedIds.includes(appt.id) || appt.status === "COMPLETED";

            return (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                key={appt.id}
                className={`p-6 rounded-[2.5rem] bg-white dark:bg-gray-900 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group shadow-sm ${
                  isCompleted
                    ? "border-green-500/30 opacity-70"
                    : "border-gray-100 dark:border-white/5 hover:shadow-xl hover:shadow-blue-500/5"
                }`}
              >
                {/* Patient Info Section */}
                <div className="flex items-center gap-6">
                  <div
                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-xl ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                    }`}
                  >
                    {appt.name.charAt(0)}
                  </div>
                  <div>
                    <button className="text-xl font-black text-gray-900 dark:text-white hover:text-blue-600 transition-colors flex items-center gap-2">
                      {appt.name}
                      {isCompleted && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </button>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                        <Phone size={14} className="text-blue-500" />{" "}
                        {appt.phone}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                        <Clock size={14} className="text-blue-500" />{" "}
                        {appt.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end mr-4">
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg mb-1 ${
                        isCompleted
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-600"
                      }`}
                    >
                      {isCompleted ? "Visited" : "Pending"}
                    </span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      WhatsApp Source
                    </p>
                  </div>

                  <button
                    onClick={() => toggleComplete(appt.id)}
                    className={`p-4 rounded-2xl transition-all border-2 flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20"
                        : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-300 hover:border-green-500 hover:text-green-500"
                    }`}
                  >
                    <CheckCircle size={24} />
                  </button>

                  <button className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-600 transition-colors">
                    <MessageSquare size={24} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

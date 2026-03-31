import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  User,
  Phone,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";

export default function Appointments() {
  const [activeFilter, setActiveFilter] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dummy Data - In production, this comes from your NestJS API
  const [appointments, setAppointments] = useState([
    {
      id: "101",
      name: "Koushik Dutta",
      phone: "+91 9876543210",
      time: "10:30 AM",
      status: "BOOKED",
      type: "First Visit",
    },
    {
      id: "102",
      name: "Ananya Sharma",
      phone: "+91 8877665544",
      time: "11:15 AM",
      status: "BOOKED",
      type: "Follow-up",
    },
    {
      id: "103",
      name: "Rahul Verma",
      phone: "+91 7766554433",
      time: "12:00 PM",
      status: "COMPLETED",
      type: "First Visit",
    },
    {
      id: "104",
      name: "Suman Das",
      phone: "+91 9988776655",
      time: "01:30 PM",
      status: "BOOKED",
      type: "Consultation",
    },
    {
      id: "105",
      name: "Priya Rai",
      phone: "+91 9432156789",
      time: "02:15 PM",
      status: "BOOKED",
      type: "Follow-up",
    },
    {
      id: "106",
      name: "Amit Kumar",
      phone: "+91 7002123456",
      time: "03:00 PM",
      status: "BOOKED",
      type: "First Visit",
    },
  ]);

  // Logic for Search and Pagination
  const filteredData = appointments.filter(
    (appt) =>
      appt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.phone.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleStatus = (id) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id
          ? {
              ...appt,
              status: appt.status === "COMPLETED" ? "BOOKED" : "COMPLETED",
            }
          : appt
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Daily Schedule
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Monitoring {appointments.length} total sessions
          </p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 text-gray-500 hover:text-blue-600 transition-all shadow-sm">
            <Download size={20} />
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            + New Walk-in
          </button>
        </div>
      </div>

      {/* 2. Control Bar (Filter + Search) */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-blue-500/5 flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          {["Yesterday", "Today", "Tomorrow"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f.toLowerCase())}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === f.toLowerCase()
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative group min-w-[300px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search patient or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium transition-all"
          />
        </div>
      </div>

      {/* 3. The Pro Table */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 dark:border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Patient Details
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Time / Type
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              <AnimatePresence mode="wait">
                {paginatedData.map((appt) => (
                  <motion.tr
                    key={appt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {appt.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white">
                            {appt.name}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            {appt.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                          <Clock size={14} className="text-blue-500" />{" "}
                          {appt.time}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                          {appt.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          appt.status === "COMPLETED"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(appt.id)}
                          className={`p-2.5 rounded-xl transition-all ${
                            appt.status === "COMPLETED"
                              ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                              : "bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-green-500"
                          }`}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-600 transition-all">
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500">
            Showing{" "}
            <span className="text-gray-900 dark:text-white">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 dark:text-white">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{" "}
            of {filteredData.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 dark:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 dark:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

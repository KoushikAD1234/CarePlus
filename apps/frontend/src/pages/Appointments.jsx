import { useState, useMemo, useEffect } from "react";
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
  Trash2,
} from "lucide-react";
import WalkInModal from "../components/WalkInModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppointments,
  updateStatus,
  deleteAppointment
} from "../apiHandler/authApiHandler/appointmentSlice";
import PatientDetailsModal from "../components/PatientDetailsModal";

export default function Appointments() {
  const [activeFilter, setActiveFilter] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const itemsPerPage = 5;

  const dispatch = useDispatch();

  // Get data from Redux
  const { items: appointments, loading } = useSelector(
    (state) => state.appointments
  );

  // 1. Fetch appointments when filter or search changes
  useEffect(() => {
    console.log("Value of active Filter ", activeFilter);
    const params = {};
    if (activeFilter === "today") params.date = "today";
    if (activeFilter === "tomorrow") params.date = "tomorrow";
    if (activeFilter === "yesterday") params.date = "yesterday";
    if (searchQuery) params.search = searchQuery;
    console.log("Value of params ", params);
    dispatch(fetchAppointments(params));
  }, [dispatch, activeFilter, searchQuery]);

  // 2. Logic for Search and Pagination
  const filteredData = useMemo(() => {
    return (appointments || []).filter(
      (appt) =>
        appt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.patient_phone.includes(searchQuery)
    );
  }, [appointments, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id) => {
    console.log("Value of id while deleting 1 ", id);
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        console.log("Value of id while deleting 2", id);
        await dispatch(deleteAppointment(id));
        // The Redux slice should ideally filter out the deleted ID from 'items'
        // automatically, but if not, you can re-fetch:
        // dispatch(fetchAppointments({ date: activeFilter }));
      } catch (error) {
        alert("Failed to delete appointment");
      }
    }
  };

  // 3. Updated toggleStatus to use current status from data
  const toggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === "COMPLETED" ? "BOOKED" : "COMPLETED";
    dispatch(updateStatus({ id, status: nextStatus }));
  };

  // 4. Handle Walk-in (Usually involves an API call, then refresh)
  const handleAddWalkIn = async (newPatient) => {
    // In production, you'd dispatch a 'createAppointment' thunk here
    // For now, we close the modal and refresh the list
    setIsWalkInOpen(false);
    dispatch(fetchAppointments({ date: activeFilter }));
  };

  // Function to open the details
  const handleViewPatient = (appt) => {
    setSelectedAppointment(appt);
    setIsDetailsOpen(true);
  };

  // Function to handle update (from modal)
  const handleUpdateAppointment = async (updatedData) => {
    // dispatch(updateAppointmentAction(updatedData)); // Add your update thunk here
    // setIsDetailsOpen(false);
    console.log("Updated data ready for API:", updatedData);
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
            {loading
              ? "Updating..."
              : `Monitoring ${appointments.length} total sessions`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsWalkInOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
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
              onClick={() => {
                setActiveFilter(f.toLowerCase());
                setCurrentPage(1); // Reset to page 1 on filter change
              }}
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
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
              <AnimatePresence mode="popLayout">
                {paginatedData.map((appt) => (
                  <motion.tr
                    key={appt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div
                        className="flex items-center gap-4 cursor-pointer group/name"
                        onClick={() => handleViewPatient(appt)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {appt.patient_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white">
                            {appt.patient_name}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            {appt.patient_phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                          <Clock size={14} className="text-blue-500" />{" "}
                          {new Date(appt.appointment_time).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
                          onClick={() => toggleStatus(appt.id, appt.status)}
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
                        <button
                          onClick={() => handleDelete(appt.id)}
                          className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
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
              {filteredData.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
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
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 dark:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <PatientDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        appointment={selectedAppointment}
        onUpdate={handleUpdateAppointment}
      />
      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onSave={handleAddWalkIn}
      />
    </div>
  );
}

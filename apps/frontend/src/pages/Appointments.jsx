import { useState, useMemo, useEffect, useRef } from "react";
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
  createAppointments,
  updateStatus,
  deleteAppointment,
} from "../apiHandler/authApiHandler/appointmentSlice";
import PatientDetailsModal from "../components/PatientDetailsModal";
import {
  createPatient,
  getPatientByPhone,
} from "../apiHandler/authApiHandler/patientSlice";

export default function Appointments() {
  const [activeFilter, setActiveFilter] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const itemsPerPage = 5;

  const dispatch = useDispatch();
  const { items: appointments, loading } = useSelector(
    (state) => state.appointments
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        dispatch(
          fetchAppointments({ date: activeFilter, search: searchQuery })
        );
      }, 100);
      return () => clearTimeout(timer);
    } else {
      dispatch(fetchAppointments({ date: activeFilter }));
    }
  }, [dispatch, activeFilter, searchQuery]);

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
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await dispatch(deleteAppointment(id)).unwrap();
      } catch (error) {
        alert("Failed to delete appointment");
      }
    }
  };

  const toggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === "COMPLETED" ? "BOOKED" : "COMPLETED";
    dispatch(updateStatus({ id, status: nextStatus }));
  };

  const handleAddWalkIn = async (newPatient) => {
    try {
      const appointment_time = new Date(
        `${newPatient.appointment_date}T${newPatient.appointment_time}`
      ).toISOString();

      const typeMap = {
        "First Visit": "FIRST_VISIT",
        "Follow-up": "FOLLOW_UP",
      };

      let patientId;
      const existingPatient = await dispatch(
        getPatientByPhone(newPatient.phone)
      ).unwrap();

      if (existingPatient?.id) {
        patientId = existingPatient.id;
      } else {
        const createdPatient = await dispatch(
          createPatient({
            name: newPatient.name,
            phone: newPatient.phone,
            age: newPatient.age,
            gender: newPatient.gender,
            address: newPatient.address,
          })
        ).unwrap();
        patientId = createdPatient.id;
      }

      await dispatch(
        createAppointments({
          patient_id: patientId,
          doctor_id: user?.id,
          patient_name: newPatient.name,
          patient_phone: newPatient.phone,
          appointment_time,
          type: typeMap[newPatient.type],
        })
      ).unwrap();

      setIsWalkInOpen(false);
      dispatch(fetchAppointments({ date: activeFilter }));
    } catch (err) {
      console.error("Walk-in failed:", err);
    }
  };

  const handleViewPatient = (appt) => {
    setSelectedAppointment(appt);
    setIsDetailsOpen(true);
  };

  const handleUpdateAppointment = async (updatedData) => {
    console.log("Updated data ready for API:", updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Daily Schedule
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {loading
              ? "Syncing data..."
              : `Monitoring ${appointments.length} total sessions`}
          </p>
        </div>
        <button
          onClick={() => setIsWalkInOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          + New Walk-in
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          {["Yesterday", "Today", "Tomorrow"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setActiveFilter(f.toLowerCase());
                setCurrentPage(1);
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
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-6 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-blue-600/30 outline-none dark:text-white text-sm font-medium transition-all"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 dark:border-white/5">
                {/* Serial Number Header */}
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 w-16">
                  S.No
                </th>
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
            <AnimatePresence mode="wait">
              <motion.tbody
                key={activeFilter}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: loading ? 0.6 : 1 }}
                exit={{ opacity: 0.5 }}
                transition={{ duration: 0.2 }}
                className="divide-y divide-gray-50 dark:divide-white/5"
              >
                {paginatedData.map((appt, index) => (
                  <motion.tr
                    key={appt.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group"
                  >
                    {/* Serial Number Cell */}
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-gray-400">
                        {((currentPage - 1) * itemsPerPage + (index + 1))
                          .toString()
                          .padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        className="flex items-center gap-4 cursor-pointer"
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
                          <Clock size={14} className="text-blue-500" />
                          {new Date(appt.appointment_time).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
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
                              ? "bg-green-500 text-white"
                              : "bg-gray-50 dark:bg-white/5 text-gray-400"
                          }`}
                        >
                          <CheckCircle size={18} />
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
                {paginatedData.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-12 text-center text-gray-400 text-sm font-medium"
                    >
                      No appointments found for this period.
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>

        {/* Pagination Footer */}
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

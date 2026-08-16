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
  NotepadText,
  X,
  FileDown,
  Send,
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
import { jsPDF } from "jspdf";

export default function Appointments() {
  const [activeFilter, setActiveFilter] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [prescriptionAppt, setPrescriptionAppt] = useState(null);
  const [isSending, setIsSending] = useState(false);
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

  const handlePrescription = (appt) => {
    setPrescriptionAppt(appt);
    setPrescriptionText("");
    setIsPrescriptionOpen(true);
  };

  // // Generate Clean Prescription PDF
  // const generatePDF = () => {
  //   if (!prescriptionAppt) return;
  //   const doc = new jsPDF();

  //   const patientName = prescriptionAppt.patient_name || "N/A";
  //   const patientPhone = prescriptionAppt.patient_phone || "N/A";
  //   const appointmentDate = prescriptionAppt.appointment_time
  //     ? new Date(prescriptionAppt.appointment_time).toLocaleDateString()
  //     : new Date().toLocaleDateString();
  //   const appointmentTime = prescriptionAppt.appointment_time
  //     ? new Date(prescriptionAppt.appointment_time).toLocaleTimeString([], {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       })
  //     : "N/A";

  //   // --- Background Tint & Top Line ---
  //   doc.setFillColor(250, 251, 253);
  //   doc.rect(0, 0, 210, 297, "F");

  //   doc.setFillColor(37, 99, 235); // CarePlus Accent Blue
  //   doc.rect(0, 0, 210, 4, "F");

  //   // --- Primary Doctor Header (Left Side) ---
  //   doc.setTextColor(15, 23, 42);
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(22);
  //   doc.text(`Dr. ${user?.name || "Koushik Chakraborty"}`, 14, 22);

  //   doc.setFontSize(9.5);
  //   doc.setFont("helvetica", "normal");
  //   doc.setTextColor(100, 116, 139);
  //   doc.text("General Physician & Specialist", 14, 28);
  //   doc.text(`Prescription Date: ${appointmentDate}`, 14, 34);

  //   // --- Powered by CarePlus Branding (Top Right) ---
  //   doc.setFontSize(7.5);
  //   doc.setFont("helvetica", "bold");
  //   doc.setTextColor(148, 163, 184);
  //   doc.text("POWERED BY", 196, 19, { align: "right" });

  //   doc.setFontSize(14);
  //   doc.setFont("helvetica", "bold");
  //   doc.setTextColor(37, 99, 235);
  //   doc.text("CarePlus", 196, 25, { align: "right" });

  //   doc.setFontSize(7.5);
  //   doc.setFont("helvetica", "normal");
  //   doc.setTextColor(148, 163, 184);
  //   doc.text("Provider Portal v1.0", 196, 30, { align: "right" });

  //   // Header Divider Line
  //   doc.setDrawColor(226, 232, 240);
  //   doc.setLineWidth(0.5);
  //   doc.line(14, 39, 196, 39);

  //   // --- Patient Details Card ---
  //   doc.setFillColor(255, 255, 255);
  //   doc.roundedRect(14, 44, 182, 24, 3, 3, "FD");
  //   doc.setDrawColor(226, 232, 240);

  //   // Patient Column 1
  //   doc.setTextColor(100, 116, 139);
  //   doc.setFontSize(8);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("PATIENT NAME", 20, 52);
  //   doc.setTextColor(15, 23, 42);
  //   doc.setFontSize(10);
  //   doc.text(patientName, 20, 60);

  //   // Patient Column 2
  //   doc.setTextColor(100, 116, 139);
  //   doc.setFontSize(8);
  //   doc.text("PHONE NUMBER", 85, 52);
  //   doc.setTextColor(15, 23, 42);
  //   doc.setFontSize(10);
  //   doc.text(patientPhone, 85, 60);

  //   // Patient Column 3
  //   doc.setTextColor(100, 116, 139);
  //   doc.setFontSize(8);
  //   doc.text("TIME / TYPE", 145, 52);
  //   doc.setTextColor(15, 23, 42);
  //   doc.setFontSize(10);
  //   doc.text(
  //     `${appointmentTime} (${prescriptionAppt.type || "Visit"})`,
  //     145,
  //     60
  //   );

  //   // --- Small Rx Symbol & Divider Line ---
  //   doc.setTextColor(37, 99, 235);
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(16); // Small Rx size
  //   doc.text("Rx", 14, 80);

  //   doc.setDrawColor(37, 99, 235);
  //   doc.setLineWidth(0.6);
  //   doc.line(14, 84, 196, 84); // Divider line right under Rx

  //   // --- Main Prescription & Advice Text Area ---
  //   doc.setTextColor(30, 41, 59);
  //   doc.setFont("helvetica", "normal");
  //   doc.setFontSize(10);

  //   const notesText = prescriptionText || "No notes or medicines written.";
  //   const splitNotes = doc.splitTextToSize(notesText, 182);

  //   // Renders the doctor's free-form notes directly below the line
  //   doc.text(splitNotes, 14, 94);

  //   // --- Clean Footer ---
  //   const footerY = 280;
  //   doc.setDrawColor(226, 232, 240);
  //   doc.setLineWidth(0.4);
  //   doc.line(14, footerY, 196, footerY);

  //   doc.setFontSize(7.5);
  //   doc.setTextColor(148, 163, 184);
  //   doc.text(
  //     "Electronically generated prescription issued via CarePlus Provider Portal.",
  //     14,
  //     footerY + 5
  //   );
  //   doc.text(
  //     `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString(
  //       [],
  //       { hour: "2-digit", minute: "2-digit" }
  //     )}`,
  //     196,
  //     footerY + 5,
  //     { align: "right" }
  //   );

  //   // Download PDF
  //   doc.save(`Prescription_${patientName.replace(/\s+/g, "_")}.pdf`);
  // };

  // Generate Styled Prescription PDF
  const generatePDF = () => {
    if (!prescriptionAppt) return;
    const doc = new jsPDF();

    const patientName = prescriptionAppt.patient_name || "N/A";
    const patientPhone = prescriptionAppt.patient_phone || "N/A";
    const appointmentDate = prescriptionAppt.appointment_time
      ? new Date(prescriptionAppt.appointment_time).toLocaleDateString()
      : new Date().toLocaleDateString();
    const appointmentTime = prescriptionAppt.appointment_time
      ? new Date(prescriptionAppt.appointment_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    // --- Page Background Tint ---
    doc.setFillColor(250, 252, 255);
    doc.rect(0, 0, 210, 297, "F");

    // --- Dual-Tone Top Accent Bar ---
    doc.setFillColor(37, 99, 235); // CarePlus Blue
    doc.rect(0, 0, 140, 5, "F");
    doc.setFillColor(99, 102, 241); // Indigo Gradient Accent
    doc.rect(140, 0, 70, 5, "F");

    // --- Doctor Header Info (Left) ---
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`Dr. ${user?.name || "Koushik Chakraborty"}`, 14, 24);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("General Physician & Clinical Specialist", 14, 30);
    doc.text(`Date: ${appointmentDate}`, 14, 36);

    // --- Powered by CarePlus Badge (Top Right) ---
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(142, 14, 54, 24, 3, 3, "F");
    doc.setDrawColor(219, 234, 254);
    doc.setLineWidth(0.3);
    doc.roundedRect(142, 14, 54, 24, 3, 3, "D");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("POWERED BY", 169, 20, { align: "center" });

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("CarePlus", 169, 27, { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Provider Portal v1.0", 169, 33, { align: "center" });

    // Subtle Header Separator Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 43, 196, 43);

    // --- Modern Patient Floating Bar ---
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 49, 182, 26, 4, 4, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 49, 182, 26, 4, 4, "D");

    // Side Color Marker Tag
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, 49, 3, 26, 1.5, 1.5, "F");

    // Patient Column 1
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT NAME", 24, 58);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(patientName, 24, 66);

    // Patient Column 2
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("PHONE NUMBER", 88, 58);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(patientPhone, 88, 66);

    // Patient Column 3
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("TIME / VISIT TYPE", 148, 58);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(
      `${appointmentTime} (${prescriptionAppt.type || "Visit"})`,
      148,
      66
    );

    // --- Rx Symbol Header ---
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, 84, 12, 12, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Rx", 20, 91.5, { align: "center" });

    // Rx Section Accent Divider Line
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.8);
    doc.line(30, 90, 196, 90);

    // --- Prescription Body Container ---
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 102, 182, 160, 4, 4, "F");
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 102, 182, 160, 4, 4, "D");

    // Prescription / Advice Text
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const notesText =
      prescriptionText || "No prescriptions or medical advice written.";
    const splitNotes = doc.splitTextToSize(notesText, 172);
    doc.text(splitNotes, 19, 112);

    // --- Minimal Footer ---
    const footerY = 278;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, footerY, 196, footerY);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Electronically generated prescription issued via CarePlus Provider Portal.",
      14,
      footerY + 6
    );
    doc.text(
      `Issued: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}`,
      196,
      footerY + 6,
      { align: "right" }
    );

    // Save File
    doc.save(`Prescription_${patientName.replace(/\s+/g, "_")}.pdf`);
  };

  // Send WhatsApp Prescription via NestJS API
  const handleSendPrescription = async () => {
    if (!prescriptionText.trim()) {
      alert("Please write a prescription before sending.");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(
        "http://localhost:3000/appointments/send-prescription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId: prescriptionAppt?.id,
            patientPhone: prescriptionAppt?.patient_phone,
            patientName: prescriptionAppt?.patient_name,
            doctorName: user?.name || "Koushik Chakraborty",
            prescriptionText: prescriptionText,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          `Prescription sent via WhatsApp to ${
            prescriptionAppt?.patient_name || "the patient"
          }!`
        );
        setIsPrescriptionOpen(false);
      } else {
        alert(`Failed to send: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending WhatsApp prescription:", error);
      alert("Error connecting to backend server.");
    } finally {
      setIsSending(false);
    }
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
                          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                            appt.status === "COMPLETED"
                              ? "bg-green-500 text-white"
                              : "bg-gray-50 dark:bg-white/5 text-gray-400"
                          }`}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(appt.id)}
                          className="p-2.5 rounded-xl cursor-pointer bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handlePrescription(appt)}
                          className="p-2.5 rounded-xl cursor-pointer bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-green-500 hover:text-white transition-all"
                        >
                          <NotepadText size={18} />
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

      {/* Prescription Modal */}
      <AnimatePresence>
        {isPrescriptionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:pl-64 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-white/10 space-y-5"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    Prescription Entry
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Patient: {prescriptionAppt?.patient_name || "N/A"} (
                    {prescriptionAppt?.patient_phone || "N/A"})
                  </p>
                </div>
                <button
                  onClick={() => setIsPrescriptionOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Clinical Notes & RX Details */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                  Clinical Notes & Prescribed Medications
                </label>
                <textarea
                  rows={5}
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder="Enter medications, dosage (e.g., Paracetamol 650mg - 1-0-1), and clinical advice..."
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-600 outline-none text-sm font-medium text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={generatePDF}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-all cursor-pointer"
                >
                  <FileDown size={16} /> Download PDF
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPrescriptionOpen(false)}
                    className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendPrescription}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <Send size={14} /> Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

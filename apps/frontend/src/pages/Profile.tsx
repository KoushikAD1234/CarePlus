import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Award,
  ShieldCheck,
  Stethoscope,
  MapPin,
  Edit3,
  Building,
  X,
  Camera,
  Save,
  Loader2,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateProfile,
  fetchBookingQR
} from "../apiHandler/authApiHandler/doctorSlice";

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  registration_number: string;
  specialization: string;
  address: string;
  fees?: number;
  clinic_name?: string;
  avatar_url?: string;
}

// Translates technical or backend error messages into clear, friendly text
const getFriendlyErrorMessage = (err: any) => {
  if (!err)
    return "We couldn't save your profile changes. Please double-check your information and try again.";

  let rawText = "";
  if (typeof err === "string") {
    rawText = err;
  } else if (Array.isArray(err)) {
    rawText = err.join(" ");
  } else if (typeof err === "object") {
    const candidate =
      err.message ||
      err.data?.message ||
      err.response?.data?.message ||
      err.error;
    if (Array.isArray(candidate)) {
      rawText = candidate.join(" ");
    } else if (typeof candidate === "string") {
      rawText = candidate;
    } else {
      rawText = JSON.stringify(err);
    }
  }

  const cleanMsg = String(rawText).toLowerCase();

  if (
    cleanMsg.includes("file") ||
    cleanMsg.includes("image") ||
    cleanMsg.includes("size") ||
    cleanMsg.includes("large")
  ) {
    return "The selected image file is too large or unsupported. Please choose a JPG, PNG, or WEBP image under 2MB.";
  }
  if (cleanMsg.includes("phone") || cleanMsg.includes("number")) {
    return "Please enter a valid phone number so patients and clinic staff can reach you.";
  }
  if (
    cleanMsg.includes("network") ||
    cleanMsg.includes("fetch") ||
    cleanMsg.includes("connect")
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }
  if (cleanMsg.includes("500") || cleanMsg.includes("server")) {
    return "Our system experienced a temporary hiccup while saving. Please wait a moment and try again.";
  }

  if (
    typeof rawText === "string" &&
    rawText.length > 0 &&
    rawText.length < 120 &&
    !rawText.includes("{")
  ) {
    return rawText;
  }

  return "We couldn't save your profile changes right now. Please verify your details and try again.";
};

const Profile = () => {
  const dispatch = useDispatch<any>();

  // Redux Selectors with defensive fallbacks
  const {
    profile,
    loading,
    updating,
    error,
    bookingLink,
    bookingQr,
    bookingCode,
    qrLoading,
  } = useSelector((state: any) => state.doctors || {});
  const { user } = useSelector((state: any) => state.auth || {});

  // Modal & Edit Form States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<DoctorProfile>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Safe Doctor ID retrieval
  const currentDoctorId = user?.id || localStorage.getItem("doctorId");

  // Fetch Doctor Profile on Mount if missing
  useEffect(() => {
    if (currentDoctorId && !profile) {
      dispatch(fetchProfile(currentDoctorId));
    }
  }, [dispatch, currentDoctorId, profile]);

  useEffect(() => {
    if (currentDoctorId) {
      dispatch(fetchBookingQR(currentDoctorId));
    }
  }, [dispatch, currentDoctorId]);

  // Open Edit Modal and sync local form state
  const handleOpenEdit = () => {
    if (profile) {
      setFormData({ ...profile });
      setAvatarPreview(profile.avatar_url || "");
      setSelectedFile(null);
      setLocalError(null);
    }
    setIsEditOpen(true);
  };

  // Input Field Change Handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLocalError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "fees" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // Avatar Image Selection Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setLocalError(
          "Selected profile picture is larger than 2MB. Please select a smaller image."
        );
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setAvatarPreview(imageUrl);
    }
  };

  // Submit Profile Updates to Backend
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const targetId = profile?.id || currentDoctorId;
    if (!targetId) {
      setLocalError(
        "Unable to locate your account profile. Please re-login and try again."
      );
      return;
    }

    const data = new FormData();
    if (selectedFile) {
      data.append("file", selectedFile);
    }

    Object.keys(formData).forEach((key) => {
      const val = (formData as any)[key];
      if (val !== undefined && val !== null) {
        data.append(key, val.toString());
      }
    });

    const resultAction = await dispatch(
      updateProfile({ id: targetId, body: data })
    );

    if (updateProfile.fulfilled.match(resultAction)) {
      setIsEditOpen(false);
      setSelectedFile(null);
    } else {
      setLocalError(getFriendlyErrorMessage(resultAction.payload || error));
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Doctor Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Manage your professional identification, qualifications, and
            practice details
          </p>
        </div>

        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          Update Profile
        </button>
      </div>

      {/* Main Content Card Container */}
      <div className="bg-[#0e1626]/80 backdrop-blur-md border border-slate-800/80 rounded-[2.5rem] p-6 shadow-2xl space-y-8">
        {/* Doctor Header Banner Card */}
        <div className="flex items-center gap-5 p-5 bg-[#090d16] border border-slate-800/60 rounded-2xl">
          <div className="relative w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-2xl shadow-inner overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Doctor Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              profile?.name?.charAt(0).toUpperCase() || "D"
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">
              Dr. {profile?.name || "Koushik Chakraborty"}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-400 uppercase">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{profile?.specialization || "General Physician"}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Booking */}
        <div className="p-6 bg-[#090d16] border border-slate-800/60 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* QR */}
            <div className="shrink-0">
              {qrLoading ? (
                <div className="w-40 h-40 flex items-center justify-center bg-slate-900 rounded-2xl">
                  <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                </div>
              ) : bookingQr ? (
                <div className="p-3 bg-white rounded-2xl">
                  <img
                    src={bookingQr}
                    alt="WhatsApp Booking QR Code"
                    className="w-36 h-36"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-slate-900 rounded-2xl text-slate-500 text-xs text-center">
                  QR unavailable
                </div>
              )}
            </div>

            {/* Information */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  WhatsApp Appointment Booking
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Let patients book appointments with you directly through
                  WhatsApp.
                </p>
              </div>

              {bookingLink && (
                <>
                  <div className="p-3 bg-[#111927] border border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">
                      Your booking link
                    </p>

                    <p className="text-sm text-blue-400 break-all">
                      {bookingLink}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Open WhatsApp */}
                    <a
                      href={bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      Open WhatsApp
                    </a>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(bookingLink);
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      Copy Booking Link
                    </button>
                  </div>
                </>
              )}

              {bookingCode && (
                <p className="text-xs text-slate-500">
                  Booking code:{" "}
                  <span className="text-slate-300 font-mono">
                    {bookingCode}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detail Fields Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-[#090d16]/60 border border-slate-800/40 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Email Address</span>
            </div>
            <p className="text-slate-200 font-medium">
              {profile?.email || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-[#090d16]/60 border border-slate-800/40 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              <span>Phone Number</span>
            </div>
            <p className="text-slate-200 font-medium">
              {profile?.phone || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-[#090d16]/60 border border-slate-800/40 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Award className="w-3.5 h-3.5 text-blue-500" />
              <span>Qualification</span>
            </div>
            <p className="text-slate-200 font-medium">
              {profile?.qualification || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-[#090d16]/60 border border-slate-800/40 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Registration Number</span>
            </div>
            <p className="text-slate-200 font-medium">
              {profile?.registration_number || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-[#090d16]/60 border border-slate-800/40 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Building className="w-3.5 h-3.5 text-blue-500" />
              <span>Clinic Name</span>
            </div>
            <p className="text-slate-200 font-medium">
              {profile?.clinic_name || "CarePlus Main Clinic"}
            </p>
          </div>

          <div className="p-4 bg-[#090d16]/60 border border-slate-800/40 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
              <span>Specialization</span>
            </div>
            <p className="text-slate-200 font-medium">
              {profile?.specialization || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-[#090d16]/60 border border-slate-800/40 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <IndianRupee className="w-3.5 h-3.5 text-blue-500" />
              <span>Consultation Fees</span>
            </div>
            <p className="text-slate-200 font-medium">
              {profile?.fees !== undefined ? `₹${profile.fees}` : "N/A"}
            </p>
          </div>

          <div className="md:col-span-2 p-4 bg-[#090d16]/60 border border-slate-800/40 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>Practice Address</span>
            </div>
            <p className="text-slate-200 font-medium">
              {profile?.address || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Styled Theme Modal Dialog */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-64 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b111e] border border-slate-800/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-800/60 bg-[#060a12]">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Update Doctor Profile
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSave}
              className="p-6 overflow-y-auto space-y-5 bg-[#0b111e]"
            >
              {/* User Friendly Animated Error Banner */}
              <AnimatePresence>
                {(localError || error) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 shadow-sm"
                  >
                    <div className="p-2 bg-red-500/20 rounded-xl shrink-0 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="text-xs leading-relaxed">
                      <p className="font-extrabold uppercase tracking-wider text-[10px] text-red-400 mb-0.5">
                        Unable to Save Profile
                      </p>
                      <p className="font-medium text-slate-300">
                        {localError || getFriendlyErrorMessage(error)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Photo Upload Row */}
              <div className="flex items-center gap-4 p-3 bg-[#111927] border border-slate-800/60 rounded-2xl">
                <div className="relative w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xl overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    formData.name?.charAt(0).toUpperCase() || "D"
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <label
                    htmlFor="avatar-upload"
                    className="text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Change Profile Photo
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    JPG, PNG or WEBP (Max 2MB)
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="w-full bg-[#111927] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="w-full bg-[#111927] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification || ""}
                    onChange={handleChange}
                    className="w-full bg-[#111927] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number || ""}
                    onChange={handleChange}
                    className="w-full bg-[#111927] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization || ""}
                    onChange={handleChange}
                    className="w-full bg-[#111927] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                    Consultation Fees (₹)
                  </label>
                  <input
                    type="number"
                    name="fees"
                    value={formData.fees ?? ""}
                    onChange={handleChange}
                    className="w-full bg-[#111927] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    name="clinic_name"
                    value={formData.clinic_name || ""}
                    onChange={handleChange}
                    className="w-full bg-[#111927] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                    Practice Address
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address || ""}
                    onChange={handleChange}
                    className="w-full bg-[#111927] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 bg-[#111927] hover:bg-slate-800 text-slate-300 font-medium text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

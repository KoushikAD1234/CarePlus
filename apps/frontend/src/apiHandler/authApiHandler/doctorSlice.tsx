import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchProfile = createAsyncThunk(
  "doctors/fetchProfile",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/doctor/${id}`);
      return res.data;
    } catch (err) {
      console.log("Error while fetching profile:", err);
      return rejectWithValue(err.response?.data || "Failed to load profile");
    }
  }
);

export const fetchBookingQR = createAsyncThunk(
  "doctors/fetchBookingQR",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/doctor/${id}/qr`);
      return res.data;
    } catch (err) {
      console.log("Error while fetching booking QR:", err);

      return rejectWithValue(err.response?.data || "Failed to load booking QR");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "doctors/updateProfile",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/doctor/${id}`, body);
      return res.data;
    } catch (err) {
      console.log("Error while updating profile:", err);
      return rejectWithValue(err.response?.data || "Update failed");
    }
  }
);

const doctorSlice = createSlice({
  name: "doctors",
  initialState: {
    profile: null,
    bookingLink: "",
    bookingCode: "",
    bookingQr: "",
    loading: false,
    updating: false,
    qrLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      //fetch url
      .addCase(fetchBookingQR.pending, (state) => {
        state.qrLoading = true;
      })

      .addCase(fetchBookingQR.fulfilled, (state, action) => {
        state.qrLoading = false;

        state.bookingLink = action.payload.link;
        state.bookingCode = action.payload.bookingCode;
        state.bookingQr = action.payload.qr;
      })

      .addCase(fetchBookingQR.rejected, (state, action) => {
        state.qrLoading = false;
        state.error = action.payload;
      });
  },
});

export default doctorSlice.reducer;

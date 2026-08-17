import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get("/appointments", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Something went wrong");
    }
  }
);

export const createAppointments = createAsyncThunk(
    "appointments/createAppointments",
    async(data, thunkAPI) => {
        try {
            const res = await api.post('/appointments', data);
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data);
        }
    }
)

export const updateStatus = createAsyncThunk(
  "appointments/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Update failed");
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  "appointments/delete",
  async (id: string, thunkAPI) => {
    try {
      console.log("Thunk received id:", id); // debug

      await api.delete(`/appointments/${id}`);

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointments", // Changed to plural to match your store/useSelector
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true; // FIXED: Should be TRUE when pending
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false; // FIXED: Should be FALSE when done
        state.items = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.items = state.items.filter((itr) => itr.id !== action.payload)
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default appointmentSlice.reducer;

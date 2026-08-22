import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// CREATE PATIENT
export const createPatient = createAsyncThunk(
  "patients/create",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/patients", data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// GET PATIENT BY PHONE
// export const getPatientByPhone = createAsyncThunk(
//   "patients/getByPhone",
//   async (phone, thunkAPI) => {
//     try {
//       const res = await api.get(`/patients?phone=${phone}`);
//       return res.data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data);
//     }
//   }
// );

// GET Patient by patient_id
export const getPatientById = createAsyncThunk(
  "patients/getPatientById",
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch patient");
    }
  }
);

const patientSlice = createSlice({
  name: "patients",
  initialState: {
    patient: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPatient: (state) => {
      state.patient = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // CREATE PATIENT
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patient = action.payload;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET PATIENT BY PHONE
      // .addCase(getPatientByPhone.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(getPatientByPhone.fulfilled, (state, action) => {
      //   state.loading = false;

      //   // backend returns array
      //   state.patient = action.payload?.[0] || null;
      // })
      // .addCase(getPatientByPhone.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // });

      .addCase(getPatientById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPatientById.fulfilled, (state, action) => {
        state.loading = false;

        // backend returns array
        state.patient = action.payload?.[0] || null;
      })
      .addCase(getPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPatient } = patientSlice.actions;
export default patientSlice.reducer;
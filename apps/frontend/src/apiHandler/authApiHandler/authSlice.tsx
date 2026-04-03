import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../services/api';
import { AxiosError } from "axios";


// REGISTER
export const registerUser = createAsyncThunk(
    '/auth/signup',
    async(data, thunkAPI) => {
        try {
            const res = await api.post('/auth/signup', data);
            return res.data;
        } catch (error) {
            console.log(error);
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

// LOGIN
export const loginUser = createAsyncThunk(
    '/auth/login',
    async(data, thunkAPI) => {
        try {
            const res = await api.post('/auth/login', data);
            return res.data;
        } catch(error) {
            console.log(error);
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// FORGOT PASSWORD
export const forgotPassword = createAsyncThunk(
  "/auth/forgot-password",
  async (email, thunkAPI) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return res.data;
    } catch (error) {
        const err = error as AxiosError<any>;
      return thunkAPI.rejectWithValue(
        err?.response?.data || "Something went wrong"
      );
    }
  }
);

// RESET PASSWORD
export const resetPassword = createAsyncThunk(
  "/auth/reset-password",
  async ({ email, otp, newPassword }, thunkAPI) => {
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return res.data;
    } catch (error) {
        const err = error as AxiosError<any>;
      return thunkAPI.rejectWithValue(
        err?.response?.data || "Something went wrong"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    access_token: localStorage.getItem("access_token") || null,
    loading: false,
    error: null,
    message: null,
    registrationSuccess: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("access_token");
    },
    resetRegStatus: (state) => {
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
        state.message = "Registration successful";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.access_token;
        state.message = "Registration successful";

        localStorage.setItem("access_token", action.payload.access_token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearMessage } = authSlice.actions;
export default authSlice.reducer;
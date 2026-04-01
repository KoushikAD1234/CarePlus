import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../services/api';


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
    '/forgotPassword',
    async(email, thunkAPI) => {
        try {
            const res = await api.post('/forgotPassword', {email});
            return res.data;
        } catch(error) {
            console.log(error);
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// RESET PASSWORD

export const resetPassword = createAsyncThunk(
    '/resetPassword',
    async({access_token, password}, thunkAPI) => {
        try {
            const res = await api.post('/resetPassword', {access_token, password});
            return res.data;
        } catch(error) {
            console.log(error);
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        access_token: localStorage.getItem('access_token') || null,
        loading: false,
        error: null,
        message: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.access_token = null;
            localStorage.removeItem('access_token');
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
                state.message = "Registration successful";
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

                localStorage.setItem('access_token', action.payload.access_token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            //FORGOT PASSWORD
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.message = action.payload.message;
            })

            //RESET PASSWORD
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.message = action.payload.message;
            })

    },
});

export const { logout, clearMessage } = authSlice.actions;
export default authSlice.reducer;
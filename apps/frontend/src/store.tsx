import { configureStore } from "@reduxjs/toolkit";
import authReducer from './apiHandler/authApiHandler/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
    }
})
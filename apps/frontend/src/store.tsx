import { configureStore } from "@reduxjs/toolkit";
import authReducer from './apiHandler/authApiHandler/authSlice';
import appointmentReducer from './apiHandler/authApiHandler/appointmentSlice'
import patientReducer from "./apiHandler/authApiHandler/patientSlice";
import contactReducer from "./apiHandler/authApiHandler/contactSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        appointments: appointmentReducer,
        patients: patientReducer,
        contact: contactReducer,
    }
})
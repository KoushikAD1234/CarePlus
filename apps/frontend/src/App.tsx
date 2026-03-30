import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import MainLayout from "./pages/MainLayout";
import Appointments from "./pages/Appointments";
import DashboardHome from "./pages/Dashboard"; // Ensure this matches your filename
import ContactPage from "./pages/Contact";
import Upgrade from "./pages/Upgrade";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Dashboard Parent Route: 
          MainLayout will stay visible for all children 
        */}
        <Route path="/dashboard" element={<MainLayout />}>
          {/* This renders at /dashboard */}
          <Route index element={<DashboardHome />} />

          {/* This renders at /dashboard/appointments */}
          <Route path="appointments" element={<Appointments />} />

          {/* Placeholder for future Phase 3 pages */}
          <Route
            path="upgrade"
            element={<Upgrade />}
          />
          <Route
            path="contact"
            element={<ContactPage />}
          />
        </Route>

        {/* Fallback: Redirect unknown routes to Landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

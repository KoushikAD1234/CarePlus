import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BackgroundBlobs from "../components/BackgroundBlobs";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500 overflow-hidden">
      {/* 1. Static Sidebar: Stays fixed on the left */}
      <Sidebar />

      {/* 2. Dynamic Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative p-8 md:p-12">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <BackgroundBlobs />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* The <Outlet /> is the magic spot. 
            React Router will swap <DashboardHome /> or <Appointments /> 
            into this exact position based on the URL.
          */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

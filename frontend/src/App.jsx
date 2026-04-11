import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Recommendations from "./pages/Recommendations";
import Tracker from "./pages/Tracker";
import ChatPage from "./pages/ChatPage";
import UniversityDetails from "./pages/UniversityDetails";
import Compare from "./pages/Compare";

export default function App() {
  const location = useLocation();
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [location.pathname]);

  const isHomePage = location.pathname === "/";

  if (isHomePage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="ml-[280px] flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/universities/:id" element={<UniversityDetails />} />
          <Route path="/university-details" element={<UniversityDetails />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
    </div>
  );
}

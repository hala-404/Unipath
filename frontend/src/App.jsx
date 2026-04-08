import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Recommendations from "./pages/Recommendations";
import Tracker from "./pages/Tracker";
import ChatPage from "./pages/ChatPage";
import UniversityDetails from "./pages/UniversityDetails";

export default function App() {
  const location = useLocation();
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/universities/:id" element={<UniversityDetails />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </div>
  );
}
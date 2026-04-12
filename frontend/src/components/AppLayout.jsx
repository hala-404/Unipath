import {
  LayoutDashboard,
  Sparkles,
  GitCompareArrows,
  ClipboardList,
  MessageCircle,
  UserCircle,
  LogOut,
  Sun,
  Moon,
  Globe,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { name: "Recommendations", icon: Sparkles, key: "recommendations" },
  { name: "Compare", icon: GitCompareArrows, key: "compare" },
  { name: "Application Tracker", icon: ClipboardList, key: "tracker" },
  { name: "AI Advisor", icon: MessageCircle, key: "advisor" },
  { name: "Profile", icon: UserCircle, key: "profile" },
];

export default function AppLayout({
  active = "advisor",
  darkMode = true,
  setDarkMode,
  children,
}) {
  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-[#06111f] text-white"
          : "min-h-screen bg-[#f6f7f4] text-[#111827]"
      }
    >
      <div className="flex min-h-screen">
        <aside
          className={
            darkMode
              ? "w-[270px] border-r border-white/10 bg-[#081427] flex flex-col justify-between"
              : "w-[270px] border-r border-black/10 bg-[#f3f4f1] flex flex-col justify-between"
          }
        >
          <div>
            <div
              className={
                darkMode
                  ? "flex items-center gap-3 px-6 py-6 border-b border-white/10"
                  : "flex items-center gap-3 px-6 py-6 border-b border-black/10"
              }
            >
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                U
              </div>
              <div className="text-2xl font-bold tracking-tight">UniPath</div>
            </div>

            <nav className="px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;

                return (
                  <button
                    key={item.key}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? darkMode
                          ? "bg-white/10 text-white"
                          : "bg-black/8 text-black"
                        : darkMode
                        ? "text-slate-300 hover:bg-white/5 hover:text-white"
                        : "text-slate-600 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-[18px] font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            className={
              darkMode
                ? "px-4 py-5 border-t border-white/10"
                : "px-4 py-5 border-t border-black/10"
            }
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Globe size={18} />
                <span className="text-base font-medium">English</span>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={
                  darkMode
                    ? "h-10 w-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition"
                    : "h-10 w-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition"
                }
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                darkMode
                  ? "text-slate-300 hover:bg-white/5 hover:text-white"
                  : "text-slate-600 hover:bg-black/5 hover:text-black"
              }`}
            >
              <LogOut size={20} />
              <span className="text-[18px] font-medium">Sign out</span>
            </button>

            <button
              className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition ${
                darkMode
                  ? "text-slate-400 hover:bg-white/5 hover:text-white"
                  : "text-slate-500 hover:bg-black/5 hover:text-black"
              }`}
            >
              <ChevronLeft size={18} />
              <span className="text-[18px]">Collapse</span>
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

import { NavLink } from "react-router-dom";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/react";
import {
  LayoutDashboard,
  Sparkles,
  GitCompareArrows,
  ClipboardList,
  MessageCircle,
  UserCircle2,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import useTheme from "../hooks/useTheme";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/recommendations", label: "Recommendations", icon: Sparkles },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
  { to: "/tracker", label: "Application Tracker", icon: ClipboardList },
  { to: "/chat", label: "AI Advisor", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
];

function SidebarLink({ to, label, icon: Icon, disabled = false }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-400 dark:text-slate-500">
        <Icon className="h-5 w-5" />
        <span className="text-base font-medium">{label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition ${
          isActive
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Navbar() {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800">
        <div className="text-3xl font-bold text-emerald-500">UniPath</div>
      </div>

      <div className="flex-1 px-4 py-4">
        <div className="space-y-2">
          <Show when="signed-in">
            {navItems.map((item) => (
              <SidebarLink key={item.label} {...item} />
            ))}
          </Show>

          <Show when="signed-out">
            <SidebarLink to="/" label="Home" icon={LayoutDashboard} />
            <SidebarLink to="/recommendations" label="Recommendations" icon={Sparkles} />
            <SidebarLink to="/compare" label="Compare" icon={GitCompareArrows} />
          </Show>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-4">
        <Show when="signed-out">
          <div className="space-y-3">
            <SignInButton mode="modal">
              <button className="w-full rounded-xl border border-slate-300 px-4 py-3 text-left font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                Login
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-left font-medium text-white transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                Register
              </button>
            </SignUpButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="space-y-3">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>

            <div className="flex items-center gap-3 rounded-2xl px-3 py-2 dark:text-slate-300">
              <UserButton />
              <span className="text-sm text-slate-500 dark:text-slate-400">Account</span>
            </div>

            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </Show>
      </div>
    </aside>
  );
}
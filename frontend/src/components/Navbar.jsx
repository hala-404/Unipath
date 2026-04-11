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
} from "lucide-react";

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
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-400">
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
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[290px] flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="text-3xl font-bold text-emerald-600">UniPath</div>
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

      <div className="border-t border-slate-200 px-4 py-4">
        <Show when="signed-out">
          <div className="space-y-3">
            <SignInButton mode="modal">
              <button className="w-full rounded-xl border border-slate-300 px-4 py-3 text-left font-medium text-slate-700 transition hover:bg-slate-50">
                Login
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-left font-medium text-white transition hover:bg-emerald-600">
                Register
              </button>
            </SignUpButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
              <UserButton />
              <span className="text-sm text-slate-500">Account</span>
            </div>

            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
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
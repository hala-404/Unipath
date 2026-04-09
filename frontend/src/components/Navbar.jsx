import { Link } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <Link to="/" className="text-2xl font-bold text-emerald-600">
        UniPath
      </Link>

      <div className="flex items-center gap-5 text-sm font-medium text-slate-700">
        <Link to="/">Home</Link>
        <Link to="/recommendations">Recommendations</Link>
        <Link to="/compare">Compare</Link>
        <Link to="/tracker">Tracker</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/chat">Chat</Link>

        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700">Login</button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="rounded-lg bg-emerald-500 px-3 py-1.5 text-black">
              Register
            </button>
          </SignUpButton>
        </Show>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}

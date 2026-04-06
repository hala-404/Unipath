import { Link } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-blue-600">
          UniPath
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link className="transition hover:text-blue-600" to="/">
            Home
          </Link>

          <Show when="signed-in">
            <>
              <Link className="transition hover:text-blue-600" to="/recommendations">
                Recommendations
              </Link>

              <Link className="transition hover:text-blue-600" to="/tracker">
                Tracker
              </Link>

              <Link className="transition hover:text-blue-600" to="/profile">
                Profile
              </Link>

              {/* ✅ CHAT LINK ADDED HERE */}
              <Link className="transition hover:text-blue-600" to="/chat">
                Chat
              </Link>
              <UserButton />
            </>
          </Show>

          <Show when="signed-out">
            <>
              <SignInButton>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                  Login
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-lg border border-slate-300 px-4 py-2 transition hover:border-blue-600 hover:text-blue-600">
                  Register
                </button>
              </SignUpButton>
            </>
          </Show>
        </div>
      </div>
    </nav>
  );
}
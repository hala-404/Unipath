import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

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

          {token ? (
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

              {user?.email ? (
                <span className="hidden text-slate-500 md:inline">
                  {user.email}
                </span>
              ) : null}

              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="transition hover:text-blue-600" to="/register">
                Register
              </Link>

              <Link
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                to="/login"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
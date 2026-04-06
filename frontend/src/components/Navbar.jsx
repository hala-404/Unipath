import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          {t("nav.brand")}
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium text-slate-700 sm:gap-6">
          <Link className="transition hover:text-blue-600" to="/">
            {t("nav.home")}
          </Link>

          {token ? (
            <>
              <Link className="hidden transition hover:text-blue-600 sm:inline" to="/recommendations">
                {t("nav.recommendations")}
              </Link>

              <Link className="transition hover:text-blue-600" to="/tracker">
                {t("nav.tracker")}
              </Link>

              <Link className="hidden transition hover:text-blue-600 sm:inline" to="/profile">
                {t("nav.profile")}
              </Link>

              <Link className="transition hover:text-blue-600" to="/chat">
                {t("nav.chat")}
              </Link>

              {user?.email ? (
                <span className="hidden text-slate-500 lg:inline">
                  {user.email}
                </span>
              ) : null}

              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link className="transition hover:text-blue-600" to="/register">
                {t("nav.register")}
              </Link>

              <Link
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                to="/login"
              >
                {t("nav.login")}
              </Link>
            </>
          )}

          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}

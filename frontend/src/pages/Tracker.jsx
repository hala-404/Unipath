import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchApplications,
  updateApplicationStatus,
  deleteApplication,
} from "../api/tracker";
import { fetchProfile } from "../api/profile";
import { useLanguage } from "../contexts/LanguageContext";

function getDeadlineStatus(deadline, t) {
  if (!deadline) return null;

  const now = new Date();
  const ddl = new Date(deadline);
  const diffTime = ddl - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: t("tracker.deadlinePassed"), color: "text-red-500" };
  }
  if (diffDays === 0) {
    return { text: t("tracker.dueToday"), color: "text-orange-400" };
  }
  if (diffDays <= 7) {
    return {
      text: t("tracker.daysLeft", { count: diffDays }),
      color: "text-yellow-400",
    };
  }
  return {
    text: t("tracker.daysLeft", { count: diffDays }),
    color: "text-green-400",
  };
}

function getDeadlineCardClasses(deadline) {
  if (!deadline) return "ring-slate-200";

  const now = new Date();
  const ddl = new Date(deadline);
  const diffTime = ddl - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "ring-red-300 bg-red-50";
  if (diffDays <= 7) return "ring-yellow-300 bg-yellow-50";
  return "ring-slate-200 bg-white";
}

const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Submitted",
  "Accepted",
  "Rejected",
];

function getStatusBadgeClasses(status) {
  switch (status) {
    case "Not Started":
      return "bg-slate-100 text-slate-700";
    case "In Progress":
      return "bg-amber-100 text-amber-700";
    case "Submitted":
      return "bg-blue-100 text-blue-700";
    case "Accepted":
      return "bg-emerald-100 text-emerald-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function Tracker() {
  const { t } = useLanguage();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  async function loadApplications() {
    try {
      const data = await fetchApplications();

      const sortedData = (data || []).sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      });

      setApplications(sortedData);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
    async function loadProfileReminders() {
      try {
        const data = await fetchProfile();
        setRemindersEnabled(data.reminders_enabled ?? true);
      } catch {
        /* ignore */
      }
    }
    loadProfileReminders();
  }, []);

  async function handleStatusChange(applicationId, newStatus) {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDelete(applicationId) {
    if (!confirm(t("tracker.deleteConfirm"))) return;

    try {
      await deleteApplication(applicationId);
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-600">{t("tracker.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("tracker.title")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("tracker.subtitle")}</p>
        </div>

        <span
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            remindersEnabled
              ? "bg-green-50 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {remindersEnabled ? t("tracker.remindersOn") : t("tracker.remindersOff")}
        </span>
      </div>

      {errorMessage ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      {applications.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-600">{t("tracker.empty")}</p>
          <Link
            to="/recommendations"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {t("tracker.browseBtn")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => {
            const deadlineInfo = getDeadlineStatus(app.deadline, t);
            const cardClasses = getDeadlineCardClasses(app.deadline);

            return (
              <div
                key={app.id}
                className={`rounded-2xl p-6 shadow-sm ring-1 ${cardClasses}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {app.university_name || app.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {app.city}, {app.country}
                    </p>
                  </div>

                  <span
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${getStatusBadgeClasses(
                      app.status
                    )}`}
                  >
                    {t(`tracker.statuses.${app.status}`) || app.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  {deadlineInfo && (
                    <p className={`font-medium ${deadlineInfo.color}`}>
                      {deadlineInfo.text}
                    </p>
                  )}

                  {app.deadline && (
                    <p className="text-slate-500">
                      {t("tracker.deadlineLabel")}:{" "}
                      {new Date(app.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {t(`tracker.statuses.${status}`) || status}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDelete(app.id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    {t("tracker.deleteBtn")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

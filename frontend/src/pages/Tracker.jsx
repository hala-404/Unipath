import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchApplications,
  updateApplicationStatus,
  updateApplicationChecklist,
  deleteApplication,
} from "../api/tracker";
import { fetchProfile } from "../api/profile";
import { useLanguage } from "../contexts/LanguageContext";

function getDaysLeft(deadline) {
  if (!deadline) return null;
  const now = new Date();
  const ddl = new Date(deadline);
  const diffTime = ddl - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDeadlineStatus(deadline, t) {
  if (!deadline) return null;

  const diffDays = getDaysLeft(deadline);

  if (diffDays < 0) {
    return { text: t("tracker.deadlinePassed"), color: "text-red-500" };
  }
  if (diffDays === 0) {
    return { text: t("tracker.dueToday"), color: "text-orange-400" };
  }
  if (diffDays <= 7) {
    return { text: `${diffDays}d left`, color: "text-yellow-400" };
  }
  return { text: `${diffDays}d left`, color: "text-green-400" };
}

function getDeadlineCardClasses(deadline) {
  if (!deadline) return "ring-slate-800 bg-black";

  const diffDays = getDaysLeft(deadline);

  if (diffDays < 0) return "ring-red-900 bg-black";
  if (diffDays <= 7) return "ring-yellow-900 bg-black";
  return "ring-slate-800 bg-black";
}

function getStatusBadgeClasses(status) {
  switch (status) {
    case "Not Started":
      return "bg-slate-800 text-slate-300";
    case "In Progress":
      return "bg-amber-900/40 text-amber-300";
    case "Submitted":
      return "bg-blue-900/40 text-blue-300";
    case "Accepted":
      return "bg-emerald-900/40 text-emerald-300";
    case "Rejected":
      return "bg-red-900/40 text-red-300";
    default:
      return "bg-slate-800 text-slate-300";
  }
}

function getPriorityClasses(priority) {
  switch (priority) {
    case "high":
      return "bg-red-900/40 text-red-300 ring-1 ring-red-800";
    case "medium":
      return "bg-amber-900/40 text-amber-300 ring-1 ring-amber-800";
    default:
      return "bg-slate-800 text-slate-300 ring-1 ring-slate-700";
  }
}

const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Submitted",
  "Accepted",
  "Rejected",
];

function calculateProgress(checklist = []) {
  if (!checklist.length) return 0;
  const doneCount = checklist.filter((item) => item.done).length;
  return Math.round((doneCount / checklist.length) * 100);
}

export default function Tracker() {
  const { t } = useLanguage();

  const [applications, setApplications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
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

      if (sortedData.length > 0 && !expandedId) {
        setExpandedId(sortedData[0].application_id);
      }
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
        // ignore
      }
    }

    loadProfileReminders();
  }, []);

  async function handleStatusChange(applicationId, newStatus) {
    try {
      await updateApplicationStatus(applicationId, newStatus);

      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleChecklistToggle(applicationId, itemId) {
    const app = applications.find((item) => item.application_id === applicationId);
    if (!app) return;

    const updatedChecklist = (app.checklist || []).map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );

    try {
      await updateApplicationChecklist(applicationId, updatedChecklist);

      setApplications((prev) =>
        prev.map((item) =>
          item.application_id === applicationId
            ? { ...item, checklist: updatedChecklist }
            : item
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
      setApplications((prev) =>
        prev.filter((app) => app.application_id !== applicationId)
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-zinc-950 p-8 shadow-sm ring-1 ring-slate-800">
        <p className="text-slate-300">{t("tracker.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("tracker.title")}</h1>
          <p className="mt-1 text-sm text-slate-400">{t("tracker.subtitle")}</p>
        </div>

        <span
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            remindersEnabled
              ? "bg-green-900/30 text-green-300"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {remindersEnabled ? t("tracker.remindersOn") : t("tracker.remindersOff")}
        </span>
      </div>

      {errorMessage ? (
        <div className="rounded-xl bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {applications.length === 0 ? (
        <div className="rounded-2xl bg-zinc-950 p-8 text-center shadow-sm ring-1 ring-slate-800">
          <p className="text-slate-400">{t("tracker.empty")}</p>
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
            const checklist = app.checklist || [];
            const progress = calculateProgress(checklist);
            const isExpanded = expandedId === app.application_id;

            return (
              <div
                key={app.application_id}
                className={`rounded-3xl p-5 shadow-sm ring-1 ${cardClasses}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((prev) =>
                      prev === app.application_id ? null : app.application_id
                    )
                  }
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold text-white">{app.name}</h3>
                    <p className="mt-2 text-lg text-slate-400">
                      {app.program} • Deadline:{" "}
                      {app.deadline
                        ? new Date(app.deadline).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-48">
                      <div className="mb-2 flex items-center justify-end gap-3">
                        <span className="text-2xl font-semibold text-slate-200">
                          {progress}% ready
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-2xl text-slate-400">
                      {isExpanded ? "⌃" : "⌄"}
                    </span>
                  </div>
                </button>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${getStatusBadgeClasses(
                      app.status
                    )}`}
                  >
                    {t(`tracker.statuses.${app.status}`) || app.status}
                  </span>

                  {deadlineInfo && (
                    <span className={`text-sm font-medium ${deadlineInfo.color}`}>
                      {deadlineInfo.text}
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-6 space-y-4">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 px-5 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleChecklistToggle(app.application_id, item.id)
                            }
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                              item.done
                                ? "border-emerald-500 bg-emerald-500 text-black"
                                : "border-slate-800 bg-black text-transparent"
                            }`}
                          >
                            ✓
                          </button>

                          <span
                            className={`text-2xl ${
                              item.done
                                ? "text-slate-500 line-through"
                                : "text-white"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {!item.done && (
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-semibold ${getPriorityClasses(
                                item.priority
                              )}`}
                            >
                              {item.priority}
                            </span>
                          )}

                          {item.done ? (
                            <span className="text-emerald-400 text-2xl">✓</span>
                          ) : app.deadline ? (
                            <span className="text-slate-400 text-xl">
                              {getDaysLeft(app.deadline)}d
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.application_id, e.target.value)
                        }
                        className="rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {t(`tracker.statuses.${status}`) || status}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDelete(app.application_id)}
                        className="rounded-lg bg-red-950/50 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-900/60"
                      >
                        {t("tracker.deleteBtn")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchApplications,
  updateApplicationStatus,
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

const PRIORITY_OPTIONS = ["high", "medium"];

function calculateProgress(checklist = []) {
  if (!checklist.length) return 0;
  const doneCount = checklist.filter((item) => item.completed).length;
  return Math.round((doneCount / checklist.length) * 100);
}

export default function Tracker() {
  const { t } = useLanguage();
  const token = localStorage.getItem("token");

  const [applications, setApplications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);

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

  const getSafeChecklist = (application) => {
    if (!application) return [];

    const normalize = (items) =>
      items.map((item) => ({
        ...item,
        priority: item.completed ? null : item.priority || "medium",
      }));

    if (Array.isArray(application.checklist)) {
      return normalize(application.checklist);
    }

    if (typeof application.checklist === "string") {
      try {
        const parsed = JSON.parse(application.checklist);
        return Array.isArray(parsed) ? normalize(parsed) : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  const saveChecklist = async (applicationId, updatedChecklist) => {
    const res = await fetch(
      `http://localhost:5050/applications/${applicationId}/checklist`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ checklist: updatedChecklist }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update checklist");
    }

    const data = await res.json();

    setApplications((prev) =>
      prev.map((app) =>
        app.application_id === applicationId
          ? { ...app, checklist: data.checklist }
          : app
      )
    );
  };

  const toggleChecklistItem = async (applicationId, itemIndex) => {
    try {
      const application = applications.find(
        (app) => app.application_id === applicationId
      );
      if (!application) return;

      const currentChecklist = getSafeChecklist(application);
      const clickedItem = currentChecklist[itemIndex];
      if (!clickedItem) return;

      const nextCompleted = !clickedItem.completed;

      let updatedChecklist = currentChecklist.map((item, index) => {
        if (index !== itemIndex) return item;

        return {
          ...item,
          completed: nextCompleted,
          priority: nextCompleted ? null : item.priority || "medium",
        };
      });

      if (nextCompleted) {
        const [movedItem] = updatedChecklist.splice(itemIndex, 1);
        updatedChecklist.push(movedItem);
      }

      await saveChecklist(applicationId, updatedChecklist);
    } catch (error) {
      console.error("Checklist update failed:", error);
      setErrorMessage("Failed to update checklist");
    }
  };

  const changeChecklistPriority = async (applicationId, itemIndex, priority) => {
    try {
      const application = applications.find(
        (app) => app.application_id === applicationId
      );
      if (!application) return;

      const currentChecklist = getSafeChecklist(application);

      const updatedChecklist = currentChecklist.map((item, index) =>
        index === itemIndex ? { ...item, priority } : item
      );

      await saveChecklist(applicationId, updatedChecklist);
    } catch (error) {
      console.error("Priority update failed:", error);
      setErrorMessage("Failed to update priority");
    }
  };

  const moveChecklistItem = async (applicationId, fromIndex, toIndex) => {
    try {
      const application = applications.find(
        (app) => app.application_id === applicationId
      );
      if (!application) return;

      const currentChecklist = [...getSafeChecklist(application)];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentChecklist.length ||
        toIndex >= currentChecklist.length
      ) {
        return;
      }

      const [movedItem] = currentChecklist.splice(fromIndex, 1);
      currentChecklist.splice(toIndex, 0, movedItem);

      await saveChecklist(applicationId, currentChecklist);
    } catch (error) {
      console.error("Reorder failed:", error);
      setErrorMessage("Failed to reorder checklist");
    }
  };

  async function handleDelete(applicationId) {
    if (!confirm(t("tracker.deleteConfirm"))) return;

    try {
      await deleteApplication(applicationId);
      setApplications((prev) =>
        prev.filter((app) => app.application_id !== applicationId)
      );

      if (expandedId === applicationId) {
        setExpandedId(null);
      }
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
          {applications.map((application) => {
            const deadlineInfo = getDeadlineStatus(application.deadline, t);
            const cardClasses = getDeadlineCardClasses(application.deadline);
            const checklist = getSafeChecklist(application);
            const progress = calculateProgress(checklist);
            const isExpanded = expandedId === application.application_id;

            return (
              <div
                key={application.application_id}
                className={`rounded-3xl p-5 shadow-sm ring-1 ${cardClasses}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((prev) =>
                      prev === application.application_id
                        ? null
                        : application.application_id
                    )
                  }
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold text-white">
                      {application.name}
                    </h3>
                    <p className="mt-2 text-lg text-slate-400">
                      {application.deadline
                        ? new Date(application.deadline).toLocaleDateString()
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
                      application.status
                    )}`}
                  >
                    {t(`tracker.statuses.${application.status}`) || application.status}
                  </span>

                  {deadlineInfo && (
                    <span className={`text-sm font-medium ${deadlineInfo.color}`}>
                      {deadlineInfo.text}
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-6">
                    {checklist.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {checklist.map((item, index) => (
                          <div
                            key={`${application.application_id}-${index}`}
                            draggable
                            onDragStart={() =>
                              setDraggedItem({
                                applicationId: application.application_id,
                                index,
                              })
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={async () => {
                              if (
                                !draggedItem ||
                                draggedItem.applicationId !== application.application_id ||
                                draggedItem.index === index
                              ) {
                                return;
                              }

                              await moveChecklistItem(
                                application.application_id,
                                draggedItem.index,
                                index
                              );
                              setDraggedItem(null);
                            }}
                            className="rounded-xl bg-slate-800/60 px-4 py-3"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-center gap-3">
                                <span className="cursor-grab text-slate-400">⋮⋮</span>

                                <input
                                  type="checkbox"
                                  checked={!!item.completed}
                                  onChange={() =>
                                    toggleChecklistItem(
                                      application.application_id,
                                      index
                                    )
                                  }
                                />

                                <span
                                  className={
                                    item.completed
                                      ? "line-through text-slate-400"
                                      : "text-white"
                                  }
                                >
                                  {item.label}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {!item.completed && (
                                  <>
                                    <span
                                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                                        item.priority || "medium"
                                      )}`}
                                    >
                                      {item.priority === "high" ? "High" : "Medium"}
                                    </span>

                                    <select
                                      value={item.priority || "medium"}
                                      onChange={(e) =>
                                        changeChecklistPriority(
                                          application.application_id,
                                          index,
                                          e.target.value
                                        )
                                      }
                                      className="rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
                                    >
                                      {PRIORITY_OPTIONS.map((priority) => (
                                        <option key={priority} value={priority}>
                                          {priority === "high" ? "High" : "Medium"}
                                        </option>
                                      ))}
                                    </select>
                                  </>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    moveChecklistItem(
                                      application.application_id,
                                      index,
                                      index - 1
                                    )
                                  }
                                  disabled={index === 0}
                                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  ↑
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    moveChecklistItem(
                                      application.application_id,
                                      index,
                                      index + 1
                                    )
                                  }
                                  disabled={index === checklist.length - 1}
                                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-slate-400">No checklist available.</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-4">
                      <select
                        value={application.status}
                        onChange={(e) =>
                          handleStatusChange(
                            application.application_id,
                            e.target.value
                          )
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
                        onClick={() => handleDelete(application.application_id)}
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
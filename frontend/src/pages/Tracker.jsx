import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

import {
  fetchApplications,
  updateApplicationStatus,
  updateApplicationChecklist,
  deleteApplication,
} from "../api/tracker";
import { fetchProfile } from "../api/profile";

function getDeadlineStatus(deadline) {
  if (!deadline) return null;

  const now = new Date();
  const ddl = new Date(deadline);
  const diffTime = ddl - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Deadline passed", color: "text-red-500" };
  }

  if (diffDays === 0) {
    return { text: "Due today", color: "text-orange-400" };
  }

  if (diffDays <= 7) {
    return {
      text: `${diffDays} ${diffDays === 1 ? "day" : "days"} left`,
      color: "text-yellow-400",
    };
  }

  return {
    text: `${diffDays} ${diffDays === 1 ? "day" : "days"} left`,
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

const PRIORITY_OPTIONS = ["high", "medium"];

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

function getPriorityClasses(priority) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function calculateProgress(checklist = []) {
  if (!checklist.length) return 0;
  const doneCount = checklist.filter((item) => item.completed).length;
  return Math.round((doneCount / checklist.length) * 100);
}

export default function Tracker() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  async function loadApplications() {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const data = await fetchApplications(token);

      const sortedData = (data || []).sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      });

      setApplications(sortedData);

      if (sortedData.length > 0) {
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
      if (!isLoaded || !isSignedIn) return;

      try {
        const token = await getToken();
        const data = await fetchProfile(token);
        setRemindersEnabled(data.reminders_enabled ?? true);
      } catch {
        // keep default
      }
    }

    loadProfileReminders();
  }, [getToken, isLoaded, isSignedIn]);

  async function handleStatusChange(applicationId, newStatus) {
    setMessage("");
    setErrorMessage("");

    try {
      const token = await getToken();
      await updateApplicationStatus(applicationId, newStatus, token);

      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      );

      setMessage("Application status updated successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDelete(applicationId) {
    setMessage("");
    setErrorMessage("");

    try {
      const token = await getToken();
      await deleteApplication(applicationId, token);

      setApplications((prev) =>
        prev.filter((app) => app.application_id !== applicationId)
      );

      setMessage("Application deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const getSafeChecklist = (app) => {
    if (!app?.checklist) return [];

    const normalize = (items) =>
      items.map((item) => ({
        ...item,
        priority: item.completed ? null : item.priority || "medium",
      }));

    if (Array.isArray(app.checklist)) {
      return normalize(app.checklist);
    }

    if (typeof app.checklist === "string") {
      try {
        const parsed = JSON.parse(app.checklist);
        return Array.isArray(parsed) ? normalize(parsed) : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  async function saveChecklist(applicationId, updatedChecklist) {
    const token = await getToken();
    const updated = await updateApplicationChecklist(
      applicationId,
      updatedChecklist,
      token
    );

    setApplications((prev) =>
      prev.map((app) =>
        app.application_id === applicationId
          ? { ...app, checklist: updated.checklist }
          : app
      )
    );
  }

  async function toggleChecklistItem(applicationId, itemIndex) {
    setMessage("");
    setErrorMessage("");

    try {
      const app = applications.find((a) => a.application_id === applicationId);
      if (!app) return;

      const currentChecklist = getSafeChecklist(app);
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
      setErrorMessage(error.message);
    }
  }

  async function changeChecklistPriority(applicationId, itemIndex, priority) {
    setMessage("");
    setErrorMessage("");

    try {
      const app = applications.find((a) => a.application_id === applicationId);
      if (!app) return;

      const currentChecklist = getSafeChecklist(app);
      const updatedChecklist = currentChecklist.map((item, index) =>
        index === itemIndex ? { ...item, priority } : item
      );

      await saveChecklist(applicationId, updatedChecklist);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function moveChecklistItem(applicationId, fromIndex, toIndex) {
    setMessage("");
    setErrorMessage("");

    try {
      const app = applications.find((a) => a.application_id === applicationId);
      if (!app) return;

      const currentChecklist = [...getSafeChecklist(app)];

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
      setErrorMessage(error.message);
    }
  }

  const activeApplications = applications.filter(
    (app) => app.status !== "Accepted" && app.status !== "Rejected"
  );

  const urgentApplications = activeApplications.filter((app) => {
    if (!app.deadline) return false;

    const now = new Date();
    const ddl = new Date(app.deadline);
    const diffTime = ddl - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 7;
  });

  const passedApplications = activeApplications.filter((app) => {
    if (!app.deadline) return false;

    const now = new Date();
    const ddl = new Date(app.deadline);
    const diffTime = ddl - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays < 0;
  });

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-600">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Application Tracker</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track saved universities and update your application progress.
        </p>
      </div>

      {remindersEnabled ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Reminder Summary</h2>

          <div className="mt-3 space-y-2 text-sm">
            {urgentApplications.length > 0 ? (
              <p className="text-yellow-600">
                {urgentApplications.length} active application
                {urgentApplications.length === 1 ? "" : "s"} ha
                {urgentApplications.length === 1 ? "s" : "ve"} a deadline within 7 days.
              </p>
            ) : null}

            {passedApplications.length > 0 ? (
              <p className="text-red-600">
                {passedApplications.length} active application
                {passedApplications.length === 1 ? "" : "s"} ha
                {passedApplications.length === 1 ? "s" : "ve"} a passed deadline.
              </p>
            ) : null}

            {urgentApplications.length === 0 && passedApplications.length === 0 ? (
              <p className="text-green-600">No urgent reminders right now.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      {applications.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">No applications saved yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => {
            const deadlineStatus = getDeadlineStatus(app.deadline);
            const checklist = getSafeChecklist(app);
            const progress = calculateProgress(checklist);
            const isExpanded = expandedId === app.application_id;

            return (
              <div
                key={app.application_id}
                className={`rounded-2xl p-6 shadow-sm transition hover:shadow-md ring-1 ${getDeadlineCardClasses(
                  app.deadline
                )}`}
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
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{app.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {app.city}, {app.country}
                    </p>

                    <div className="mt-4 grid gap-2 text-sm text-slate-700">
                      <p>
                        <span className="font-medium">Program:</span> {app.program}
                      </p>
                      <p>
                        <span className="font-medium">Deadline:</span>{" "}
                        {new Date(app.deadline).toLocaleDateString()}
                      </p>
                      {remindersEnabled && deadlineStatus && (
                        <p className={`mt-1 text-sm font-semibold ${deadlineStatus.color}`}>
                          {deadlineStatus.text}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-700">
                          Current Status:
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-40">
                      <div className="mb-2 text-right text-sm font-semibold text-slate-700">
                        {progress}% ready
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-xl text-slate-500">
                      {isExpanded ? "⌃" : "⌄"}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-6 space-y-4">
                    {checklist.length > 0 ? (
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                          Document Checklist
                        </h3>

                        <div className="space-y-2">
                          {checklist.map((item, index) => (
                            <div
                              key={`${app.application_id}-${index}`}
                              className="flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={!!item.completed}
                                  onChange={() =>
                                    toggleChecklistItem(app.application_id, index)
                                  }
                                />

                                <span
                                  className={
                                    item.completed
                                      ? "text-slate-400 line-through"
                                      : "text-slate-800"
                                  }
                                >
                                  {item.label}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {!item.completed && (
                                  <>
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClasses(
                                        item.priority || "medium"
                                      )}`}
                                    >
                                      {item.priority === "high" ? "High" : "Medium"}
                                    </span>

                                    <select
                                      value={item.priority || "medium"}
                                      onChange={(e) =>
                                        changeChecklistPriority(
                                          app.application_id,
                                          index,
                                          e.target.value
                                        )
                                      }
                                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
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
                                      app.application_id,
                                      index,
                                      index - 1
                                    )
                                  }
                                  disabled={index === 0}
                                  className="rounded-lg bg-slate-200 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  ↑
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    moveChecklistItem(
                                      app.application_id,
                                      index,
                                      index + 1
                                    )
                                  }
                                  disabled={index === checklist.length - 1}
                                  className="rounded-lg bg-slate-200 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No checklist available.</p>
                    )}

                    <div className="flex flex-col gap-3 md:w-56">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.application_id, e.target.value)
                        }
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDelete(app.application_id)}
                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        Delete Application
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
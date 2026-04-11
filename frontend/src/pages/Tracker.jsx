import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { useLocation } from "react-router-dom";
import { CalendarCheck2, FileText } from "lucide-react";

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
  if (!deadline) return "ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900";

  const now = new Date();
  const ddl = new Date(deadline);
  const diffTime = ddl - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "ring-red-300 bg-red-50 dark:ring-red-900/50 dark:bg-red-950/20";
  if (diffDays <= 7) return "ring-yellow-300 bg-yellow-50 dark:ring-yellow-900/50 dark:bg-yellow-950/20";
  return "ring-slate-200 bg-white dark:ring-slate-800 dark:bg-slate-900";
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
      return "border border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
    case "In Progress":
      return "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300";
    case "Submitted":
      return "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300";
    case "Accepted":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300";
    case "Rejected":
      return "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300";
    default:
      return "border border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getPriorityClasses(priority) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-300";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function calculateProgress(checklist = []) {
  if (!checklist.length) return 0;
  const doneCount = checklist.filter((item) => item.completed).length;
  return Math.round((doneCount / checklist.length) * 100);
}

function getOverallChecklistStats(applications) {
  const allItems = applications.flatMap((app) => {
    if (!app?.checklist) return [];

    if (Array.isArray(app.checklist)) return app.checklist;

    if (typeof app.checklist === "string") {
      try {
        const parsed = JSON.parse(app.checklist);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  });

  const completed = allItems.filter((item) => item.completed).length;
  const total = allItems.length;
  const remaining = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, remaining, percent };
}

export default function Tracker() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const appRefs = useRef({});
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const targetAppId = queryParams.get("app");
  const focus = queryParams.get("focus");

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

  useEffect(() => {
    if (!targetAppId) return;

    const targetId = String(targetAppId);
    const appExists = applications.some(
      (app) => String(app.application_id) === targetId
    );

    if (!appExists) return;

    setExpandedId(Number.isNaN(Number(targetId)) ? targetId : Number(targetId));

    requestAnimationFrame(() => {
      const el = appRefs.current[targetId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-emerald-400");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-emerald-400");
        }, 2000);
      }
    });
  }, [targetAppId, applications]);

  useEffect(() => {
    if (!focus || !targetAppId) return;

    requestAnimationFrame(() => {
      const el = document.getElementById(`${focus}-${targetAppId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-emerald-400");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-emerald-400");
        }, 2000);
      }
    });
  }, [focus, targetAppId, applications, expandedId]);

  const getChecklistItemAnchorId = (appId, label) => {
    const text = String(label || "").toLowerCase();
    if (text.includes("personal statement")) {
      return `statement-${appId}`;
    }
    if (text.includes("recommendation")) {
      return `recommendation-${appId}`;
    }
    return undefined;
  };

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

  function handleDragStart(e, applicationId, itemIndex, item) {
    if (item.completed) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ applicationId, itemIndex })
    );
  }

  async function handleDrop(e, applicationId, targetIndex, targetItem) {
    e.preventDefault();

    try {
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;

      const { applicationId: sourceAppId, itemIndex: sourceIndex } = JSON.parse(raw);

      if (Number(sourceAppId) !== Number(applicationId)) return;
      if (sourceIndex === targetIndex) return;
      if (targetItem?.completed) return;

      const app = applications.find((a) => a.application_id === applicationId);
      if (!app) return;

      const checklist = getSafeChecklist(app);

      const unfinished = checklist.filter((item) => !item.completed);
      const completed = checklist.filter((item) => item.completed);

      const sourceItem = checklist[sourceIndex];
      if (!sourceItem || sourceItem.completed) return;

      const unfinishedIndexes = checklist
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !item.completed);

      const fromUnfinishedIndex = unfinishedIndexes.findIndex(
        ({ index }) => index === sourceIndex
      );
      const toUnfinishedIndex = unfinishedIndexes.findIndex(
        ({ index }) => index === targetIndex
      );

      if (fromUnfinishedIndex === -1 || toUnfinishedIndex === -1) return;

      const reorderedUnfinished = [...unfinished];
      const [moved] = reorderedUnfinished.splice(fromUnfinishedIndex, 1);
      reorderedUnfinished.splice(toUnfinishedIndex, 0, moved);

      const updatedChecklist = [...reorderedUnfinished, ...completed];

      await saveChecklist(applicationId, updatedChecklist);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
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

  const overallStats = getOverallChecklistStats(applications);

  const needsAttentionItems = activeApplications
    .flatMap((app) => {
      if (!app.deadline) return [];

      const now = new Date();
      const ddl = new Date(app.deadline);
      const diffTime = ddl - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0 || diffDays > 30) return [];

      const checklist = getSafeChecklist(app);

      return checklist
        .filter((item) => !item.completed && item.priority === "high")
        .map((item) => ({
          label: item.label,
          university: app.name,
          deadline: app.deadline,
        }));
    })
    .slice(0, 3);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-slate-600 dark:text-slate-400">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-50 px-8 pt-8 pb-4 dark:bg-slate-950">
      <div className="px-2 pt-2 pb-1">
        <div className="flex items-start gap-3">
          <CalendarCheck2 className="mt-1 h-10 w-10 text-emerald-600" />

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Application Tracker
            </h1>

            <p className="mt-3 max-w-4xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Stay on top of your application deadlines and required documents.
              Track what&apos;s completed and what needs attention.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Overall Progress</h2>

            <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-amber-600 transition-all"
                style={{ width: `${overallStats.percent}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {overallStats.completed} of {overallStats.total} items completed
            </p>
          </div>

          <div className="flex gap-3">
            <div className="min-w-[90px] rounded-2xl bg-emerald-50 px-4 py-3 text-center dark:bg-emerald-950/30">
              <div className="text-lg font-semibold text-emerald-700">
                {overallStats.completed}
              </div>
              <div className="mt-1 text-base text-slate-600 dark:text-slate-400">Completed</div>
            </div>

            <div className="min-w-[90px] rounded-2xl bg-amber-50 px-4 py-3 text-center dark:bg-amber-950/30">
              <div className="text-lg font-semibold text-amber-700">
                {overallStats.remaining}
              </div>
              <div className="mt-1 text-base text-slate-600 dark:text-slate-400">Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {remindersEnabled && needsAttentionItems.length > 0 ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-200 dark:bg-slate-900 dark:ring-amber-900/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-amber-600">!</span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Needs Attention</h2>
          </div>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            These items require immediate attention based on upcoming deadlines.
          </p>

          <div className="mt-6 space-y-3">
            {needsAttentionItems.map((item, index) => {
              const deadlineStatus = getDeadlineStatus(item.deadline);

              return (
                <div
                  key={`${item.university}-${item.label}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/50 dark:bg-amber-950/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-amber-600">!</span>
                    <p className="text-lg text-slate-800 dark:text-slate-100">
                      <span className="font-semibold">{item.label}</span> - {item.university}
                    </p>
                  </div>

                  {deadlineStatus ? (
                    <span className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                      {deadlineStatus.text}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-300">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {applications.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">No applications saved yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => {
            const checklist = getSafeChecklist(app);
            const progress = calculateProgress(checklist);
            const isExpanded = expandedId === app.application_id;

            return (
              <div
                key={app.application_id}
                ref={(el) => {
                  if (el) {
                    appRefs.current[String(app.application_id)] = el;
                  }
                }}
                className={`rounded-2xl p-4 shadow-sm ring-1 dark:bg-slate-900 ${getDeadlineCardClasses(
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
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                      <FileText className="h-6 w-6 text-emerald-600" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{app.name}</h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {app.program} • Deadline:{" "}
                        {app.deadline
                          ? new Date(app.deadline).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-amber-600 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <span className="min-w-[40px] text-right text-sm font-medium text-slate-800 dark:text-slate-200">
                        {progress}%
                      </span>
                    </div>

                    <span className="text-xl leading-none text-slate-500 dark:text-slate-400">
                      {isExpanded ? "⌃" : "⌄"}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-6 space-y-4">
                    {checklist.length > 0 ? (
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Document Checklist
                        </h3>

                        <div className="space-y-2">
                          {checklist.map((item, index) => {
                            return (
                              <div
                                key={`${app.application_id}-${index}`}
                                draggable={!item.completed}
                                onDragStart={(e) =>
                                  handleDragStart(e, app.application_id, index, item)
                                }
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, app.application_id, index, item)}
                                className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition ${
                                  item.completed
                                    ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800"
                                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                                }`}
                              >
                                <div className="flex min-w-0 items-center gap-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleChecklistItem(app.application_id, index)
                                    }
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${
                                      item.completed
                                        ? "border-emerald-600 bg-emerald-600 text-white"
                                        : "border-slate-300 bg-white text-transparent hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900"
                                    }`}
                                  >
                                    ✓
                                  </button>

                                  <span
                                    id={getChecklistItemAnchorId(
                                      app.application_id,
                                      item.label
                                    )}
                                    className={`text-lg ${
                                      item.completed
                                        ? "text-slate-400 line-through dark:text-slate-500"
                                        : "font-medium text-slate-900 dark:text-slate-100"
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                  {!item.completed && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          changeChecklistPriority(
                                            app.application_id,
                                            index,
                                            item.priority === "high"
                                              ? "medium"
                                              : "high"
                                          )
                                        }
                                        className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                                          (item.priority || "medium") === "high"
                                            ? "border-red-200 bg-red-50 text-red-600"
                                            : "border-amber-200 bg-amber-50 text-amber-700"
                                        }`}
                                      >
                                        {item.priority === "high" ? "high" : "medium"}
                                      </button>
                                    </>
                                  )}

                                  {item.completed && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-600 text-emerald-600">
                                      ✓
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { useLocation } from "react-router-dom";
import TrackerHeader from "../components/tracker/TrackerHeader";
import ApplicationCard from "../components/tracker/ApplicationCard";
import ChecklistPanel from "../components/tracker/ChecklistPanel";

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
      <TrackerHeader />

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
              <ApplicationCard
                key={app.application_id}
                app={app}
                isExpanded={isExpanded}
                progress={progress}
                onToggleExpanded={() =>
                  setExpandedId((prev) =>
                    prev === app.application_id ? null : app.application_id
                  )
                }
                className={getDeadlineCardClasses(app.deadline)}
              >
                <ChecklistPanel
                  applicationId={app.application_id}
                  checklist={checklist}
                  getChecklistItemAnchorId={getChecklistItemAnchorId}
                  onToggleChecklistItem={toggleChecklistItem}
                  onChangeChecklistPriority={changeChecklistPriority}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              </ApplicationCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
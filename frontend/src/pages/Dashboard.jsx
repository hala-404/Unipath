import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  GraduationCap,
  ListChecks,
  CalendarDays,
  UserCircle2,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  Send,
  AlertTriangle,
} from "lucide-react";

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function getActivityText(activity) {
  if (activity.action === "added" && activity.entity === "university") {
    return `Added ${activity.entity_name} to tracker`;
  }
  if (activity.action === "updated" && activity.entity === "profile") {
    return "Updated profile information";
  }
  if (activity.action === "updated" && activity.entity === "application") {
    return `Updated ${activity.entity_name}`;
  }
  if (activity.action === "updated" && activity.entity === "checklist") {
    return `Updated checklist for ${activity.entity_name}`;
  }
  if (activity.action === "deleted" && activity.entity === "application") {
    return `Removed ${activity.entity_name} from tracker`;
  }
  return `${activity.action} ${activity.entity_name}`;
}

function getActivityIcon(activity) {
  if (activity.action === "added") return <Plus className="h-4 w-4" />;
  if (activity.action === "updated") return <Pencil className="h-4 w-4" />;
  if (activity.action === "deleted") return <Trash2 className="h-4 w-4" />;
  return <Send className="h-4 w-4" />;
}

function getStatusStyles(status) {
  if (status === "Submitted") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  if (status === "In Progress") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function getProgressBarColor(progress) {
  if (progress >= 100) return "bg-emerald-600";
  if (progress >= 50) return "bg-blue-600";
  return "bg-red-500";
}

function getActionIcon(index) {
  if (index === 0) return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (index === 1) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <AlertTriangle className="h-4 w-4 text-slate-500" />;
}

export default function Dashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();

        const response = await fetch("http://localhost:5050/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load dashboard");
        }

        setDashboard(data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [getToken, isLoaded, isSignedIn]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 py-8 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 py-8 text-red-600 dark:bg-slate-950 dark:text-red-400">
        {errorMessage}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 py-8 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
        No dashboard data available.
      </div>
    );
  }

  const { user, stats, activeApplications, recentActivity, recommendedActions, quickActions } =
    dashboard;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-white to-emerald-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Welcome back, {user.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
            Here&apos;s an overview of your university application journey.
            Keep going, you&apos;re making great progress.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.savedUniversities}</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Saved Universities</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <ListChecks className="h-5 w-5 text-emerald-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.trackedApplications}</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Tracked Applications</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.upcomingDeadlines}</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Upcoming Deadlines</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <UserCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.profileCompletion}%</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Profile Completion</p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.8fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Active Applications</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your tracked university applications
                </p>
              </div>

              <Link
                to="/tracker"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {activeApplications.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  No tracked applications yet.
                </div>
              ) : (
                activeApplications.map((app) => (
                  <div
                    key={app.application_id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={app.image_url}
                        alt={app.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{app.name}</h3>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyles(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {app.program} • {app.city}
                        </p>
                      </div>
                    </div>

                    <div className="w-full max-w-[180px]">
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${getProgressBarColor(app.progress)}`}
                          style={{ width: `${app.progress}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{app.progress}% ready</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your latest actions</p>

            <div className="mt-6 space-y-5">
              {recentActivity.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {getActivityIcon(activity)}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {getActivityText(activity)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.8fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recommended Next Actions</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  AI-suggested tasks to keep your applications on track
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {recommendedActions.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  No suggested actions right now.
                </div>
              ) : (
                recommendedActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-900">
                        {getActionIcon(index)}
                      </div>

                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{action.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{action.subtitle}</p>
                      </div>
                    </div>

                    <Link
                      to={action.href}
                      className="text-sm font-semibold text-slate-900 hover:underline dark:text-slate-100"
                    >
                      {action.cta}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Frequently used features</p>

            <div className="mt-6 space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {action.label === "Get New Recommendations" && (
                    <Sparkles className="h-5 w-5" />
                  )}
                  {action.label === "Ask AI Advisor" && (
                    <MessageCircle className="h-5 w-5" />
                  )}
                  {action.label === "Compare Universities" && (
                    <GraduationCap className="h-5 w-5" />
                  )}
                  {action.label === "Update Profile" && (
                    <UserCircle2 className="h-5 w-5" />
                  )}
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
import { FileText } from "lucide-react";

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

export default function ApplicationCard({
  app,
  isExpanded,
  progress,
  onToggleExpanded,
  className = "",
  children,
}) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm ring-1 dark:bg-slate-900 ${className}`}>
      <button
        type="button"
        onClick={onToggleExpanded}
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
              {app.program} • Deadline: {" "}
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

      {isExpanded ? <div className="mt-6 space-y-4">{children}</div> : null}
    </div>
  );
}

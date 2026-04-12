const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Submitted",
  "Accepted",
  "Rejected",
];

export default function ChecklistPanel({
  applicationId,
  checklist,
  status,
  getChecklistItemAnchorId,
  onToggleChecklistItem,
  onChangeChecklistPriority,
  onDragStart,
  onDragOver,
  onDrop,
  onStatusChange,
  onDelete,
}) {
  return (
    <>
      {checklist.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Document Checklist
          </h3>

          <div className="space-y-2">
            {checklist.map((item, index) => {
              return (
                <div
                  key={`${applicationId}-${index}`}
                  draggable={!item.completed}
                  onDragStart={(e) => onDragStart(e, applicationId, index, item)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, applicationId, index, item)}
                  className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition ${
                    item.completed
                      ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <button
                      type="button"
                      onClick={() => onToggleChecklistItem(applicationId, index)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${
                        item.completed
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white text-transparent hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900"
                      }`}
                    >
                      ✓
                    </button>

                    <span
                      id={getChecklistItemAnchorId(applicationId, item.label)}
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
                    {!item.completed ? (
                      <button
                        type="button"
                        onClick={() =>
                          onChangeChecklistPriority(
                            applicationId,
                            index,
                            item.priority === "high" ? "medium" : "high"
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
                    ) : (
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
          value={status}
          onChange={(e) => onStatusChange(applicationId, e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onDelete(applicationId)}
          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Delete Application
        </button>
      </div>
    </>
  );
}

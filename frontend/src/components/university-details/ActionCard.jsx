import { CirclePlus, ExternalLink, MessageCircle } from "lucide-react";

export default function ActionCard({
  websiteUrl,
  onAddToTracker,
  onAskAI,
  trackerLoading,
  alreadyAdded,
  trackerMessage,
  trackerError,
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-8 text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Actions
      </h2>

      <div className="space-y-4">
        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-emerald-600 px-5 py-4 text-sm md:text-base font-medium text-white transition hover:bg-emerald-500"
          >
            <ExternalLink className="h-5 w-5" />
            Apply Now
          </a>
        ) : (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-emerald-600 px-5 py-4 text-sm md:text-base font-medium text-white opacity-70"
          >
            <ExternalLink className="h-5 w-5" />
            Apply Now
          </button>
        )}

        <button
          type="button"
          onClick={onAddToTracker}
          disabled={trackerLoading || alreadyAdded}
          className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-slate-200 bg-white px-5 py-4 text-sm md:text-base font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <CirclePlus className="h-5 w-5" />
          {alreadyAdded ? "Added" : trackerLoading ? "Adding..." : "Add to Tracker"}
        </button>

        <button
          type="button"
          onClick={onAskAI}
          className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-slate-200 bg-white px-5 py-4 text-sm md:text-base font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <MessageCircle className="h-5 w-5" />
          Ask AI About This University
        </button>

        {trackerMessage && (
          <p className={`mt-2 text-sm ${trackerError ? "text-red-600" : "text-green-600"}`}>
            {trackerMessage}
          </p>
        )}
      </div>
    </section>
  );
}

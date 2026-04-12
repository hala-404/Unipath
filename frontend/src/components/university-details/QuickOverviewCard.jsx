import { Clock3 } from "lucide-react";

export default function QuickOverviewCard({ fitScore, language, minGpa }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-3">
        <Clock3 className="h-7 w-7 text-emerald-600" />
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Quick Overview
        </h2>
      </div>

      <div className="space-y-4 text-base md:text-lg text-slate-700 dark:text-slate-300">
        <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
          <span>Fit Score</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">{fitScore}%</span>
        </div>

        <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
          <span>Language</span>
          <span className="font-semibold">{language || "N/A"}</span>
        </div>

        <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
          <span>Minimum GPA</span>
          <span className="font-semibold">{minGpa ?? "N/A"}</span>
        </div>
      </div>
    </section>
  );
}

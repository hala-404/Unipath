import { CalendarCheck2 } from "lucide-react";

export default function TrackerHeader() {
  return (
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
  );
}

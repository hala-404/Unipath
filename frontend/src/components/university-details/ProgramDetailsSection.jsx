import { DollarSign, Globe, GraduationCap, Trophy, Users } from "lucide-react";

function formatTuition(university) {
  const value = university.tuition_fee;
  if (value == null || value === "") return "N/A";
  if (typeof value === "string" && value.trim()) return value;
  if (Number(value) === 0) return "Free";
  return `$${Number(value).toLocaleString()}`;
}

export default function ProgramDetailsSection({ university }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center gap-3">
        <GraduationCap className="h-7 w-7 text-emerald-600" />
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Program Details
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
          <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            <span className="text-sm md:text-base">Program</span>
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
            {university.program || "N/A"}
          </p>
        </div>

        <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
          <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Globe className="h-5 w-5 text-emerald-600" />
            <span className="text-sm md:text-base">Language</span>
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
            {university.language || "N/A"}
          </p>
        </div>

        <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
          <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span className="text-sm md:text-base">Tuition (per year)</span>
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
            {formatTuition(university)}
          </p>
        </div>

        <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
          <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Trophy className="h-5 w-5 text-emerald-600" />
            <span className="text-sm md:text-base">Minimum GPA</span>
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
            {university.min_gpa ?? "N/A"}
          </p>
        </div>

        <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
          <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Users className="h-5 w-5 text-emerald-600" />
            <span className="text-sm md:text-base">Acceptance Rate</span>
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
            {university.acceptance_rate != null ? `${university.acceptance_rate}%` : "N/A"}
          </p>
        </div>

        <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
          <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Trophy className="h-5 w-5 text-emerald-600" />
            <span className="text-sm md:text-base">World Ranking</span>
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
            {university.world_ranking != null ? `#${university.world_ranking}` : "N/A"}
          </p>
        </div>
      </div>
    </section>
  );
}

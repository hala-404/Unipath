import { useNavigate } from "react-router-dom";

function riskBadgeClasses(risk) {
  switch (risk) {
    case "Safe":
      return "bg-green-500/15 text-green-400 border border-green-500/20";
    case "Match":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
    case "Reach":
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    default:
      return "bg-slate-700/40 text-slate-300 border border-slate-700";
  }
}

export default function UniversityRecommendationCard({ uni }) {
  const navigate = useNavigate();

  const fitScore = uni.fit_score ?? uni.score ?? 92;
  const ranking = uni.ranking ?? "#8 World";
  const tuition = uni.tuition ?? "N/A";
  const reasons = uni.reasons ?? [];

  return (
    <div className="rounded-[32px] border border-emerald-500/25 bg-black p-6 text-white shadow-[0_0_0_1px_rgba(16,185,129,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300">
            {ranking}
          </span>

          <div>
            <h3 className="text-3xl font-bold text-emerald-400">{uni.name}</h3>
            <p className="mt-2 text-2xl text-slate-400">
              {uni.city}, {uni.country}
            </p>
          </div>
        </div>

        <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-5 py-2 text-2xl font-semibold text-emerald-400">
          {fitScore}% fit
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 text-xl text-slate-300">
        <div>{uni.program}</div>
        <div>{uni.language}</div>
        <div>{tuition}/yr</div>
        <div>
          {uni.deadline
            ? new Date(uni.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "No deadline"}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <span className={`rounded-full px-5 py-2 text-xl font-medium ${riskBadgeClasses(uni.risk)}`}>
          {uni.risk || "Match"}
        </span>
        <span className="text-xl text-slate-400">Min GPA: {uni.min_gpa}</span>
      </div>

      {reasons.length > 0 && (
        <div className="mt-8 rounded-3xl bg-slate-950 p-6">
          <h4 className="mb-4 text-xl font-semibold text-slate-300">Why this matches you</h4>
          <ul className="space-y-3 text-xl text-slate-300">
            {reasons.slice(0, 3).map((reason, i) => (
              <li key={i}>- {reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 flex gap-4">
        <button
          onClick={() =>
            navigate(`/universities/${uni.id}`, {
              state: { university: uni },
            })
          }
          className="flex-1 rounded-3xl bg-emerald-500 py-4 text-2xl font-semibold text-black transition hover:bg-emerald-400"
        >
          View Details
        </button>

        <button
          onClick={() =>
            navigate(`/universities/${uni.id}`, {
              state: { university: uni },
            })
          }
          className="w-20 rounded-3xl border border-slate-800 bg-black text-4xl text-white transition hover:border-emerald-500"
        >
          +
        </button>
      </div>
    </div>
  );
}

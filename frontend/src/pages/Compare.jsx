import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getComparedUniversities,
  removeUniversityFromCompare,
} from "../utils/compare";

const rows = [
  { key: "program", label: "Program" },
  { key: "location", label: "Location" },
  { key: "language", label: "Language" },
  { key: "min_gpa", label: "Min GPA", lowerBetter: true },
  { key: "tuition_fee", label: "Tuition", lowerBetter: true, isMoney: true },
  { key: "deadline", label: "Deadline", earlierBetter: true, isDate: true },
  { key: "fit_score", label: "Fit Score", higherBetter: true, isPercent: true },
  { key: "risk", label: "Risk Level", isRisk: true },
  { key: "world_ranking", label: "World Ranking", lowerBetter: true, isRanking: true },
  { key: "acceptance_rate", label: "Acceptance Rate", higherBetter: true, isPercent: true },
];

function riskBadgeClasses(risk) {
  switch (risk) {
    case "Safe":
      return "bg-green-100 text-green-700 border border-green-200 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-300";
    case "Match":
      return "bg-blue-100 text-blue-700 border border-blue-200 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300";
    case "Reach":
      return "bg-red-100 text-red-700 border border-red-200 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300";
  }
}

function formatValue(row, uni) {
  if (!uni) return "-";

  if (row.key === "location") {
    return `${uni.city || "-"}, ${uni.country || "-"}`;
  }

  const value =
    uni[row.key] ??
    (row.key === "fit_score" ? uni.score : undefined);

  if (value == null || value === "") return "-";

  if (row.isMoney) {
    if (typeof value === "string") return value;
    if (Number(value) === 0) return "Free";
    return `$${Number(value).toLocaleString()}`;
  }

  if (row.isDate) {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (row.isPercent) {
    return `${value}%`;
  }

  if (row.isRanking) {
    return `#${value}`;
  }

  return value;
}

function getComparableValue(row, uni) {
  if (!uni) return null;

  const raw =
    uni[row.key] ??
    (row.key === "fit_score" ? uni.score : undefined);

  if (raw == null) return null;

  if (row.isDate) return new Date(raw).getTime();
  if (row.isMoney) {
    if (typeof raw === "string") return null;
    return Number(raw);
  }
  if (row.isPercent || row.isRanking || row.lowerBetter || row.higherBetter) {
    return Number(raw);
  }

  return null;
}

function getWinners(row, universities) {
  const values = universities.map((uni) => getComparableValue(row, uni));

  const valid = values.filter((v) => v != null && !Number.isNaN(v));
  if (valid.length === 0) return [];

  let best;
  if (row.lowerBetter || row.earlierBetter) {
    best = Math.min(...valid);
  } else if (row.higherBetter) {
    best = Math.max(...valid);
  } else {
    return [];
  }

  return values.map((v) => v === best);
}

export default function Compare() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    setUniversities(getComparedUniversities());
  }, []);

  function handleRemove(id) {
    const updated = removeUniversityFromCompare(id);
    setUniversities(updated);
  }

  const displayedUniversities = universities;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Compare Universities</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Compare up to three universities side by side.
            </p>
          </div>

          <button
            onClick={() => navigate("/recommendations")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Back to Recommendations
          </button>
        </div>

        {universities.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              No universities selected yet.
            </p>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Go to recommendations and click universities to add them to compare.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div
              className="grid border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800"
              style={{
                gridTemplateColumns: `260px repeat(${displayedUniversities.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="p-5 text-lg font-semibold text-slate-700 dark:text-slate-300">Compare</div>

              {displayedUniversities.map((uni) => (
                <div
                  key={uni.id}
                  className="flex items-center justify-between border-l border-slate-200 p-5 dark:border-slate-800"
                >
                  <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100">
                    {uni.name}
                  </h2>
                  <button
                    onClick={() => handleRemove(uni.id)}
                    className="ml-3 text-2xl leading-none text-slate-500 hover:text-red-500 dark:text-slate-400"
                    aria-label={`Remove ${uni.name}`}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>

            {rows.map((row) => {
              const winners = getWinners(row, displayedUniversities);

              return (
                <div
                  key={row.key}
                  className="grid border-b border-slate-200 last:border-b-0 dark:border-slate-800"
                  style={{
                    gridTemplateColumns: `260px repeat(${displayedUniversities.length}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="p-5 font-medium text-slate-600 dark:text-slate-400">{row.label}</div>

                  {displayedUniversities.map((uni, index) => {
                    const isWinner = winners[index];

                    return (
                      <div
                        key={`${row.key}-${uni.id}`}
                        className={`border-l border-slate-200 p-5 text-center ${
                          isWinner ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-white dark:bg-slate-900"
                        }`}
                      >
                        {row.isRisk && uni ? (
                          <span
                            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${riskBadgeClasses(
                              uni.risk || "Match"
                            )}`}
                          >
                            {uni.risk || "Match"}
                          </span>
                        ) : row.key === "fit_score" && uni ? (
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
                            {formatValue(row, uni)} fit
                          </span>
                        ) : (
                          <span className="text-xl text-slate-900 dark:text-slate-100">
                            {formatValue(row, uni)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

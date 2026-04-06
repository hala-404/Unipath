import { useMemo, useState } from "react";
import {
  clearComparedUniversities,
  getComparedUniversities,
  removeUniversityFromCompare,
} from "../api/compareStorage";
import { Link } from "react-router-dom";

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
}

function getBestValue(field, universities) {
  const values = universities.map((u) => u[field]);

  if (field === "min_gpa") {
    const numericValues = values.map(Number).filter((v) => !Number.isNaN(v));
    return Math.min(...numericValues);
  }

  if (field === "score") {
    const numericValues = values.map(Number).filter((v) => !Number.isNaN(v));
    return Math.max(...numericValues);
  }

  return null;
}

function cellClass(field, university, universities) {
  if (universities.length < 2) return "";

  if (field === "min_gpa") {
    const best = getBestValue(field, universities);
    return Number(university.min_gpa) === best
      ? "bg-emerald-50 text-emerald-700"
      : "";
  }

  if (field === "score") {
    const best = getBestValue(field, universities);
    return Number(university.score) === best
      ? "bg-emerald-50 text-emerald-700"
      : "";
  }

  return "";
}

function riskBadgeClass(label) {
  if (label === "Match") return "bg-amber-100 text-amber-700";
  if (label === "Safe") return "bg-green-100 text-green-700";
  if (label === "Reach") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

export default function Compare() {
  const [universities, setUniversities] = useState(getComparedUniversities());

  const rows = useMemo(
    () => [
      {
        label: "Program",
        render: (u) => u.program || "N/A",
      },
      {
        label: "Location",
        render: (u) =>
          `${u.city || ""}${u.city && u.country ? ", " : ""}${u.country || ""}` ||
          "N/A",
      },
      {
        label: "Language",
        render: (u) => u.language || "N/A",
      },
      {
        label: "Min GPA",
        field: "min_gpa",
        render: (u) => u.min_gpa ?? "N/A",
      },
      {
        label: "Deadline",
        render: (u) => formatDate(u.deadline),
      },
      {
        label: "Fit Score",
        field: "score",
        render: (u) => `${u.score ?? 0}`,
      },
      {
        label: "Risk Level",
        render: (u) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${riskBadgeClass(
              u.risk_label
            )}`}
          >
            {u.risk_label || "N/A"}
          </span>
        ),
      },
    ],
    []
  );

  function handleRemove(id) {
    const updated = removeUniversityFromCompare(id);
    setUniversities(updated);
  }

  function handleClear() {
    clearComparedUniversities();
    setUniversities([]);
  }

  if (universities.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Compare</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
          No universities selected yet.
        </div>
        <Link
          to="/recommendations"
          className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to Recommendations
        </Link>
      </div>
    );
  }

  if (universities.length === 1) {
    const university = universities[0];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compare</h1>
          <p className="mt-1 text-sm text-slate-600">
            Select one more university to start comparison.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {university.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {university.city}, {university.country}
              </p>
            </div>

            <button
              onClick={() => handleRemove(university.id)}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Remove
            </button>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <p>
              <span className="font-medium">Program:</span> {university.program}
            </p>
            <p>
              <span className="font-medium">Language:</span> {university.language}
            </p>
            <p>
              <span className="font-medium">Min GPA:</span> {university.min_gpa}
            </p>
            <p>
              <span className="font-medium">Deadline:</span>{" "}
              {formatDate(university.deadline)}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/recommendations"
            className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add another university
          </Link>

          <button
            onClick={handleClear}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compare</h1>
          <p className="mt-1 text-sm text-slate-600">
            Best value in each category is highlighted.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Clear
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div
          className="grid border-b border-slate-200"
          style={{ gridTemplateColumns: `220px repeat(${universities.length}, minmax(0, 1fr))` }}
        >
          <div className="p-5 text-slate-500">Compare</div>

          {universities.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-5">
              <span className="text-lg font-semibold text-slate-900">{u.name}</span>
              <button
                onClick={() => handleRemove(u.id)}
                className="text-slate-400 hover:text-slate-900"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {rows.map((row) => (
          <div
            key={row.label}
            className="grid border-b border-slate-200 last:border-b-0"
            style={{ gridTemplateColumns: `220px repeat(${universities.length}, minmax(0, 1fr))` }}
          >
            <div className="p-5 text-slate-500">{row.label}</div>

            {universities.map((u) => (
              <div
                key={`${row.label}-${u.id}`}
                className={`p-5 text-slate-900 ${row.field ? cellClass(row.field, u, universities) : ""}`}
              >
                {row.render(u)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
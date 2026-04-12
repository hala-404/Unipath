import { useState } from "react";
import { Brain, ChevronDown, MapPin } from "lucide-react";
import { addApplication } from "../../api/tracker";
import { addUniversityToCompare, isUniversityCompared } from "../../utils/compare";

function formatTuition(value) {
  if (value == null || value === "") return "N/A";
  if (typeof value === "string" && value.trim()) return value;
  if (Number(value) === 0) return "Free";
  return `$${Number(value).toLocaleString()}/yr`;
}

function formatDeadline(deadline) {
  if (!deadline) return "N/A";
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function riskBadgeClasses(risk) {
  switch (risk) {
    case "Safe":
      return "border-green-200 bg-green-50 text-green-700";
    case "Reach":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

function getOptimizedImage(url, width = 1200, height = 700) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_fill,g_auto,w_${width},h_${height}/`
  );
}

export default function UniversityCard({
  university,
  getToken,
  isLoaded,
  isSignedIn,
  onCompared,
  navigate,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  const fitScore = university.fit_score ?? university.score ?? 0;
  const risk = university.risk || "Match";
  const compared = isUniversityCompared(university.id);
  const matchedCriteria = university.matchedCriteria ?? null;
  const totalCriteria = university.totalCriteria ?? null;

  const scoreBreakdown = [
    university.user_gpa != null && university.min_gpa != null
      ? `GPA eligibility: your GPA ${university.user_gpa} meets the minimum ${university.min_gpa}`
      : null,
    ...(university.reasons || []).filter(
      (reason) =>
        !reason.toLowerCase().includes("gpa") &&
        !reason.toLowerCase().includes("minimum gpa")
    ),
  ].filter(Boolean);

  const rawImageUrl =
    university.image_url ||
    university.image ||
    university.photo_url ||
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80";

  const imageUrl = getOptimizedImage(rawImageUrl, 800, 500);

  async function handleAddToTracker() {
    setShowMenu(false);

    try {
      if (!isLoaded || !isSignedIn) {
        throw new Error("You must be signed in to add an application.");
      }

      const token = await getToken();
      await addApplication(university.id, token);
      alert("University added to tracker");
    } catch (error) {
      alert(error.message);
    }
  }

  function handleAddToCompare() {
    setShowMenu(false);
    const result = addUniversityToCompare(university);
    onCompared(result);
  }

  function handleViewDetails() {
    navigate("/university-details", {
      state: { university },
    });
  }

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* IMAGE */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imageUrl}
          alt={university.name}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80";
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

        {university.world_ranking != null && (
          <div className="absolute left-4 top-4 rounded-2xl bg-white/95 px-4 py-2 text-base font-semibold text-slate-900 shadow-sm dark:bg-slate-950/90 dark:text-slate-100">
            #{university.world_ranking} World
          </div>
        )}

        <div className="absolute right-4 top-4 rounded-2xl bg-emerald-500 px-4 py-2 text-base font-semibold text-white shadow-sm">
          {fitScore}% fit
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="line-clamp-2 text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            {university.name}
          </h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-200 dark:text-slate-300">
            <MapPin className="h-4 w-4" />
            {university.city}, {university.country}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-6 pb-6 pt-7">
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-slate-700 dark:text-slate-300">
          <p className="text-sm">
            <span className="font-semibold">Program:</span> {university.program || "N/A"}
          </p>

          <p className="text-sm">
            <span className="font-semibold">Language:</span> {university.language || "N/A"}
          </p>

          <p className="text-sm">
            <span className="font-semibold">Tuition:</span> {formatTuition(university.tuition_fee)}
          </p>

          <p className="text-sm">
            <span className="font-semibold">Deadline:</span> {formatDeadline(university.deadline)}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span
            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${riskBadgeClasses(
              risk
            )}`}
          >
            {risk}
          </span>

          <span className="text-sm text-slate-600 dark:text-slate-400">
            Min GPA: {university.min_gpa ?? "N/A"}
          </span>
        </div>

        {/* WHY THIS MATCHES */}
        <div className="mt-6 rounded-[24px] bg-slate-50 p-6 dark:bg-slate-800">
          <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Why this matches you
          </h4>

          <ul className="space-y-3">
            {(university.reasons || []).slice(0, 3).map((reason, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400">
                  ✓
                </div>
                <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {reason}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleViewDetails}
            className="flex-1 rounded-[22px] bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            View Details
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-[22px] border border-slate-300 bg-white text-xl text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              +
            </button>

            {showMenu && (
              <div className="absolute bottom-[calc(100%+12px)] right-0 z-30 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={handleAddToTracker}
                  className="block w-full rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Add to Tracker
                </button>

                <button
                  onClick={handleAddToCompare}
                  className="block w-full rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {compared ? "Already in Compare" : "Add to Compare"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowScoreDetails((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Why this score?
              </span>
            </div>

            <ChevronDown
              className={`h-6 w-6 text-slate-500 transition-transform dark:text-slate-400 ${
                showScoreDetails ? "rotate-180" : ""
              }`}
            />
          </button>

          {showScoreDetails && (
            <div className="mt-4 rounded-[22px] bg-slate-50 p-5 dark:bg-slate-800">
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                {matchedCriteria != null && totalCriteria != null
                  ? `This university matched ${matchedCriteria} out of ${totalCriteria} scored preference criteria.`
                  : "This score is based on how well the university matches your saved profile preferences."}
              </p>

              <ul className="space-y-3">
                {scoreBreakdown.map((item, index) => (
                  <li key={index} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

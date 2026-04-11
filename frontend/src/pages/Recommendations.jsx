import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  Brain,
  BrainCircuit,
  ChevronDown,
  GraduationCap,
  Globe,
  DollarSign,
  Sparkles,
  MapPin,
} from "lucide-react";
import { fetchRecommendations } from "../api/recommendations";
import { addApplication } from "../api/tracker";
import {
  addUniversityToCompare,
  getComparedUniversities,
  isUniversityCompared,
} from "../utils/compare";

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

function formatBudget(value) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "Any";
  return `USD ${Number(value).toLocaleString()}/yr`;
}

function getLocationLabel(profile) {
  const city = profile?.preferred_city?.trim();
  const country = profile?.preferred_country?.trim();

  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return "Any";
}

function buildFilterPills(profile) {
  return [
    `GPA: ${profile?.gpa ?? "Any"}`,
    `city: ${profile?.preferred_city || "Any"}`,
    `country: ${profile?.preferred_country || "Any"}`,
    `program: ${profile?.preferred_program || "Any"}`,
    `language: ${profile?.preferred_language || "Any"}`,
    `budget: ${
      profile?.max_tuition != null && profile?.max_tuition !== ""
        ? `<= ${Number(profile.max_tuition).toLocaleString()}`
        : "Any"
    }`,
  ];
}

function getMissingPreferenceMessage(profile) {
  const missing = [];

  if (profile?.gpa == null || profile?.gpa === "") missing.push("GPA");
  if (!profile?.preferred_city && !profile?.preferred_country) missing.push("location");
  if (!profile?.preferred_program) missing.push("program");
  if (!profile?.preferred_language) missing.push("language");
  if (profile?.max_tuition == null || profile?.max_tuition === "") missing.push("budget");

  if (missing.length === 0) return "";

  return `Some preferences are set to "Any". Add more details like ${missing.join(", ")} to get more precise recommendations.`;
}

function isAnyProfile(profile) {
  const noGpa = profile?.gpa == null || profile?.gpa === "";
  const noCity = !profile?.preferred_city;
  const noCountry = !profile?.preferred_country;
  const noProgram = !profile?.preferred_program;
  const noLanguage = !profile?.preferred_language;
  const noBudget = profile?.max_tuition == null || profile?.max_tuition === "";

  return noGpa && noCity && noCountry && noProgram && noLanguage && noBudget;
}

function UniversityCard({
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

  const imageUrl =
    university.image_url ||
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80";

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
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      {/* IMAGE */}
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={university.name}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />

        {university.world_ranking != null && (
          <div className="absolute left-5 top-5 rounded-2xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur">
            #{university.world_ranking} World
          </div>
        )}

        <div className="absolute right-5 top-5 rounded-2xl bg-emerald-50/95 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur">
          {fitScore}% fit
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-6 pb-6 pt-7">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
          {university.name}
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          {university.city}, {university.country}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-slate-700">
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

          <span className="text-sm text-slate-600">
            Min GPA: {university.min_gpa ?? "N/A"}
          </span>
        </div>

        {/* WHY THIS MATCHES */}
        <div className="mt-6 rounded-[24px] bg-slate-50 p-6">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">
            Why this matches you
          </h4>

          <ul className="space-y-3">
            {(university.reasons || []).slice(0, 3).map((reason, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 text-emerald-600">
                  ✓
                </div>
                <span className="text-sm leading-relaxed text-slate-700">
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
              className="flex h-10 w-10 items-center justify-center rounded-[22px] border border-slate-300 bg-white text-xl text-slate-900 shadow-sm hover:bg-slate-50"
            >
              +
            </button>

            {showMenu && (
              <div className="absolute bottom-[calc(100%+12px)] right-0 z-30 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  onClick={handleAddToTracker}
                  className="block w-full rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  Add to Tracker
                </button>

                <button
                  onClick={handleAddToCompare}
                  className="block w-full rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  {compared ? "Already in Compare" : "Add to Compare"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={() => setShowScoreDetails((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">
                Why this score?
              </span>
            </div>

            <ChevronDown
              className={`h-6 w-6 text-slate-500 transition-transform ${
                showScoreDetails ? "rotate-180" : ""
              }`}
            />
          </button>

          {showScoreDetails && (
            <div className="mt-4 rounded-[22px] bg-slate-50 p-5">
              <p className="mb-3 text-sm text-slate-500">
                {matchedCriteria != null && totalCriteria != null
                  ? `This university matched ${matchedCriteria} out of ${totalCriteria} scored preference criteria.`
                  : "This score is based on how well the university matches your saved profile preferences."}
              </p>

              <ul className="space-y-3">
                {scoreBreakdown.map((item, index) => (
                  <li key={index} className="text-sm leading-relaxed text-slate-700">
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

export default function Recommendations() {
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [exactMatches, setExactMatches] = useState([]);
  const [alternativeRecommendations, setAlternativeRecommendations] = useState([]);
  const [profileSummary, setProfileSummary] = useState({});
  const [compareCount, setCompareCount] = useState(getComparedUniversities().length);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  function handleCompared(result) {
    setCompareCount(result.items.length);

    if (!result.success && result.reason === "already_exists") {
      alert("This university is already in compare.");
      return;
    }

    if (!result.success && result.reason === "max_reached") {
      alert("You can compare up to 3 universities only.");
      return;
    }

    if (result.success && result.items.length >= 2) {
      navigate("/compare");
    }
  }

  useEffect(() => {
    async function loadRecommendations() {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const data = await fetchRecommendations(token);
        setExactMatches(data.exactMatches || []);
        setAlternativeRecommendations(data.alternativeRecommendations || []);
        setProfileSummary(data.profileSummary || {});
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [getToken, isLoaded, isSignedIn]);

  const filterPills = buildFilterPills(profileSummary);
  const isExploreMode = isAnyProfile(profileSummary);
  const missingPreferenceMessage = getMissingPreferenceMessage(profileSummary);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-700">Loading recommendations...</div>;
  }

  if (errorMessage) {
    return <div className="min-h-screen bg-slate-50 p-8 text-red-600">{errorMessage}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">
              {isExploreMode ? "Explore Universities" : "AI Recommendations"}
            </h1>
          </div>

          <p className="mt-2 max-w-3xl text-slate-600">
            {isExploreMode
              ? "Explore the universities"
              : "Based on your saved profile, UniPath found universities that best match your academic eligibility and personal preferences."}
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Your Profile Summary</h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            These fields are used to score and rank your recommendation results.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">↗</div>
              <div>
                <p className="text-sm text-slate-500">GPA</p>
                <p className="font-semibold text-slate-900">
                  {profileSummary.gpa ?? "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Program</p>
                <p className="font-semibold text-slate-900">
                  {profileSummary.preferred_program || "Any"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <Globe className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Language</p>
                <p className="font-semibold text-slate-900">
                  {profileSummary.preferred_language || "Any"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="font-semibold text-slate-900">
                  {getLocationLabel(profileSummary)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Max Tuition</p>
                <p className="font-semibold text-slate-900">
                  {formatBudget(profileSummary.max_tuition)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Active filters:</span>
            {filterPills.length > 0 ? (
              filterPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
                >
                  {pill}
                </span>
              ))
            ) : (
              <span className="text-slate-400">No saved filters yet</span>
            )}
          </div>
          <div className="text-sm text-slate-500">Compare selected: {compareCount}/3</div>
        </div>

        {missingPreferenceMessage ? (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {missingPreferenceMessage}
          </div>
        ) : null}

        <section className="mb-12">
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            {isExploreMode ? "Explore" : "Exact Matches"}
          </h2>
          <p className="mb-5 text-slate-600">
            {isExploreMode
              ? "Explore the universities"
              : "Universities with the strongest alignment to your saved profile."}
          </p>

          {exactMatches.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
              No exact matches found for your current preferences.
            </div>
          ) : (
            <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
              {exactMatches.map((university) => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  getToken={getToken}
                  isLoaded={isLoaded}
                  isSignedIn={isSignedIn}
                  onCompared={handleCompared}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </section>

        {!isExploreMode && (
          <section>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              Other Recommended Options
            </h2>
            <p className="mb-5 text-slate-600">
              Alternative universities that still match your program and language but not your location preference.
            </p>

            {alternativeRecommendations.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                No alternative recommendations available.
              </div>
            ) : (
              <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
                {alternativeRecommendations.map((university) => (
                  <UniversityCard
                    key={university.id}
                    university={university}
                    getToken={getToken}
                    isLoaded={isLoaded}
                    isSignedIn={isSignedIn}
                    onCompared={handleCompared}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

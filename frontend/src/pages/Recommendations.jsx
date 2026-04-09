import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  GraduationCap,
  CalendarDays,
  MapPin,
  CirclePlus,
  CheckCircle2,
  BrainCircuit,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { fetchRecommendations } from "../api/recommendations";
import { addApplication } from "../api/tracker";
import {
  addUniversityToCompare,
  getComparedUniversities,
  isUniversityCompared,
} from "../utils/compare";

function formatTuition(university) {
  const value = university.tuition_fee;
  if (value == null || value === "") return "N/A";
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Number(value) === 0) return "Free";
  return `$${Number(value).toLocaleString()}/yr`;
}

function formatDeadline(deadline) {
  if (!deadline) return "N/A";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return deadline;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildReasons(university) {
  const reasons = [];

  if (university.user_gpa != null && university.min_gpa != null) {
    if (Number(university.user_gpa) >= Number(university.min_gpa)) {
      reasons.push(`Strong match with your GPA of ${university.user_gpa}`);
    } else {
      reasons.push(
        `Your GPA of ${university.user_gpa} is below the minimum ${university.min_gpa}, so this is more competitive`
      );
    }
  }

  if (university.program) {
    reasons.push(`Aligns with your interest in ${university.program}`);
  }

  if (university.language) {
    reasons.push(`${university.language}-taught program matches your preference`);
  }

  return reasons;
}

function getRiskStyles(risk) {
  switch (risk) {
    case "Safe":
      return "border-green-200 bg-green-50 text-green-700";
    case "Reach":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

function UniversityCard({
  university,
  getToken,
  isLoaded,
  isSignedIn,
  onCompared,
}) {
  const navigate = useNavigate();
  const [showReasons, setShowReasons] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const fitScore = university.fit_score ?? university.score ?? 0;
  const risk = university.risk || "Match";
  const reasons = buildReasons(university);
  const compared = isUniversityCompared(university.id);

  const imageUrl =
    university.image_url ||
    university.image ||
    university.photo_url ||
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80";

  useEffect(() => {
    function handleOutsideClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showMenu]);

  async function handleAddToTracker() {
    try {
      setShowMenu(false);

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
    navigate("/university-details", { state: { university } });
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-72 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={university.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

        {university.world_ranking != null && (
          <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-2 text-lg font-semibold text-slate-900 backdrop-blur">
            #{university.world_ranking} World
          </div>
        )}

        <div className="absolute right-4 top-4 rounded-2xl bg-emerald-500/90 px-4 py-2 text-lg font-semibold text-white backdrop-blur">
          {fitScore}% fit
        </div>
      </div>

      <div className="px-6 pb-6 pt-7">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">
          {university.name}
        </h3>

        <div className="mt-4 flex items-center gap-3 text-slate-500">
          <MapPin className="h-6 w-6" />
          <p className="text-lg md:text-xl">
            {university.city}, {university.country}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 text-slate-700">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-emerald-600" />
            <span className="text-lg md:text-xl">{university.program || "N/A"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Globe className="h-7 w-7 text-emerald-600" />
            <span className="text-lg md:text-xl">{university.language || "N/A"}</span>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="h-7 w-7 text-emerald-600" />
            <span className="text-lg md:text-xl">{formatTuition(university)}</span>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-emerald-600" />
            <span className="text-lg md:text-xl">{formatDeadline(university.deadline)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span
            className={`inline-flex rounded-full border px-5 py-3 text-sm md:text-base font-medium ${getRiskStyles(
              risk
            )}`}
          >
            {risk}
          </span>

          <span className="text-lg md:text-xl text-slate-500">
            Min GPA: {university.min_gpa ?? "N/A"}
          </span>
        </div>

        <div className="mt-8 rounded-[24px] bg-slate-50 px-5 py-5">
          <button
            type="button"
            onClick={() => setShowReasons((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-6 w-6 text-slate-500" />
              <span className="text-lg md:text-xl font-semibold text-slate-800">
                Why this score?
              </span>
            </div>

            {showReasons ? (
              <ChevronUp className="h-6 w-6 text-slate-500" />
            ) : (
              <ChevronDown className="h-6 w-6 text-slate-500" />
            )}
          </button>

          {showReasons && (
            <div className="mt-5 rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h4 className="mb-4 text-lg md:text-xl font-semibold text-slate-800">
                Why this matches you
              </h4>

              <ul className="space-y-4">
                {reasons.map((reason, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 text-slate-700"
                  >
                    <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-emerald-600" />
                    <span className="text-base md:text-lg leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleViewDetails}
            className="flex-1 rounded-[22px] bg-emerald-600 px-6 py-4 text-sm md:text-base font-medium text-white transition hover:bg-emerald-500"
          >
            View Details
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            >
              <CirclePlus className="h-8 w-8" />
            </button>

            {showMenu && (
              <div className="absolute bottom-[calc(100%+12px)] right-0 z-30 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  onClick={handleAddToTracker}
                  className="block w-full rounded-xl px-4 py-3 text-left text-base text-slate-700 hover:bg-slate-50"
                >
                  Add to Tracker
                </button>

                <button
                  onClick={handleAddToCompare}
                  className="block w-full rounded-xl px-4 py-3 text-left text-base text-slate-700 hover:bg-slate-50"
                >
                  {compared ? "Already in Compare" : "Add to Compare"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Recommendations() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [exactMatches, setExactMatches] = useState([]);
  const [alternativeRecommendations, setAlternativeRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [compareCount, setCompareCount] = useState(0);

  useEffect(() => {
    setCompareCount(getComparedUniversities().length);
  }, []);

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
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [getToken, isLoaded, isSignedIn]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-700">
        Loading recommendations...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-red-600">
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">
              AI Recommendations
            </h1>
          </div>

          <p className="mt-2 max-w-3xl text-slate-600">
            Based on your profile, preferences, and academic goals, our AI has found
            universities that best match your criteria. Each recommendation includes an
            explainable fit score.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Your Profile Summary
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Our AI uses this information to find your best matches
          </p>

          <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <span className="text-sm font-bold text-emerald-600">↗</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">GPA</p>
                <p className="font-semibold text-slate-900">3.6</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Program</p>
                <p className="font-semibold text-slate-900">Computer Science</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <Globe className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Language</p>
                <p className="font-semibold text-slate-900">English</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Budget</p>
                <p className="font-semibold text-slate-900">USD 30,000/yr</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Active filters:</span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              program: Computer Science ×
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              language: English ×
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              scholarship: Yes ×
            </span>
          </div>

          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Adjust Filters
            </button>

            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Refresh
            </button>
          </div>
        </div>

        <section className="mb-14">
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Exact Matches</h2>
          <p className="mb-6 text-slate-600">
            Universities that directly fit your saved profile.
          </p>

          {exactMatches.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
              No exact matches found.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {exactMatches.map((university) => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  getToken={getToken}
                  isLoaded={isLoaded}
                  isSignedIn={isSignedIn}
                  onCompared={handleCompared}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            Other Recommended Options
          </h2>
          <p className="mb-6 text-slate-600">
            Alternatives based on partial match and eligibility.
          </p>

          {alternativeRecommendations.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
              No alternative recommendations available.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {alternativeRecommendations.map((university) => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  getToken={getToken}
                  isLoaded={isLoaded}
                  isSignedIn={isSignedIn}
                  onCompared={handleCompared}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

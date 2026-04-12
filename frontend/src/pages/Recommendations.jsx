import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  BrainCircuit,
  GraduationCap,
  Globe,
  DollarSign,
  Sparkles,
  MapPin,
} from "lucide-react";
import { fetchRecommendations } from "../api/recommendations";
import {
  getComparedUniversities,
} from "../utils/compare";
import UniversityCard from "../components/recommendations/UniversityCard";

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
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-700 dark:bg-slate-950 dark:text-slate-400">Loading recommendations...</div>;
  }

  if (errorMessage) {
    return <div className="min-h-screen bg-slate-50 p-8 text-red-600 dark:bg-slate-950 dark:text-red-400">{errorMessage}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {isExploreMode ? "Explore Universities" : "AI Recommendations"}
            </h1>
          </div>

          <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
            {isExploreMode
              ? "Explore the universities"
              : "Based on your saved profile, UniPath found universities that best match your academic eligibility and personal preferences."}
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0c1a31]">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Profile Summary</h2>
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            These fields are used to score and rank your recommendation results.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">↗</div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">GPA</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {profileSummary.gpa ?? "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Program</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {profileSummary.preferred_program || "Any"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <Globe className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Language</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {profileSummary.preferred_language || "Any"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {getLocationLabel(profileSummary)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Max Tuition</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatBudget(profileSummary.max_tuition)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0c1a31]">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Active filters:</span>
            {filterPills.length > 0 ? (
              filterPills.map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200"
                >
                  {pill}
                  <button type="button" className="opacity-60 hover:opacity-100">
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-slate-400 dark:text-slate-500">No saved filters yet</span>
            )}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Compare selected: {compareCount}/3</div>
        </div>

        {missingPreferenceMessage ? (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
            {missingPreferenceMessage}
          </div>
        ) : null}

        <section className="mb-12">
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isExploreMode ? "Explore" : "Exact Matches"}
          </h2>
          <p className="mb-5 text-slate-600 dark:text-slate-400">
            {isExploreMode
              ? "Explore the universities"
              : "Universities with the strongest alignment to your saved profile."}
          </p>

          {exactMatches.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-white p-6 text-slate-600 shadow-sm dark:border-white/10 dark:bg-[#0c1a31] dark:text-slate-400">
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
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              Other Recommended Options
            </h2>
            <p className="mb-5 text-slate-600 dark:text-slate-400">
              Alternative universities that still match your program and language but not your location preference.
            </p>

            {alternativeRecommendations.length === 0 ? (
              <div className="rounded-3xl border border-black/10 bg-white p-6 text-slate-600 shadow-sm dark:border-white/10 dark:bg-[#0c1a31] dark:text-slate-400">
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

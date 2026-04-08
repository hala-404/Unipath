import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { Link } from "react-router-dom";
import { fetchRecommendations } from "../api/recommendations";
import { addApplication } from "../api/tracker";

const riskStyles = {
  Safe: "border-green-600 text-green-700 bg-green-50",
  Match: "border-green-600 text-green-700 bg-green-50",
  Reach: "border-red-500 text-red-600 bg-red-50",
};

const currencyMap = {
  USA: "$", "United Kingdom": "\u00a3", Canada: "CA$", Australia: "A$",
  Germany: "\u20ac", China: "\u00a5", Netherlands: "\u20ac", Switzerland: "CHF ",
  Singapore: "S$", Japan: "\u00a5", "South Korea": "\u20a9", France: "\u20ac",
  Sweden: "SEK ", "Hong Kong": "HK$", Ireland: "\u20ac", Denmark: "DKK ",
  Italy: "\u20ac", Spain: "\u20ac",
};

function formatTuition(tuition, country) {
  if (tuition == null) return "N/A";
  const sym = currencyMap[country] || "$";
  return `${sym}${Number(tuition).toLocaleString()}/yr`;
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UniversityCard({ university, getToken, isLoaded, isSignedIn }) {
  async function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!isLoaded || !isSignedIn) throw new Error("You must be signed in.");
      const token = await getToken();
      await addApplication(university.id, token);
      alert("University added to tracker");
    } catch (error) {
      alert(error.message);
    }
  }

  const fitScore = university.fit_score ?? university.score ?? 0;
  const risk = university.risk || "Match";
  const badgeClass = riskStyles[risk] || riskStyles.Match;
  const userGpa = university.user_gpa;
  const minGpa = Number(university.min_gpa);
  const gpaMatch = userGpa != null && Number(userGpa) >= minGpa;

  const matchReasons = [];
  if (userGpa != null && gpaMatch) {
    matchReasons.push(`Strong match with your GPA of ${userGpa}`);
  }
  matchReasons.push(`Aligns with your interest in ${university.program}`);
  if (university.language) {
    matchReasons.push(`${university.language}-taught program matches your preference`);
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {/* Hero gradient */}
      <div className="relative h-44 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
        {university.world_ranking != null && (
          <span className="absolute left-3 top-3 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            #{university.world_ranking} World
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-lg bg-green-600/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
          {fitScore}% Fit
        </span>
      </div>

      <div className="p-5">
        {/* Name & location */}
        <h3 className="text-lg font-bold text-slate-900">{university.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0z" /><circle cx="12" cy="11" r="3" /></svg>
          {university.city}, {university.country}
        </p>

        {/* Info grid */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
          <p className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84 51.39 51.39 0 0 0-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
            <span className="truncate">{university.program}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20" /></svg>
            {university.language}
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
            {formatTuition(university.tuition_fee, university.country)}
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            {new Date(university.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Risk badge + Min GPA */}
        <div className="mt-4 flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
            {risk}
          </span>
          <span className="text-sm text-slate-500">Min GPA: {university.min_gpa}</span>
        </div>

        {/* Why this matches you */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <h4 className="text-sm font-bold text-slate-800">Why this matches you</h4>
          <ul className="mt-2 space-y-2">
            {matchReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckIcon />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <Link
            to={`/universities/${university.id}`}
            state={{ university }}
            className="flex-1 rounded-xl bg-green-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-800"
          >
            View Details
          </Link>
          <button
            onClick={handleAdd}
            className="rounded-xl border border-slate-300 px-3 py-2.5 text-slate-600 hover:bg-slate-50"
            title="Add to Tracker"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 5v14m-7-7h14" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Recommendations() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [exactMatches, setExactMatches] = useState([]);
  const [alternativeRecommendations, setAlternativeRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-600">Loading recommendations...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Recommendations</h1>
        <p className="mt-2 text-sm text-slate-600">
          View exact matches and alternative recommendations based on your saved profile.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Exact Matches</h2>
          <p className="mt-1 text-sm text-slate-600">
            Universities that satisfy your selected criteria directly.
          </p>
        </div>

        {exactMatches.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-600">
              No exact matches found for your current preferences.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exactMatches.map((university) => (
              <UniversityCard
                key={university.id}
                university={university}
                getToken={getToken}
                isLoaded={isLoaded}
                isSignedIn={isSignedIn}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Other Recommended Options
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Strong alternatives based on partial preference matching and GPA eligibility.
          </p>
        </div>

        {alternativeRecommendations.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-600">
              No alternative recommendations available.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {alternativeRecommendations.map((university) => (
              <UniversityCard
                key={university.id}
                university={university}
                getToken={getToken}
                isLoaded={isLoaded}
                isSignedIn={isSignedIn}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

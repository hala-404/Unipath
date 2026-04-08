import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { fetchRecommendations } from "../api/recommendations";
import { addApplication } from "../api/tracker";

const riskColors = {
  Safe: "bg-green-100 text-green-800",
  Match: "bg-yellow-100 text-yellow-800",
  Reach: "bg-red-100 text-red-800",
};

function formatTuition(tuition) {
  if (tuition == null) return "N/A";
  return `$${Number(tuition).toLocaleString()}`;
}

function UniversityCard({ university, getToken, isLoaded, isSignedIn }) {
  async function handleAdd() {
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

  const fitScore = university.fit_score ?? university.score ?? 0;
  const risk = university.risk || "Match";
  const badgeClass = riskColors[risk] || riskColors.Match;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {university.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {university.city}, {university.country}
            {university.world_ranking != null && (
              <span className="ml-2 text-slate-400">
                #{university.world_ranking} World Ranking
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
          >
            {risk}
          </span>
          <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            {fitScore}% Fit
          </div>
        </div>
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
          <span className="font-medium">Tuition:</span>{" "}
          {formatTuition(university.tuition_fee)}
        </p>
        <p>
          <span className="font-medium">Acceptance Rate:</span>{" "}
          {university.acceptance_rate != null
            ? `${university.acceptance_rate}%`
            : "N/A"}
        </p>
        <p>
          <span className="font-medium">Deadline:</span>{" "}
          {new Date(university.deadline).toLocaleDateString()}
        </p>
      </div>

      {/* Why this fits you */}
      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <h4 className="text-sm font-semibold text-slate-800">
          Why this university fits you
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {university.user_gpa != null && (
            <li>
              {Number(university.user_gpa) >= Number(university.min_gpa) ? (
                <>
                  Strong match with your GPA of{" "}
                  <span className="font-medium">{university.user_gpa}</span>{" "}
                  (min required: {university.min_gpa})
                </>
              ) : (
                <>
                  Your GPA of{" "}
                  <span className="font-medium">{university.user_gpa}</span> is
                  below the minimum of {university.min_gpa} — this is a reach
                </>
              )}
            </li>
          )}
          <li>
            Program: <span className="font-medium">{university.program}</span>{" "}
            matches your preference
          </li>
          <li>
            Language: <span className="font-medium">{university.language}</span>
          </li>
          <li>
            Tuition:{" "}
            <span className="font-medium">
              {formatTuition(university.tuition_fee)}
            </span>
          </li>
          <li>
            Acceptance rate:{" "}
            <span className="font-medium">
              {university.acceptance_rate != null
                ? `${university.acceptance_rate}%`
                : "N/A"}
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-4 flex gap-3">
        {/* Apply Button */}
        {university.website_url && (
          <a
            href={university.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Apply Now
          </a>
        )}

        {/* Tracker Button */}
        <button
          onClick={handleAdd}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add to Tracker
        </button>
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
          <div className="grid gap-6">
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
          <div className="grid gap-6">
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

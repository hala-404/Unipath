import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { addApplication } from "../api/tracker";

const API_URL = import.meta.env.VITE_API_URL;

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
  return `${sym}${Number(tuition).toLocaleString()}`;
}

const riskBadgeStyles = {
  Safe: "border-green-600 text-green-700 bg-green-50",
  Match: "border-green-600 text-green-700 bg-green-50",
  Reach: "border-red-500 text-red-600 bg-red-50",
};

const riskDescriptions = {
  Safe: "Your profile exceeds the typical requirements. You have a strong chance of acceptance.",
  Match: "Your profile aligns well with admitted students. You have a good chance of acceptance with a strong application.",
  Reach: "This university has requirements above your current profile. Consider strengthening your application or exploring other options.",
};

function CheckIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function getDaysRemaining(deadline) {
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function UniversityDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [uni, setUni] = useState(location.state?.university || null);
  const [loading, setLoading] = useState(!uni);
  const [error, setError] = useState("");

  useEffect(() => {
    if (uni) return;
    async function fetchUni() {
      try {
        const res = await fetch(`${API_URL}/universities/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Not found");
        setUni(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUni();
  }, [id, uni]);

  async function handleAddToTracker() {
    try {
      if (!isLoaded || !isSignedIn) throw new Error("You must be signed in.");
      const token = await getToken();
      await addApplication(uni.id, token);
      alert("University added to tracker");
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-600">Loading university details...</p>
      </div>
    );
  }

  if (error || !uni) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "University not found"}
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-blue-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const fitScore = uni.fit_score ?? uni.score ?? 0;
  const risk = uni.risk || "Match";
  const badgeClass = riskBadgeStyles[risk] || riskBadgeStyles.Match;
  const userGpa = uni.user_gpa;
  const minGpa = Number(uni.min_gpa);
  const gpaMatch = userGpa != null && Number(userGpa) >= minGpa;
  const daysLeft = getDaysRemaining(uni.deadline);
  const deadlineDate = new Date(uni.deadline).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const matchReasons = [];
  if (userGpa != null && gpaMatch) {
    matchReasons.push(`Strong match with your GPA of ${userGpa}`);
  }
  matchReasons.push(`Aligns with your interest in ${uni.program}`);
  if (uni.language) matchReasons.push(`${uni.language}-taught program matches your preference`);
  if (uni.world_ranking && uni.world_ranking <= 50) matchReasons.push("Excellent research opportunities at a top-ranked institution");

  const requiredDocs = ["Transcript", "Personal Statement", "Recommendation Letters (2)", "CV", "Language Certificate"];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Recommendations
      </button>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
        <div className="relative px-6 pb-6 pt-32 sm:pt-40">
          {/* Badges */}
          <div className="absolute left-4 top-4 flex gap-2">
            {uni.world_ranking != null && (
              <span className="flex items-center gap-1 rounded-lg bg-slate-900/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                #{uni.world_ranking} World Ranking
              </span>
            )}
            <span className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold backdrop-blur ${badgeClass}`}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
              {risk}
            </span>
          </div>

          {/* Name & location */}
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{uni.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-slate-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0z" /><circle cx="12" cy="11" r="3" /></svg>
            {uni.city}, {uni.country}
          </p>

          {/* Fit score bar */}
          {fitScore > 0 && (
            <div className="mt-4">
              <div className="h-8 w-full overflow-hidden rounded-full bg-white/20 backdrop-blur">
                <div
                  className="flex h-full items-center rounded-full bg-gradient-to-r from-green-400 to-green-600 px-4 text-sm font-bold text-white transition-all duration-700"
                  style={{ width: `${Math.max(fitScore, 15)}%` }}
                >
                  {fitScore}% fit
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-600 leading-relaxed">
          {uni.name} is a leading university located in {uni.city}, {uni.country}.
          {uni.world_ranking && uni.world_ranking <= 50
            ? ` Ranked #${uni.world_ranking} globally, it offers world-class education and cutting-edge research opportunities.`
            : uni.world_ranking
            ? ` Ranked #${uni.world_ranking} globally, it provides excellent academic programs and a vibrant international community.`
            : " It provides excellent academic programs and a vibrant international community."
          }
        </p>
      </div>

      {/* Program Details */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <svg className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84 51.39 51.39 0 0 0-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
          Program Details
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Program</p>
            <p className="mt-0.5 font-semibold text-slate-900">{uni.program}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Language</p>
            <p className="mt-0.5 font-semibold text-slate-900">{uni.language}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Tuition (per year)</p>
            <p className="mt-0.5 font-semibold text-slate-900">{formatTuition(uni.tuition_fee, uni.country)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Minimum GPA</p>
            <p className="mt-0.5 font-semibold text-slate-900">{uni.min_gpa}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Acceptance Rate</p>
            <p className="mt-0.5 font-semibold text-slate-900">
              {uni.acceptance_rate != null ? `${uni.acceptance_rate}%` : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Why This Matches You */}
      {matchReasons.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CheckIcon />
            Why This Matches You
          </h2>
          <p className="mt-1 text-sm text-slate-500">Our AI analyzed your profile and found these key alignment points</p>
          <ul className="mt-4 space-y-3">
            {matchReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <CheckIcon />
                <span className="font-medium">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Documents */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <DocIcon />
          Required Documents
        </h2>
        <p className="mt-1 text-sm text-slate-500">Checklist of documents needed for your application</p>
        <ul className="mt-4 space-y-3">
          {requiredDocs.map((doc) => (
            <li key={doc} className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 odd:bg-slate-50">
              <DocIcon />
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Application Deadline */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          Application Deadline
        </h2>
        <div className="mt-4 rounded-xl bg-slate-50 p-6 text-center">
          <p className="text-5xl font-bold text-green-700">{daysLeft}</p>
          <p className="mt-1 text-sm text-slate-500">days remaining</p>
          <p className="mt-2 font-medium text-slate-700">{deadlineDate}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Actions</h2>
        <div className="mt-4 flex flex-col gap-3">
          {uni.website_url && (
            <a
              href={uni.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
              Apply Now
            </a>
          )}
          <button
            onClick={handleAddToTracker}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 5v14m-7-7h14" /></svg>
            Add to Tracker
          </button>
          <Link
            to="/chat"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Ask AI About This University
          </Link>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Risk Assessment</h2>
        <div className="mt-4">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold ${badgeClass}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
            {risk}
          </span>
          <p className="mt-3 text-slate-600 leading-relaxed">{riskDescriptions[risk]}</p>
        </div>
      </div>
    </div>
  );
}

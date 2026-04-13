import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import ActionCard from "../components/university-details/ActionCard";
import ProgramDetailsSection from "../components/university-details/ProgramDetailsSection";
import QuickOverviewCard from "../components/university-details/QuickOverviewCard";
import UniversityHeader from "../components/university/UniversityHeader";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

function formatDeadline(deadline) {
  if (!deadline) return "N/A";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return deadline;
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function daysRemaining(deadline) {
  if (!deadline) return null;
  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

function getReasons(university) {
  const reasons = [];

  if (university.user_gpa != null && university.min_gpa != null) {
    if (Number(university.user_gpa) >= Number(university.min_gpa)) {
      reasons.push(`Strong match with your GPA of ${university.user_gpa}`);
    } else {
      reasons.push(
        `Your GPA of ${university.user_gpa} is below the minimum GPA of ${university.min_gpa}`
      );
    }
  }

  if (university.program) {
    reasons.push(`Aligns with your interest in ${university.program}`);
  }

  if (university.language) {
    reasons.push(`${university.language}-taught program matches your preference`);
  }

  if (university.acceptance_rate != null) {
    reasons.push(
      `Acceptance rate of ${university.acceptance_rate}% gives a realistic view of competitiveness`
    );
  }

  return reasons;
}

function getRequiredDocuments(university) {
  if (Array.isArray(university.required_documents) && university.required_documents.length) {
    return university.required_documents;
  }

  return [
    "Transcript",
    "Personal Statement",
    "Recommendation Letters (2)",
    "CV",
    "Language Certificate",
  ];
}

export default function UniversityDetails() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  const [university, setUniversity] = useState(state?.university || null);
  const [loading, setLoading] = useState(!state?.university);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerMessage, setTrackerMessage] = useState("");
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [trackerError, setTrackerError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function loadUniversity() {
      if (state?.university || !id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/universities/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load university");
        }

        setUniversity(data);
      } catch (error) {
        console.error(error.message);
        setUniversity(null);
      } finally {
        setLoading(false);
      }
    }

    loadUniversity();
  }, [id, state]);

  const reasons = useMemo(
    () => (university ? getReasons(university) : []),
    [university]
  );

  const documents = useMemo(
    () => (university ? getRequiredDocuments(university) : []),
    [university]
  );

  const remainingDays = university ? daysRemaining(university.deadline) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        Loading university details...
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <button
          onClick={() => navigate("/recommendations")}
          className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Recommendations
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">No university selected</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Please go back and open a university from the recommendations page.
          </p>
        </div>
      </div>
    );
  }

  const fitScore = university.fit_score ?? university.score ?? 0;
  const risk = university.risk || "Match";

  const handleAddToTracker = async () => {
    if (trackerLoading || alreadyAdded) return;

    try {
      setTrackerLoading(true);
      setTrackerMessage("");
      setTrackerError(false);

      const token = await getToken();
      const url = `${API_BASE}/applications`;

      console.log("FINAL URL =", url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          university_id: university.id,
          status: "Not Started",
        }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON response: ${text}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to add university to tracker");
      }

      setAlreadyAdded(true);
      setTrackerMessage("Added to tracker.");
    } catch (error) {
      setTrackerError(true);
      setTrackerMessage(error.message || "Something went wrong.");
    } finally {
      setTrackerLoading(false);
    }
  };

  const handleAskAI = () => {
    navigate("/chat", {
      state: {
        starterMessage: `Can you tell me about ${university.name}, its programs, requirements, and whether it matches my profile?`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:px-10">
      <div className="mx-auto max-w-[1300px]">
        <button
          onClick={() => navigate("/recommendations")}
          className="mb-8 inline-flex items-center gap-3 text-sm md:text-base text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Recommendations
        </button>

        <UniversityHeader university={university} />

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.9fr_0.9fr]">
          <div className="space-y-8">
            <ProgramDetailsSection university={university} />

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-3">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Why This Matches You
                </h2>
              </div>

              <p className="mb-8 text-base md:text-lg text-slate-500 dark:text-slate-400">
                Our AI analyzed your profile and found these key alignment points
              </p>

              <ul className="space-y-6">
                {reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-3">
                <FileText className="h-7 w-7 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Required Documents
                </h2>
              </div>

              <p className="mb-8 text-base md:text-lg text-slate-500 dark:text-slate-400">
                Checklist of documents needed for your application
              </p>

              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-[20px] bg-slate-50 px-5 py-5 dark:bg-slate-800"
                  >
                    <FileText className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                    <span className="text-base md:text-lg text-slate-700 dark:text-slate-300">{doc}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <ActionCard
              websiteUrl={university.website_url}
              onAddToTracker={handleAddToTracker}
              onAskAI={handleAskAI}
              trackerLoading={trackerLoading}
              alreadyAdded={alreadyAdded}
              trackerMessage={trackerMessage}
              trackerError={trackerError}
            />

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Risk Assessment
                </h2>
              </div>

              <div
                className={`inline-flex rounded-full border px-5 py-3 text-sm md:text-base font-medium ${getRiskStyles(
                  risk
                )}`}
              >
                {risk}
              </div>

              <p className="mt-6 text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                {risk === "Safe"
                  ? "Your profile is stronger than the minimum requirement. This is a relatively safer option."
                  : risk === "Reach"
                  ? "This option is more competitive for your current profile, but still worth considering if it strongly fits your goals."
                  : "Your profile aligns well with admitted students. You have a good chance of acceptance with a strong application."}
              </p>
            </section>

            <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 md:p-6 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="mb-6 flex items-center gap-3">
                <CalendarClock className="h-7 w-7 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Application Deadline
                </h2>
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-300">
                  {remainingDays != null ? remainingDays : "—"}
                </div>
                <div className="mt-3 text-sm md:text-base text-slate-500 dark:text-slate-400">days remaining</div>
                <div className="mt-6 text-base md:text-lg text-slate-700 dark:text-slate-300">
                  {formatDeadline(university.deadline)}
                </div>
              </div>
            </section>

            <QuickOverviewCard
              fitScore={fitScore}
              language={university.language}
              minGpa={university.min_gpa}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

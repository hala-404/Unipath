import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CirclePlus,
  FileText,
  Globe,
  GraduationCap,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Trophy,
  Users,
  DollarSign,
  Clock3,
  ExternalLink,
} from "lucide-react";

function formatTuition(university) {
  const value = university.tuition_fee;
  if (value == null || value === "") return "N/A";
  if (typeof value === "string" && value.trim()) return value;
  if (Number(value) === 0) return "Free";
  return `$${Number(value).toLocaleString()}`;
}

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

function getOptimizedImage(url, width = 1200, height = 700) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_fill,g_auto,w_${width},h_${height}/`
  );
}

export default function UniversityDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  const [university, setUniversity] = useState(state?.university || null);
  const [loading, setLoading] = useState(!state?.university);

  useEffect(() => {
    async function loadUniversity() {
      if (state?.university || !id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5050/universities/${id}`);
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

  const rawImageUrl =
    university.image_url ||
    university.image ||
    university.photo_url ||
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80";

  const imageUrl = getOptimizedImage(rawImageUrl, 1200, 700);

  const fitScore = university.fit_score ?? university.score ?? 0;
  const risk = university.risk || "Match";

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

        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative min-h-[320px] md:min-h-[380px]">
            <div
              className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
            <div className="absolute inset-0 bg-slate-950/45" />

            <div className="relative z-10 grid gap-8 p-6 md:grid-cols-[340px_1fr] md:p-8">
              <div className="overflow-hidden rounded-[28px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur">
                <img
                  src={imageUrl}
                  alt={university.name}
                  className="h-[240px] w-full object-cover md:h-[300px]"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex flex-wrap gap-3">
                    {university.world_ranking != null && (
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-sm md:text-base font-semibold text-slate-900 backdrop-blur dark:bg-slate-950/80 dark:text-slate-100">
                        <Trophy className="h-5 w-5" />
                        #{university.world_ranking} World Ranking
                      </div>
                    )}

                    <div
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm md:text-base font-medium backdrop-blur ${getRiskStyles(
                        risk
                      )}`}
                    >
                      <ShieldCheck className="h-5 w-5" />
                      {risk}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm md:text-base font-semibold text-white shadow-lg">
                      {fitScore}% fit
                    </div>
                  </div>

                  <h1 className="max-w-4xl text-3xl md:text-4xl font-bold tracking-tight text-white">
                    {university.name}
                  </h1>

                  <div className="mt-3 flex items-center gap-3 text-slate-200">
                    <MapPin className="h-5 w-5" />
                    <span className="text-base md:text-lg">
                      {university.city}, {university.country}
                    </span>
                  </div>
                </div>

                <p className="mt-6 max-w-3xl text-sm md:text-base leading-relaxed text-slate-100">
                  {university.description ||
                    `${university.name} is a strong option for students interested in ${university.program}. It offers an international academic environment, a competitive program structure, and a profile alignment based on your saved preferences.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.9fr_0.9fr]">
          <div className="space-y-8">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-3">
                <GraduationCap className="h-7 w-7 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Program Details
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <GraduationCap className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm md:text-base">Program</span>
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {university.program || "N/A"}
                  </p>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <Globe className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm md:text-base">Language</span>
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {university.language || "N/A"}
                  </p>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm md:text-base">Tuition (per year)</span>
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {formatTuition(university)}
                  </p>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <Trophy className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm md:text-base">Minimum GPA</span>
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {university.min_gpa ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm md:text-base">Acceptance Rate</span>
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {university.acceptance_rate != null
                      ? `${university.acceptance_rate}%`
                      : "N/A"}
                  </p>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-5 md:p-6 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <Trophy className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm md:text-base">World Ranking</span>
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {university.world_ranking != null
                      ? `#${university.world_ranking}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </section>

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
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-8 text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Actions
              </h2>

              <div className="space-y-4">
                {university.website_url ? (
                  <a
                    href={university.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-emerald-600 px-5 py-4 text-sm md:text-base font-medium text-white transition hover:bg-emerald-500"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Apply Now
                  </a>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-emerald-600 px-5 py-4 text-sm md:text-base font-medium text-white opacity-70"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Apply Now
                  </button>
                )}

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-slate-200 bg-white px-5 py-4 text-sm md:text-base font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <CirclePlus className="h-5 w-5" />
                  Add to Tracker
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-slate-200 bg-white px-5 py-4 text-sm md:text-base font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <MessageCircle className="h-5 w-5" />
                  Ask AI About This University
                </button>
              </div>
            </section>

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

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3">
                <Clock3 className="h-7 w-7 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Quick Overview
                </h2>
              </div>

              <div className="space-y-4 text-base md:text-lg text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
                  <span>Fit Score</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">{fitScore}%</span>
                </div>

                <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
                  <span>Language</span>
                  <span className="font-semibold">{university.language || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
                  <span>Minimum GPA</span>
                  <span className="font-semibold">{university.min_gpa ?? "N/A"}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

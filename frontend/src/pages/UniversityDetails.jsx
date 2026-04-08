import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { addApplication } from "../api/tracker";

function riskBadgeClasses(risk) {
  switch (risk) {
    case "Safe":
      return "bg-green-500/15 text-green-400 border border-green-500/20";
    case "Match":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
    case "Reach":
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    default:
      return "bg-slate-700/40 text-slate-300 border border-slate-700";
  }
}

export default function UniversityDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const uni = location.state?.university;

  if (!uni) {
    return (
      <div className="min-h-screen bg-black p-10 text-white">
        <p>University details not found.</p>
        <button
          onClick={() => navigate("/recommendations")}
          className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black"
        >
          Back
        </button>
      </div>
    );
  }

  const reasons = uni.reasons ?? [
    `Strong match with your GPA of ${uni.user_gpa ?? "your profile"}`,
    `Aligns with your interest in ${uni.program}`,
    `${uni.language}-taught program matches your preference`,
    "Excellent research opportunities in this field",
  ];

  const requiredDocuments =
    uni.required_documents ?? [
      "Transcript",
      "Personal Statement",
      "Recommendation Letters (2)",
      "CV",
      "Language Certificate",
    ];

  const fitScore = uni.fit_score ?? uni.score ?? 92;
  const ranking = uni.ranking ?? "#8 World Ranking";
  const tuition = uni.tuition ?? "CHF 1,460";
  const acceptanceRate = uni.acceptance_rate ?? "27%";
  const websiteUrl = uni.website_url || uni.website || "#";

  const daysRemaining = uni.deadline
    ? Math.ceil((new Date(uni.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  async function handleAddToTracker() {
    try {
      const token = await getToken();
      await addApplication(uni.id, token);
      alert("Added to tracker");
    } catch (error) {
      alert(error.message || "Failed to add to tracker");
    }
  }

  function handleAskAI() {
    navigate("/chat", {
      state: {
        starterMessage: `Tell me more about ${uni.name}, its ${uni.program} program, admission chances, documents, and deadlines.`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <button
          onClick={() => navigate("/recommendations")}
          className="text-xl text-slate-300 hover:text-white"
        >
          {"<- Back to Recommendations"}
        </button>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="rounded-xl bg-slate-900 px-4 py-2 text-xl text-slate-300">
              {ranking}
            </span>
            <span className={`rounded-full px-5 py-2 text-2xl ${riskBadgeClasses(uni.risk || "Match")}`}>
              {uni.risk || "Match"}
            </span>
          </div>

          <h1 className="text-7xl font-bold">{uni.name}</h1>
          <p className="text-4xl text-slate-400">
            {uni.city}, {uni.country}
          </p>

          <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-8 py-4 text-5xl font-semibold text-emerald-400">
            {fitScore}% fit
          </div>

          <p className="max-w-5xl text-3xl leading-relaxed text-slate-400">
            {uni.description ||
              `${uni.name} is one of the world's leading universities for technology and natural sciences. It offers cutting-edge research opportunities and a vibrant international community.`}
          </p>
        </div>

        <section className="rounded-[32px] border border-slate-800 bg-black p-10">
          <h2 className="mb-8 text-4xl font-bold">Program Details</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-8">
              <p className="text-2xl text-slate-400">Program</p>
              <p className="mt-2 text-4xl font-semibold">{uni.program}</p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-8">
              <p className="text-2xl text-slate-400">Language</p>
              <p className="mt-2 text-4xl font-semibold">{uni.language}</p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-8">
              <p className="text-2xl text-slate-400">Tuition (per year)</p>
              <p className="mt-2 text-4xl font-semibold">{tuition}</p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-8">
              <p className="text-2xl text-slate-400">Minimum GPA</p>
              <p className="mt-2 text-4xl font-semibold">{uni.min_gpa}</p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-8">
              <p className="text-2xl text-slate-400">Acceptance Rate</p>
              <p className="mt-2 text-4xl font-semibold">{acceptanceRate}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-black p-10">
          <h2 className="mb-3 text-4xl font-bold">Why This Matches You</h2>
          <p className="mb-8 text-2xl text-slate-400">
            Our AI analyzed your profile and found these key alignment points
          </p>

          <div className="space-y-5 text-3xl">
            {reasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-emerald-400">+</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-black p-10">
          <h2 className="mb-3 text-4xl font-bold">Required Documents</h2>
          <p className="mb-8 text-2xl text-slate-400">
            Checklist of documents needed for your application
          </p>

          <div className="space-y-5 text-3xl">
            {requiredDocuments.map((doc, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-slate-400">[doc]</span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-emerald-500/25 bg-black p-10 text-center">
          <h2 className="mb-10 text-left text-4xl font-bold">Application Deadline</h2>

          <div className="text-8xl font-bold text-emerald-400">
            {daysRemaining ?? "--"}
          </div>
          <p className="mt-3 text-4xl text-slate-400">days remaining</p>
          <p className="mt-6 text-3xl">
            {uni.deadline
              ? new Date(uni.deadline).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "No deadline available"}
          </p>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-black p-10">
          <h2 className="mb-8 text-4xl font-bold">Actions</h2>

          <div className="space-y-4">
            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-3xl bg-emerald-500 px-6 py-5 text-center text-3xl font-semibold text-black transition hover:bg-emerald-400"
            >
              Apply Now
            </a>

            <button
              onClick={handleAddToTracker}
              className="w-full rounded-3xl border border-slate-800 bg-black px-6 py-5 text-3xl text-white transition hover:border-emerald-500"
            >
              + Add to Tracker
            </button>

            <button
              onClick={handleAskAI}
              className="w-full rounded-3xl border border-slate-800 bg-black px-6 py-5 text-3xl text-white transition hover:border-emerald-500"
            >
              Ask AI About This University
            </button>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-black p-10">
          <h2 className="mb-8 text-4xl font-bold">Risk Assessment</h2>

          <span className={`inline-flex rounded-full px-5 py-2 text-2xl ${riskBadgeClasses(uni.risk || "Match")}`}>
            {uni.risk || "Match"}
          </span>

          <p className="mt-6 text-3xl text-slate-400">
            Your profile aligns well with admitted students. You have a good chance
            of acceptance with a strong application package.
          </p>
        </section>
      </div>
    </div>
  );
}

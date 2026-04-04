import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRecommendations } from "../api/recommendations";
import { addApplication } from "../api/tracker";
import { addUniversityToCompare } from "../api/compareStorage";
import { useLanguage } from "../contexts/LanguageContext";

function UniversityCard({ university, t }) {
  const navigate = useNavigate();

  async function handleAdd() {
    try {
      await addApplication(university.id);
      alert(t("recommendations.addedAlert"));
    } catch (error) {
      alert(error.message);
    }
  }

  function handleCompare() {
    try {
      const updated = addUniversityToCompare(university);

      if (updated.length === 2) {
        navigate("/compare");
      } else {
        alert("First university added. Select one more to compare.");
      }
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              {university.name}
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                university.risk_label === "Safe"
                  ? "bg-green-100 text-green-700"
                  : university.risk_label === "Match"
                  ? "bg-amber-100 text-amber-700"
                  : university.risk_label === "Reach"
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {university.risk_label}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-600">
            {university.city}, {university.country}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
          {t("recommendations.score")}: {university.score}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <p>
          <span className="font-medium">{t("recommendations.program")}:</span>{" "}
          {university.program}
        </p>
        <p>
          <span className="font-medium">{t("recommendations.language")}:</span>{" "}
          {university.language}
        </p>
        <p>
          <span className="font-medium">{t("recommendations.minGpa")}:</span>{" "}
          {university.min_gpa}
        </p>
        <p>
          <span className="font-medium">{t("recommendations.deadline")}:</span>{" "}
          {new Date(university.deadline).toLocaleDateString()}
        </p>
      </div>

      {university.fit_reasons?.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Why this recommendation fits you
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {university.fit_reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        {university.website_url && (
          <a
            href={university.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            {t("recommendations.applyNow")}
          </a>
        )}

        <button
          onClick={handleCompare}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
        >
          Compare
        </button>

        <button
          onClick={handleAdd}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t("recommendations.addToTracker")}
        </button>
      </div>
    </div>
  );
}

export default function Recommendations() {
  const { t } = useLanguage();

  const [exactMatches, setExactMatches] = useState([]);
  const [alternativeRecommendations, setAlternativeRecommendations] = useState([]);

  const allUniversities = [...exactMatches, ...alternativeRecommendations];

  const safeUniversities = allUniversities.filter(
    (u) => u.risk_label === "Safe"
  );

  const matchUniversities = allUniversities.filter(
    (u) => u.risk_label === "Match"
  );

  const reachUniversities = allUniversities.filter(
    (u) => u.risk_label === "Reach"
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const data = await fetchRecommendations();
        setExactMatches(data.exactMatches || []);
        setAlternativeRecommendations(data.alternativeRecommendations || []);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-600">{t("recommendations.loading")}</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-red-50 p-8 ring-1 ring-red-200">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t("recommendations.title")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {t("recommendations.subtitle")}
        </p>
      </div>

      {/* MATCH */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-700">
          Match Universities
        </h2>

        {matchUniversities.length > 0 ? (
          <div className="grid gap-4">
            {matchUniversities.map((uni) => (
              <UniversityCard key={uni.id} university={uni} t={t} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No match options</p>
        )}
      </section>

      {/* SAFE */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-green-700">
          Safe Universities
        </h2>

        {safeUniversities.length > 0 ? (
          <div className="grid gap-4">
            {safeUniversities.map((uni) => (
              <UniversityCard key={uni.id} university={uni} t={t} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No safe options</p>
        )}
      </section>

      {/* REACH */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-red-700">
          Reach Universities
        </h2>

        {reachUniversities.length > 0 ? (
          <div className="grid gap-4">
            {reachUniversities.map((uni) => (
              <UniversityCard key={uni.id} university={uni} t={t} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No reach options</p>
        )}
      </section>
    </div>
  );
}

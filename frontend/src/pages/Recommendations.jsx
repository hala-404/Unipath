import { useEffect, useState } from "react";
import { fetchRecommendations } from "../api/recommendations";
import { addApplication } from "../api/tracker";
import { useLanguage } from "../contexts/LanguageContext";

function UniversityCard({ university, t }) {
  async function handleAdd() {
    try {
      await addApplication(university.id);
      alert(t("recommendations.addedAlert"));
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {university.name}
          </h3>
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

      {/* Exact Matches */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">
          {t("recommendations.exactTitle")}
        </h2>

        {exactMatches.length > 0 ? (
          <div className="grid gap-4">
            {exactMatches.map((uni) => (
              <UniversityCard key={uni.id} university={uni} t={t} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t("recommendations.noExact")}</p>
        )}
      </section>

      {/* Alternative Recommendations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">
          {t("recommendations.altTitle")}
        </h2>

        {alternativeRecommendations.length > 0 ? (
          <div className="grid gap-4">
            {alternativeRecommendations.map((uni) => (
              <UniversityCard key={uni.id} university={uni} t={t} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t("recommendations.noAlt")}</p>
        )}
      </section>
    </div>
  );
}

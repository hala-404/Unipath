import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const token = localStorage.getItem("token");

  return (
    <div className="space-y-16">
      <section className="flex min-h-[70vh] items-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-12">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">
            {t("home.badge")}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {t("home.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
            {t("home.subtitle")}
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              to={token ? "/recommendations" : "/register"}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {t("home.getStarted")}
            </Link>

            <a
              href="#features"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {t("home.viewFeatures")}
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-6 scroll-mt-24">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
            {t("home.featuresLabel")}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {t("home.featuresTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            {t("home.featuresSubtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("home.feature1Title")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t("home.feature1Desc")}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("home.feature2Title")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t("home.feature2Desc")}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("home.feature3Title")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t("home.feature3Desc")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

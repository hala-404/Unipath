import { Link } from "react-router-dom";

export default function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="space-y-16">
      <section className="flex min-h-[70vh] items-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-12">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">
            UniPath
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            AI-Based University Application Support System
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
            A smart platform to search universities, get personalized recommendations,
            and track application progress in one place.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              to={token ? "/recommendations" : "/register"}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Started
            </Link>

            <a
              href="#features"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View Features
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-6 scroll-mt-24">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
            Features
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Everything students need in one place
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            UniPath helps students manage university search, recommendations,
            and applications through one clean interface.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Profile Preferences</h2>
            <p className="mt-2 text-sm text-slate-600">
              Store GPA, city, program, and language preferences for personalized recommendations.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Smart Recommendations</h2>
            <p className="mt-2 text-sm text-slate-600">
              Discover exact matches and alternative recommendations based on your profile.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Application Tracker</h2>
            <p className="mt-2 text-sm text-slate-600">
              Save universities, update statuses, and manage your application journey clearly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
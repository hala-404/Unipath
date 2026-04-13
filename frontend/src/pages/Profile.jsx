import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { fetchProfile, updateProfile } from "../api/profile";

export default function Profile() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    gpa: "",
    preferred_city: "",
    preferred_country: "",
    preferred_program: "",
    preferred_language: "",
    max_tuition: "",
    reminders_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const data = await fetchProfile(token);

        setFormData({
          full_name: data.full_name ?? "",
          gpa: data.gpa ?? "",
          preferred_city: data.preferred_city ?? "",
          preferred_country: data.preferred_country ?? "",
          preferred_program: data.preferred_program ?? "",
          preferred_language: data.preferred_language ?? "",
          max_tuition: data.max_tuition ?? "",
          reminders_enabled: data.reminders_enabled ?? true,
        });
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [getToken, isLoaded, isSignedIn]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");
    setValidationError("");

    try {
      let parsedGpa = null;
      if (formData.gpa !== "") {
        parsedGpa = Number(formData.gpa);

        if (Number.isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 4) {
          setValidationError("GPA must be between 0 and 4.");
          setSaving(false);
          return;
        }
      }

      let parsedMaxTuition = null;
      if (formData.max_tuition !== "") {
        parsedMaxTuition = Number(formData.max_tuition);

        if (Number.isNaN(parsedMaxTuition) || parsedMaxTuition < 0) {
          setValidationError("Maximum tuition must be 0 or more.");
          setSaving(false);
          return;
        }
      }

      const token = await getToken();

      const result = await updateProfile(
        {
          full_name: formData.full_name,
          gpa: formData.gpa === "" ? undefined : Number(formData.gpa),
          preferred_country: formData.preferred_country,
          preferred_city: formData.preferred_city,
          preferred_program: formData.preferred_program,
          preferred_language: formData.preferred_language,
          max_tuition: formData.max_tuition === "" ? undefined : Number(formData.max_tuition),
          reminders_enabled: Boolean(formData.reminders_enabled),
        },
        token
      );

      setFormData({
        full_name: result.profile?.full_name ?? "",
        gpa: result.profile?.gpa ?? "",
        preferred_city: result.profile?.preferred_city ?? "",
        preferred_country: result.profile?.preferred_country ?? "",
        preferred_program: result.profile?.preferred_program ?? "",
        preferred_language: result.profile?.preferred_language ?? "",
        max_tuition: result.profile?.max_tuition ?? "",
        reminders_enabled: result.profile?.reminders_enabled ?? true,
      });

      setMessage(result.message || "Profile updated successfully");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-700 dark:bg-slate-950 dark:text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Profile & Preferences
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Keep your profile updated to get the most accurate university recommendations.
            The more we know about you, the better we can match you.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Profile Completion</h2>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full w-[100%] rounded-full bg-emerald-600" />
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Your profile is complete. You&apos;ll get the best recommendations.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-emerald-600">100%</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">complete</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Personal Information</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Basic information about you</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Preferred Country
                  </label>
                  <input
                    type="text"
                    name="preferred_country"
                    value={formData.preferred_country}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Any"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Academic Profile</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your academic background</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    GPA (on 4.0 scale)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="3.6"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Preferred Program
                  </label>
                  <input
                    type="text"
                    name="preferred_program"
                    value={formData.preferred_program}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Computer Science"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Location Preferences</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Where would you like to study?</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Preferred City / Region
                  </label>
                  <input
                    type="text"
                    name="preferred_city"
                    value={formData.preferred_city}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Any"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Preferred Language
                  </label>
                  <input
                    type="text"
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="English"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Budget & Financial</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your financial preferences</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Annual Budget (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="max_tuition"
                    value={formData.max_tuition}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="30000"
                  />
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Maximum amount you can spend per year on tuition
                  </p>
                </div>

                <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">Enable reminders</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Show reminder support for important deadlines
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="reminders_enabled"
                    checked={formData.reminders_enabled}
                    onChange={handleChange}
                    className="h-5 w-5 accent-emerald-600"
                  />
                </label>
              </div>
            </section>
          </div>

          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
              {message}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              {errorMessage}
            </div>
          ) : null}

          {validationError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
              {validationError}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

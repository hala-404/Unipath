import { useEffect, useState } from "react";
import { fetchProfile, updateProfile } from "../api/profile";
import { useLanguage } from "../contexts/LanguageContext";

export default function Profile() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    gpa: "",
    preferred_city: "",
    preferred_program: "",
    preferred_language: "",
    reminders_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfile();

        setFormData({
          gpa: data.gpa ?? "",
          preferred_city: data.preferred_city ?? "",
          preferred_program: data.preferred_program ?? "",
          preferred_language: data.preferred_language ?? "",
          reminders_enabled: data.reminders_enabled ?? true,
        });
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const result = await updateProfile({
        gpa: formData.gpa === "" ? null : Number(formData.gpa),
        preferred_city: formData.preferred_city,
        preferred_program: formData.preferred_program,
        preferred_language: formData.preferred_language,
        reminders_enabled: formData.reminders_enabled,
      });

      setMessage(result.message || "Profile updated successfully");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-600">{t("profile.loading")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-bold text-slate-900">{t("profile.title")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("profile.subtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t("profile.gpaLabel")}
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="4"
            name="gpa"
            value={formData.gpa}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder={t("profile.gpaPlaceholder")}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t("profile.cityLabel")}
          </label>
          <input
            type="text"
            name="preferred_city"
            value={formData.preferred_city}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder={t("profile.cityPlaceholder")}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t("profile.programLabel")}
          </label>
          <input
            type="text"
            name="preferred_program"
            value={formData.preferred_program}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder={t("profile.programPlaceholder")}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t("profile.languageLabel")}
          </label>
          <input
            type="text"
            name="preferred_language"
            value={formData.preferred_language}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder={t("profile.languagePlaceholder")}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <div>
            <p className="font-medium text-slate-900">{t("profile.remindersTitle")}</p>
            <p className="text-sm text-slate-500">{t("profile.remindersDesc")}</p>
          </div>

          <input
            type="checkbox"
            checked={formData.reminders_enabled}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                reminders_enabled: e.target.checked,
              }))
            }
            className="h-5 w-5 accent-blue-600"
          />
        </div>

        {message ? (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? t("profile.submitting") : t("profile.submit")}
        </button>
      </form>
    </div>
  );
}

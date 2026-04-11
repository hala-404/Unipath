import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { fetchProfile, updateProfile } from "../api/profile";

export default function Profile() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [formData, setFormData] = useState({
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
          gpa: formData.gpa === "" ? null : Number(formData.gpa),
          preferred_city:
            formData.preferred_city.trim() === "" ? null : formData.preferred_city.trim(),
          preferred_country:
            formData.preferred_country.trim() === "" ? null : formData.preferred_country.trim(),
          preferred_program:
            formData.preferred_program.trim() === "" ? null : formData.preferred_program.trim(),
          preferred_language:
            formData.preferred_language.trim() === "" ? null : formData.preferred_language.trim(),
          max_tuition:
            formData.max_tuition === "" ? null : Number(formData.max_tuition),
          reminders_enabled: formData.reminders_enabled,
        },
        token
      );

      setFormData({
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
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-700">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Profile Preferences</h1>
        <p className="mt-2 text-slate-600">
          Manage the profile details used for your recommendations.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">GPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Optional, e.g. 3.6"
            />
            <p className="mt-1 text-sm text-slate-500">
              Optional. Leave empty to include universities with any GPA requirement.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Preferred City</label>
            <input
              type="text"
              name="preferred_city"
              value={formData.preferred_city}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Optional, enter any city"
            />
            <p className="mt-1 text-sm text-slate-500">
              Optional. Leave empty to include universities in any city.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Country</label>
            <input
              type="text"
              name="preferred_country"
              value={formData.preferred_country}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Optional, enter any country"
            />
            <p className="mt-1 text-sm text-slate-500">
              Optional. Leave empty to include universities in any country.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Program</label>
            <input
              type="text"
              name="preferred_program"
              value={formData.preferred_program}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Optional, enter any program"
            />
            <p className="mt-1 text-sm text-slate-500">
              Optional. Leave empty to include any program.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Language</label>
            <input
              type="text"
              name="preferred_language"
              value={formData.preferred_language}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Optional, enter any language"
            />
            <p className="mt-1 text-sm text-slate-500">
              Optional. Leave empty to include any language.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Maximum Tuition Per Year
            </label>
            <input
              type="number"
              min="0"
              name="max_tuition"
              value={formData.max_tuition}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Optional, e.g. 30000"
            />
            <p className="mt-1 text-sm text-slate-500">
              Optional. Leave empty to include universities with any tuition.
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              name="reminders_enabled"
              checked={formData.reminders_enabled}
              onChange={handleChange}
              className="h-5 w-5 accent-emerald-600"
            />
            <div>
              <p className="font-medium text-slate-800">Enable reminders</p>
              <p className="text-sm text-slate-500">
                Show reminder support for important deadlines.
              </p>
            </div>
          </label>

          {message ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              {message}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {validationError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
              {validationError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      </div>
    </div>
  );
}

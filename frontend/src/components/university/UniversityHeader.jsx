import { MapPin, ShieldCheck, Trophy } from "lucide-react";

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

function getOptimizedImage(url, width = 1200, height = 700) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_fill,g_auto,w_${width},h_${height}/`
  );
}

export default function UniversityHeader({ university }) {
  const rawImageUrl =
    university.image_url ||
    university.image ||
    university.photo_url ||
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80";

  const imageUrl = getOptimizedImage(rawImageUrl, 1200, 700);
  const fitScore = university.fit_score ?? university.score ?? 0;
  const risk = university.risk || "Match";

  return (
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
  );
}
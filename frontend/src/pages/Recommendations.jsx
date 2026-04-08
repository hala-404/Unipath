import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { fetchRecommendations } from "../api/recommendations";
import UniversityRecommendationCard from "../components/UniversityRecommendationCard";

export default function Recommendations() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRecommendations() {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const data = await fetchRecommendations(token);
        const exactMatches = data.exactMatches || [];
        const alternativeRecommendations = data.alternativeRecommendations || [];
        setRecommendations([...exactMatches, ...alternativeRecommendations]);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [getToken, isLoaded, isSignedIn]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-600">Loading recommendations...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-emerald-500/25 bg-black p-8 text-white shadow-[0_0_0_1px_rgba(16,185,129,0.05)]">
        <h1 className="text-4xl font-bold text-emerald-400">Recommendations</h1>
        <p className="mt-3 text-lg text-slate-300">
          View personalized university matches and open each one to see full details.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">
            No recommendations available for your current profile.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((uni) => (
            <UniversityRecommendationCard key={uni.id} uni={uni} />
          ))}
        </div>
      )}
    </div>
  );
}
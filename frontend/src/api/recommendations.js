import { API_BASE_URL } from "./config";

export async function fetchRecommendations() {
  const response = await fetch(`${API_BASE_URL}/universities/recommendations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load recommendations");
  }

  return data;
}
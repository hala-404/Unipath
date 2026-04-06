const API_URL = import.meta.env.VITE_API_URL;

export async function fetchRecommendations(token) {
  const response = await fetch(`${API_URL}/universities/recommendations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load recommendations");
  }

  return data;
}
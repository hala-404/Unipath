import { API_BASE_URL } from "./config";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchRecommendations() {
  const response = await fetch(`${API_BASE_URL}/universities/recommendations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load recommendations");
  }

  return data;
}
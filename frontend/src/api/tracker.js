import { API_BASE_URL } from "./config";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchApplications() {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load applications");
  }

  return data;
}

export async function updateApplicationStatus(applicationId, status) {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update application");
  }

  return data;
}

export async function deleteApplication(applicationId) {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete application");
  }

  return data;
}
export async function addApplication(universityId) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5050/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      university_id: universityId,
      status: "Not Started",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to add application");
  }

  return data;
}
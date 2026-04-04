const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchApplications() {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch applications");
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
    throw new Error(data.error || "Failed to update application status");
  }

  return data;
}

export async function updateApplicationChecklist(applicationId, checklist) {
  const response = await fetch(
    `${API_BASE_URL}/applications/${applicationId}/checklist`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ checklist }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update checklist");
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
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: getAuthHeaders(),
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
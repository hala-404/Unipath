const API_URL = import.meta.env.VITE_API_URL;

async function makeRequest(endpoint, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    const text = await response.text();
    throw new Error(text || "Invalid server response");
  }

  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

export async function fetchApplications(token) {
  return makeRequest("/applications", { method: "GET" }, token);
}

export async function updateApplicationStatus(applicationId, status, token) {
  return makeRequest(`/applications/${applicationId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  }, token);
}

export async function updateApplicationChecklist(applicationId, checklist, token) {
  return makeRequest(`/applications/${applicationId}/checklist`, {
    method: "PUT",
    body: JSON.stringify({ checklist }),
  }, token);
}

export async function deleteApplication(applicationId, token) {
  return makeRequest(`/applications/${applicationId}`, {
    method: "DELETE",
  }, token);
}

export async function addApplication(universityId, token) {
  return makeRequest("/applications", {
    method: "POST",
    body: JSON.stringify({
      university_id: universityId,
      status: "Not Started",
    }),
  }, token);
}
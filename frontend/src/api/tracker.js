const API_URL = import.meta.env.VITE_API_URL;

export async function fetchApplications() {
  const response = await fetch(`${API_URL}/applications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load applications");
  }

  return data;
}

export async function updateApplicationStatus(applicationId, status) {
  const response = await fetch(`${API_URL}/applications/${applicationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update application");
  }

  return data;
}

export async function updateApplicationChecklist(applicationId, checklist) {
  const response = await fetch(`${API_URL}/applications/${applicationId}/checklist`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ checklist }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update checklist");
  }

  return data;
}

export async function deleteApplication(applicationId) {
  const response = await fetch(`${API_URL}/applications/${applicationId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete application");
  }

  return data;
}

export async function addApplication(universityId) {
  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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
const STORAGE_KEY = "unipath_compare";

export function getComparedUniversities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveComparedUniversities(universities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(universities));
}

export function isUniversityCompared(id) {
  return getComparedUniversities().some((uni) => uni.id === id);
}

export function addUniversityToCompare(university) {
  const current = getComparedUniversities();

  if (current.some((uni) => uni.id === university.id)) {
    return { success: false, reason: "already_exists", items: current };
  }

  if (current.length >= 3) {
    return { success: false, reason: "max_reached", items: current };
  }

  const updated = [...current, university];
  saveComparedUniversities(updated);

  return { success: true, reason: "added", items: updated };
}

export function removeUniversityFromCompare(id) {
  const updated = getComparedUniversities().filter((uni) => uni.id !== id);
  saveComparedUniversities(updated);
  return updated;
}

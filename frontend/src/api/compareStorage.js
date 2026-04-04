const STORAGE_KEY = "unipath_compare";

export function getComparedUniversities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveComparedUniversities(universities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(universities));
}

export function addUniversityToCompare(university) {
  const current = getComparedUniversities();

  const exists = current.some((item) => item.id === university.id);
  if (exists) return current;

  if (current.length >= 2) {
    throw new Error("You can compare up to 2 universities only.");
  }

  const updated = [...current, university];
  saveComparedUniversities(updated);
  return updated;
}

export function removeUniversityFromCompare(universityId) {
  const current = getComparedUniversities();
  const updated = current.filter((item) => item.id !== universityId);
  saveComparedUniversities(updated);
  return updated;
}

export function clearComparedUniversities() {
  localStorage.removeItem(STORAGE_KEY);
}

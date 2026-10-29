export type DepartmentColor = {
  color: string;
  cardColor: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
};

type DepartmentPaletteColor = DepartmentColor & {
  id: string;
};

const storageKey = "hr-anomaly.department-color-assignments.v1";

const emptyDepartmentColor: DepartmentColor = {
  color: "hsl(220, 9%, 46%)",
  cardColor: "hsl(220, 13%, 35%)",
  backgroundColor: "hsl(220, 14%, 96%)",
  borderColor: "hsl(220, 13%, 91%)",
  textColor: "hsl(220, 9%, 25%)",
};

const departmentPalette: DepartmentPaletteColor[] = [
  { id: "blue", color: "#2563eb", cardColor: "#1d4ed8", backgroundColor: "#eff6ff", borderColor: "#bfdbfe", textColor: "#1e3a8a" },
  { id: "green", color: "#16a34a", cardColor: "#15803d", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", textColor: "#166534" },
  { id: "violet", color: "#7c3aed", cardColor: "#6d28d9", backgroundColor: "#f5f3ff", borderColor: "#ddd6fe", textColor: "#5b21b6" },
  { id: "orange", color: "#ea580c", cardColor: "#c2410c", backgroundColor: "#fff7ed", borderColor: "#fed7aa", textColor: "#9a3412" },
  { id: "cyan", color: "#0891b2", cardColor: "#0e7490", backgroundColor: "#ecfeff", borderColor: "#a5f3fc", textColor: "#155e75" },
  { id: "pink", color: "#db2777", cardColor: "#be185d", backgroundColor: "#fdf2f8", borderColor: "#fbcfe8", textColor: "#9d174d" },
  { id: "lime", color: "#65a30d", cardColor: "#4d7c0f", backgroundColor: "#f7fee7", borderColor: "#d9f99d", textColor: "#3f6212" },
  { id: "red", color: "#dc2626", cardColor: "#b91c1c", backgroundColor: "#fef2f2", borderColor: "#fecaca", textColor: "#991b1b" },
  { id: "indigo", color: "#4f46e5", cardColor: "#4338ca", backgroundColor: "#eef2ff", borderColor: "#c7d2fe", textColor: "#3730a3" },
  { id: "teal", color: "#0d9488", cardColor: "#0f766e", backgroundColor: "#f0fdfa", borderColor: "#99f6e4", textColor: "#115e59" },
  { id: "amber", color: "#d97706", cardColor: "#b45309", backgroundColor: "#fffbeb", borderColor: "#fde68a", textColor: "#92400e" },
  { id: "fuchsia", color: "#c026d3", cardColor: "#a21caf", backgroundColor: "#fdf4ff", borderColor: "#f5d0fe", textColor: "#86198f" },
  { id: "sky", color: "#0284c7", cardColor: "#0369a1", backgroundColor: "#f0f9ff", borderColor: "#bae6fd", textColor: "#075985" },
  { id: "emerald", color: "#059669", cardColor: "#047857", backgroundColor: "#ecfdf5", borderColor: "#a7f3d0", textColor: "#065f46" },
  { id: "rose", color: "#e11d48", cardColor: "#be123c", backgroundColor: "#fff1f2", borderColor: "#fecdd3", textColor: "#9f1239" },
  { id: "purple", color: "#9333ea", cardColor: "#7e22ce", backgroundColor: "#faf5ff", borderColor: "#e9d5ff", textColor: "#6b21a8" },
  { id: "yellow", color: "#ca8a04", cardColor: "#a16207", backgroundColor: "#fefce8", borderColor: "#fef08a", textColor: "#854d0e" },
  { id: "slate", color: "#475569", cardColor: "#334155", backgroundColor: "#f8fafc", borderColor: "#cbd5e1", textColor: "#334155" },
];

function normalizeDepartmentName(department: string) {
  return department.trim().toLocaleLowerCase("fr-FR");
}

function readAssignments(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawAssignments = window.localStorage.getItem(storageKey);
    return rawAssignments ? JSON.parse(rawAssignments) : {};
  } catch {
    return {};
  }
}

function writeAssignments(assignments: Record<string, string>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(assignments));
  } catch {
    // The visual fallback still works if storage is unavailable.
  }
}

function findPaletteColor(colorId: string | undefined) {
  return departmentPalette.find((color) => color.id === colorId);
}

function pickAvailableColor(assignments: Record<string, string>) {
  const usedColorIds = new Set(Object.values(assignments));
  return departmentPalette.find((color) => !usedColorIds.has(color.id)) ?? departmentPalette[Object.keys(assignments).length % departmentPalette.length];
}

export function getDepartmentColor(department: string | null | undefined): DepartmentColor {
  const normalized = normalizeDepartmentName(department ?? "");

  if (!normalized) {
    return emptyDepartmentColor;
  }

  const assignments = readAssignments();
  const assignedColor = findPaletteColor(assignments[normalized]);

  if (assignedColor) {
    return assignedColor;
  }

  const nextColor = pickAvailableColor(assignments);
  writeAssignments({ ...assignments, [normalized]: nextColor.id });

  return nextColor;
}

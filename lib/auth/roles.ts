export const USER_ROLES = [
  "patient",
  "doctor",
  "admin",
  "reception",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Role z dostępem do Portalu Lekarza / EDM */
export const DOCTOR_PORTAL_ROLES: UserRole[] = [
  "doctor",
  "admin",
  "reception",
];

export function isDoctorPortalRole(
  role: string | undefined | null
): role is "doctor" | "admin" | "reception" {
  return (
    role === "doctor" || role === "admin" || role === "reception"
  );
}

export function isPatientRole(role: string | undefined | null): boolean {
  return !role || role === "patient";
}

export function defaultHomeForRole(role: UserRole | string | undefined): string {
  if (isDoctorPortalRole(role)) return "/doctor";
  return "/portal";
}

export function roleLabel(role: UserRole | string | undefined): string {
  switch (role) {
    case "doctor":
      return "Lekarz";
    case "admin":
      return "Administrator";
    case "reception":
      return "Rejestracja";
    case "patient":
      return "Pacjent";
    default:
      return "Użytkownik";
  }
}

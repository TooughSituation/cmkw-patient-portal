export const USER_ROLES = [
  "patient",
  "doctor",
  "admin",
  "reception",
  "facility",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Role z dostępem do Portalu Lekarza / EDM */
export const DOCTOR_PORTAL_ROLES: UserRole[] = [
  "doctor",
  "admin",
  "reception",
  "facility",
];

export function isDoctorPortalRole(
  role: string | undefined | null
): role is "doctor" | "admin" | "reception" | "facility" {
  return (
    role === "doctor" ||
    role === "admin" ||
    role === "reception" ||
    role === "facility"
  );
}

export function isPatientRole(role: string | undefined | null): boolean {
  return !role || role === "patient";
}

/** Konto placówki — widzi całość */
export function isFacilityRole(role: string | undefined | null): boolean {
  return role === "facility";
}

/**
 * Widok całej placówki (bez izolacji lekarza):
 * facility, admin, reception.
 * Zwykły `doctor` jest izolowany.
 */
export function canSeeAllDoctors(role: string | undefined | null): boolean {
  return role === "facility" || role === "admin" || role === "reception";
}

/** Ustawienia placówki / admin panel */
export function canAccessFacilityAdmin(
  role: string | undefined | null
): boolean {
  return role === "facility" || role === "admin" || role === "reception";
}

/** Zarządzanie udostępnianiem kalendarzy — placówka + admin */
export function canManageCalendarSharing(
  role: string | undefined | null
): boolean {
  return role === "facility" || role === "admin";
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
    case "facility":
      return "Placówka";
    case "patient":
      return "Pacjent";
    default:
      return "Użytkownik";
  }
}

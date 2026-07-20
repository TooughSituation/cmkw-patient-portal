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
 * Widok multi-lekarz (bez izolacji do własnego doctorId):
 * - `facility` — pełna placówka + przełącznik lekarzy
 * - `reception` — operacyjnie widzi wszystkich (bez izolacji)
 *
 * `doctor` oraz `admin` z kontem lekarza (doctorId) są izolowani
 * do własnego kalendarza (+ jawne udostępnienia).
 */
export function canSeeAllDoctors(
  role: string | undefined | null,
  doctorId?: string | null
): boolean {
  if (role === "facility" || role === "reception") return true;
  // Admin bez doctorId (czyste konto admin) — widok placówki
  if (role === "admin" && !doctorId) return true;
  return false;
}

/** Indywidualny klinicysta (własny kalendarz) */
export function isIndividualClinician(
  role: string | undefined | null,
  doctorId?: string | null
): boolean {
  if (!doctorId) return false;
  return role === "doctor" || role === "admin";
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

export type DoctorNavItem = {
  href: string;
  label: string;
  /** Etap 6+ – placeholder */
  disabled?: boolean;
};

export const DOCTOR_NAV: DoctorNavItem[] = [
  { href: "/doctor", label: "Kalendarz" },
  { href: "/doctor/terminy", label: "Terminy" },
  { href: "/doctor/wizyty", label: "Wizyty" },
  { href: "/doctor/pacjenci", label: "Pacjenci" },
  { href: "/doctor/leki", label: "Leki" },
  { href: "/doctor/icd10", label: "ICD-10" },
  { href: "/doctor/kalkulatory", label: "Kalkulatory" },
  { href: "/doctor/przewodnik", label: "Przewodnik" },
  { href: "/doctor/admin", label: "Admin" },
];

/** data-tour id dla pozycji menu */
export function doctorNavTourId(href: string): string {
  if (href === "/doctor") return "doctor-nav-kalendarz";
  if (href === "/doctor/terminy") return "doctor-nav-terminy";
  if (href === "/doctor/wizyty") return "doctor-nav-wizyty";
  if (href === "/doctor/pacjenci") return "doctor-nav-pacjenci";
  if (href === "/doctor/leki") return "doctor-nav-leki";
  if (href === "/doctor/icd10") return "doctor-nav-icd";
  if (href === "/doctor/kalkulatory") return "doctor-nav-kalkulatory";
  if (href === "/doctor/przewodnik") return "doctor-nav-przewodnik";
  if (href === "/doctor/admin") return "doctor-nav-admin";
  return "doctor-nav";
}

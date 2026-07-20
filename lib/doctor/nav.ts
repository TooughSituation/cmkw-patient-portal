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
  { href: "/doctor/admin", label: "Admin" },
];

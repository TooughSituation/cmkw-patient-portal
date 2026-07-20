export type DoctorNavItem = {
  href: string;
  label: string;
  /** Etap 4+ – placeholder */
  disabled?: boolean;
};

export const DOCTOR_NAV: DoctorNavItem[] = [
  { href: "/doctor", label: "Kalendarz" },
  { href: "/doctor/wizyty", label: "Wizyty" },
  { href: "/doctor/pacjenci", label: "Pacjenci" },
  { href: "/doctor/leki", label: "Leki" },
  { href: "/doctor/icd10", label: "ICD-10" },
  { href: "/doctor/kalkulatory", label: "Kalkulatory" },
  { href: "/doctor/inne", label: "Inne", disabled: true },
];

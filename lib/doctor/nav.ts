export type DoctorNavItem = {
  href: string;
  label: string;
  /** Etap 3+ – placeholder */
  disabled?: boolean;
};

export const DOCTOR_NAV: DoctorNavItem[] = [
  { href: "/doctor", label: "Kalendarz" },
  { href: "/doctor/wizyty", label: "Wizyty" },
  { href: "/doctor/pacjenci", label: "Pacjenci" },
  { href: "/doctor/baza-lekow", label: "Baza leków", disabled: true },
  { href: "/doctor/kalkulatory", label: "Kalkulatory", disabled: true },
  { href: "/doctor/icd-10", label: "ICD-10", disabled: true },
  { href: "/doctor/inne", label: "Inne", disabled: true },
];

export type VisitStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed";

export type VisitType =
  | "konsultacja"
  | "kontrolna"
  | "zabieg"
  | "rehabilitacja"
  | "pilna";

export type PatientGroup =
  | "VIP"
  | "NFZ"
  | "Prywatny"
  | "Sport"
  | "Pooperacyjny"
  | "Nowy";

export type PatientSex = "K" | "M";

export type PatientStatus = "active" | "inactive" | "archived";

export type DoctorPatient = {
  id: string;
  firstName: string;
  lastName: string;
  pesel: string;
  /** yyyy-MM-dd */
  birthDate: string;
  sex: PatientSex;
  phone: string;
  email: string;
  street: string;
  buildingNo: string;
  apartmentNo: string;
  postalCode: string;
  city: string;
  /** Numer karty wewnętrznej (np. CMKW-0001) */
  cardNumber: string;
  groups: PatientGroup[];
  notes: string;
  rodConsent: boolean;
  rodConsentAt?: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
};

export type DoctorVisit = {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  /** HH:mm */
  time: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientPesel: string;
  patientGroups: PatientGroup[];
  doctorId: string;
  doctorName: string;
  status: VisitStatus;
  type: VisitType;
  note: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
};

export type Department = {
  id: string;
  name: string;
  shortName: string;
};

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  scheduled: "Zaplanowana",
  confirmed: "Potwierdzona",
  cancelled: "Odwołana",
  completed: "Zakończona",
};

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  konsultacja: "Konsultacja",
  kontrolna: "Kontrolna",
  zabieg: "Zabieg",
  rehabilitacja: "Rehabilitacja",
  pilna: "Pilna",
};

export const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  active: "Aktywny",
  inactive: "Nieaktywny",
  archived: "Zarchiwizowany",
};

export const PATIENT_GROUP_OPTIONS: PatientGroup[] = [
  "VIP",
  "NFZ",
  "Prywatny",
  "Sport",
  "Pooperacyjny",
  "Nowy",
];

export const PATIENT_SEX_LABELS: Record<PatientSex, string> = {
  K: "Kobieta",
  M: "Mężczyzna",
};

export function patientFullName(
  p: Pick<DoctorPatient, "firstName" | "lastName"> | DoctorVisit
): string {
  if ("patientFirstName" in p) {
    return `${p.patientFirstName} ${p.patientLastName}`;
  }
  return `${p.firstName} ${p.lastName}`;
}

/** Re-export maski PESEL z lib/pesel (spójność w EDM). */
export { maskPesel } from "@/lib/pesel";

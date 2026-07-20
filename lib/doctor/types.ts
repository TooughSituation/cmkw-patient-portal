export type VisitStatus =
  | "scheduled"
  | "confirmed"
  | "teleconfirmed"
  | "in_progress"
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

export type VisitDiagnosis = {
  code: string;
  namePl: string;
  description: string;
};

export type VisitPrescription = {
  id: string;
  drugId: string;
  drugName: string;
  inn: string;
  dosage: string;
  duration: string;
  notes: string;
};

export type VisitReferral = {
  id: string;
  title: string;
  type: string;
  notes: string;
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
  /** Krótka notatka na liście / szybka wizyta */
  note: string;
  /** Pełny wywiad / notatka lekarska */
  medicalNote: string;
  diagnoses: VisitDiagnosis[];
  prescriptions: VisitPrescription[];
  referrals: VisitReferral[];
  /** ID dokumentów w magazynie documents */
  documentIds: string[];
  /** Wymaga telepotwierdzenia (SMS/telefon) */
  needsTeleconfirm: boolean;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentType =
  | "skierowanie"
  | "wynik"
  | "zgoda"
  | "recepta"
  | "inne";

export type DoctorDocument = {
  id: string;
  name: string;
  type: DocumentType;
  /** patient | visit */
  scope: "patient" | "visit";
  patientId: string;
  visitId?: string;
  /** mock: data URL or placeholder text */
  content: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  createdBy: string;
};

export type Department = {
  id: string;
  name: string;
  shortName: string;
};

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  scheduled: "Zaplanowana",
  confirmed: "Potwierdzona",
  teleconfirmed: "Telepotwierdzona",
  in_progress: "W trakcie",
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

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  skierowanie: "Skierowanie",
  wynik: "Wynik badań",
  zgoda: "Zgoda",
  recepta: "Recepta",
  inne: "Inne",
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

export function emptyVisitClinical(): Pick<
  DoctorVisit,
  | "medicalNote"
  | "diagnoses"
  | "prescriptions"
  | "referrals"
  | "documentIds"
  | "needsTeleconfirm"
> {
  return {
    medicalNote: "",
    diagnoses: [],
    prescriptions: [],
    referrals: [],
    documentIds: [],
    needsTeleconfirm: false,
  };
}

/** Re-export maski PESEL z lib/pesel (spójność w EDM). */
export { maskPesel } from "@/lib/pesel";

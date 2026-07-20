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

export type DoctorVisit = {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  /** HH:mm */
  time: string;
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

export function maskPesel(pesel: string): string {
  if (pesel.length >= 6) return `${pesel.slice(0, 6)}*****`;
  return "***********";
}

export function patientFullName(v: DoctorVisit): string {
  return `${v.patientFirstName} ${v.patientLastName}`;
}

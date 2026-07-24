/**
 * e-Recepta / e-Skierowanie — typy P1-ready (mock).
 * Etap 12–13: formularze, szablony, audyt, payload pod przyszłe API CeZ/P1.
 */

export type EDocumentStatus = "issued" | "cancelled";

export type EPrescriptionKind = "30_days" | "annual";

export type EReferralUrgency = "normal" | "urgent";

export type EPrescriptionItem = {
  id: string;
  drugId: string;
  drugName: string;
  inn: string;
  form: string;
  strength: string;
  dosage: string;
  quantity: string;
  duration: string;
  frequency: string;
  notes: string;
};

/** Wpis audytu (wystawienie / edycja / anulowanie / SMS) */
export type EAuditAction =
  | "issued"
  | "updated"
  | "cancelled"
  | "sms_sent"
  | "template_applied";

export type EAuditEntry = {
  id: string;
  at: string;
  action: EAuditAction;
  actorUserId: string;
  actorName: string;
  actorRole: string;
  summary: string;
};

export type EPrescription = {
  id: string;
  /** Mock numer e-recepty: XXXX-XXXX-XXXX */
  number: string;
  accessCode: string;
  status: EDocumentStatus;
  kind: EPrescriptionKind;
  visitId: string;
  patientId: string;
  patientName: string;
  patientPesel: string;
  doctorId: string;
  doctorName: string;
  doctorPwz: string;
  items: EPrescriptionItem[];
  generalNotes: string;
  issuedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
  smsSentAt?: string;
  p1Ready: boolean;
  auditLog: EAuditEntry[];
  createdAt: string;
  updatedAt: string;
};

export type EReferral = {
  id: string;
  number: string;
  accessCode: string;
  status: EDocumentStatus;
  visitId: string;
  patientId: string;
  patientName: string;
  patientPesel: string;
  doctorId: string;
  doctorName: string;
  doctorPwz: string;
  examCategory: string;
  examType: string;
  justification: string;
  urgency: EReferralUrgency;
  targetFacility: string;
  icdCode: string;
  issuedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
  p1Ready: boolean;
  auditLog: EAuditEntry[];
  createdAt: string;
  updatedAt: string;
};

/** Szablon recepty (szybkie wstawianie) */
export type EPrescriptionTemplate = {
  id: string;
  name: string;
  description: string;
  kind: EPrescriptionKind;
  items: Omit<EPrescriptionItem, "id">[];
  generalNotes: string;
  source: "system" | "user";
  createdAt: string;
  updatedAt: string;
};

export type EHealthStore = {
  prescriptions: EPrescription[];
  referrals: EReferral[];
  templates: EPrescriptionTemplate[];
};

export const E_PRESCRIPTION_KIND_LABELS: Record<EPrescriptionKind, string> = {
  "30_days": "Recepta 30-dniowa",
  annual: "Recepta roczna",
};

export const E_DOCUMENT_STATUS_LABELS: Record<EDocumentStatus, string> = {
  issued: "Wystawiona",
  cancelled: "Anulowana",
};

export const E_REFERRAL_URGENCY_LABELS: Record<EReferralUrgency, string> = {
  normal: "Zwykłe",
  urgent: "Pilne",
};

export const E_AUDIT_ACTION_LABELS: Record<EAuditAction, string> = {
  issued: "Wystawiono",
  updated: "Zaktualizowano",
  cancelled: "Anulowano",
  sms_sent: "SMS do pacjenta",
  template_applied: "Zastosowano szablon",
};

export const E_REFERRAL_CATEGORIES = [
  "Obrazowanie",
  "Laboratorium",
  "Konsultacja specjalistyczna",
  "Zabieg / hospitalizacja",
  "Rehabilitacja",
  "Inne",
] as const;

export const E_REFERRAL_EXAM_TYPES: { category: string; name: string }[] = [
  { category: "Obrazowanie", name: "MRI kolana" },
  { category: "Obrazowanie", name: "MRI barku" },
  { category: "Obrazowanie", name: "MRI kręgosłupa lędźwiowego" },
  { category: "Obrazowanie", name: "TK stawu biodrowego" },
  { category: "Obrazowanie", name: "RTG klatki piersiowej" },
  { category: "Obrazowanie", name: "RTG stawu kolanowego (2 projekcje)" },
  { category: "Obrazowanie", name: "USG stawu barkowego" },
  { category: "Obrazowanie", name: "USG jamy brzusznej" },
  { category: "Laboratorium", name: "Morfologia krwi + OB" },
  { category: "Laboratorium", name: "CRP ilościowe" },
  { category: "Laboratorium", name: "Panel reumatologiczny (RF, anti-CCP)" },
  { category: "Laboratorium", name: "Witamina D (25-OH)" },
  { category: "Konsultacja specjalistyczna", name: "Konsultacja reumatologiczna" },
  { category: "Konsultacja specjalistyczna", name: "Konsultacja neurologiczna" },
  { category: "Konsultacja specjalistyczna", name: "Konsultacja rehabilitacyjna" },
  { category: "Konsultacja specjalistyczna", name: "Konsultacja neurochirurgiczna" },
  { category: "Zabieg / hospitalizacja", name: "Kwalifikacja do artroskopii" },
  { category: "Zabieg / hospitalizacja", name: "Hospitalizacja planowa — ortopedia" },
  { category: "Rehabilitacja", name: "Rehabilitacja ambulatoryjna — staw kolanowy" },
  { category: "Rehabilitacja", name: "Fizjoterapia pooperacyjna" },
  { category: "Inne", name: "Inne badanie / konsultacja" },
];

export const TARGET_FACILITIES = [
  "CMKW Białystok — Szymborskiej 2/U4",
  "CMKW Hajnówka",
  "USK Białystok",
  "SPZOZ Hajnówka",
  "Pracownia MRI — partner zewnętrzny",
  "Laboratorium Diagnostyka",
  "Do wyboru przez pacjenta",
] as const;

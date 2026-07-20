import { SEED_VISITS } from "@/lib/doctor/seed-visits";
import {
  emptyVisitClinical,
  type DoctorVisit,
  type VisitStatus,
} from "@/lib/doctor/types";

/**
 * v3 — karta wizyty EDM: medicalNote, diagnoses, prescriptions, referrals, documents, teleconfirm.
 */
export const DOCTOR_VISITS_STORAGE_KEY = "cmkw-doctor-visits-v4";

const LEGACY_KEYS = [
  "cmkw-doctor-visits-v3",
  "cmkw-doctor-visits-v2",
  "cmkw-doctor-visits-v1",
];

const VALID_STATUS = new Set<VisitStatus>([
  "scheduled",
  "confirmed",
  "teleconfirmed",
  "in_progress",
  "cancelled",
  "completed",
]);

export function normalizeVisit(
  v: Partial<DoctorVisit> & {
    id: string;
    date: string;
    time: string;
  }
): DoctorVisit {
  const clinical = emptyVisitClinical();
  const status = VALID_STATUS.has(v.status as VisitStatus)
    ? (v.status as VisitStatus)
    : "scheduled";

  return {
    id: v.id,
    date: v.date,
    time: v.time,
    patientId: v.patientId ?? "",
    patientFirstName: v.patientFirstName ?? "",
    patientLastName: v.patientLastName ?? "",
    patientPesel: v.patientPesel ?? "",
    patientGroups: v.patientGroups ?? [],
    doctorId: v.doctorId ?? "",
    doctorName: v.doctorName ?? "",
    status,
    type: v.type ?? "konsultacja",
    note: v.note ?? "",
    medicalNote: v.medicalNote ?? clinical.medicalNote,
    diagnoses: Array.isArray(v.diagnoses) ? v.diagnoses : clinical.diagnoses,
    prescriptions: Array.isArray(v.prescriptions)
      ? v.prescriptions
      : clinical.prescriptions,
    referrals: Array.isArray(v.referrals) ? v.referrals : clinical.referrals,
    documentIds: Array.isArray(v.documentIds)
      ? v.documentIds
      : clinical.documentIds,
    needsTeleconfirm: Boolean(v.needsTeleconfirm),
    departmentId: v.departmentId ?? "ortopedia",
    branchId:
      v.branchId === "hajnowka" || v.branchId === "bialystok"
        ? v.branchId
        : // heuristic: rehab more often bialystok; some IDs map to hajnowka
          v.doctorId === "sammoudi" || v.doctorId === "zawadzki"
          ? hashBranch(v.id)
          : "bialystok",
    createdAt: v.createdAt ?? new Date().toISOString(),
    updatedAt: v.updatedAt ?? new Date().toISOString(),
  };
}

function hashBranch(id: string): "bialystok" | "hajnowka" {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 5;
  return h <= 2 ? "bialystok" : "hajnowka";
}

export function loadVisitsFromLocalStorage(): DoctorVisit[] {
  if (typeof window === "undefined") return structuredClone(SEED_VISITS);
  try {
    let raw = localStorage.getItem(DOCTOR_VISITS_STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        const legacy = localStorage.getItem(key);
        if (legacy) {
          raw = legacy;
          break;
        }
      }
    }
    if (!raw) {
      const seed = structuredClone(SEED_VISITS);
      localStorage.setItem(DOCTOR_VISITS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<DoctorVisit>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = structuredClone(SEED_VISITS);
      localStorage.setItem(DOCTOR_VISITS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const normalized = parsed
      .filter((v): v is Partial<DoctorVisit> & { id: string; date: string; time: string } =>
        Boolean(v?.id && v?.date && v?.time)
      )
      .map(normalizeVisit);
    // Persist migrated v3
    localStorage.setItem(
      DOCTOR_VISITS_STORAGE_KEY,
      JSON.stringify(normalized)
    );
    return normalized;
  } catch {
    return structuredClone(SEED_VISITS);
  }
}

export function saveVisitsToLocalStorage(visits: DoctorVisit[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCTOR_VISITS_STORAGE_KEY, JSON.stringify(visits));
  } catch {
    // quota
  }
}

export function resetVisitsLocalStorage(): DoctorVisit[] {
  const seed = structuredClone(SEED_VISITS);
  saveVisitsToLocalStorage(seed);
  return seed;
}

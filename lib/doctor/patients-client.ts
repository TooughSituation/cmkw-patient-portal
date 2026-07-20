import { SEED_PATIENTS } from "@/lib/doctor/seed-patients";
import type {
  DoctorPatient,
  PatientGroup,
  PatientSex,
  PatientStatus,
} from "@/lib/doctor/types";

/** Bump wersji przy zmianie schematu (reset localStorage). */
export const DOCTOR_PATIENTS_STORAGE_KEY = "cmkw-doctor-patients-v2";

export type PatientInput = {
  firstName: string;
  lastName: string;
  pesel: string;
  birthDate: string;
  sex: PatientSex;
  phone: string;
  email: string;
  street: string;
  buildingNo: string;
  apartmentNo: string;
  postalCode: string;
  city: string;
  cardNumber: string;
  groups: PatientGroup[];
  notes: string;
  rodConsent: boolean;
  status: PatientStatus;
  primaryBranchId?: string;
};

function nextCardNumber(patients: DoctorPatient[]): string {
  let max = 0;
  for (const p of patients) {
    const m = /^CMKW-(\d+)$/i.exec(p.cardNumber);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `CMKW-${String(max + 1).padStart(4, "0")}`;
}

export function loadPatientsFromLocalStorage(): DoctorPatient[] {
  if (typeof window === "undefined") return structuredClone(SEED_PATIENTS);
  try {
    const raw = localStorage.getItem(DOCTOR_PATIENTS_STORAGE_KEY);
    if (!raw) {
      const seed = structuredClone(SEED_PATIENTS);
      localStorage.setItem(DOCTOR_PATIENTS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as DoctorPatient[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = structuredClone(SEED_PATIENTS);
      localStorage.setItem(DOCTOR_PATIENTS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed.map((p) => ({
      ...p,
      primaryBranchId: p.primaryBranchId ?? "bialystok",
    }));
  } catch {
    return structuredClone(SEED_PATIENTS);
  }
}

export function savePatientsToLocalStorage(patients: DoctorPatient[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCTOR_PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch {
    // quota
  }
}

export function resetPatientsLocalStorage(): DoctorPatient[] {
  const seed = structuredClone(SEED_PATIENTS);
  savePatientsToLocalStorage(seed);
  return seed;
}

export function createPatientRecord(
  input: PatientInput,
  existing: DoctorPatient[]
): DoctorPatient {
  const now = new Date().toISOString();
  const cardNumber =
    input.cardNumber.trim() || nextCardNumber(existing);
  return {
    id: `p-${crypto.randomUUID().slice(0, 8)}`,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    pesel: input.pesel.replace(/\s/g, ""),
    birthDate: input.birthDate,
    sex: input.sex,
    phone: input.phone.trim(),
    email: input.email.trim(),
    street: input.street.trim(),
    buildingNo: input.buildingNo.trim(),
    apartmentNo: input.apartmentNo.trim(),
    postalCode: input.postalCode.trim(),
    city: input.city.trim(),
    cardNumber,
    groups: input.groups,
    notes: input.notes.trim(),
    rodConsent: input.rodConsent,
    rodConsentAt: input.rodConsent ? now : undefined,
    status: input.status,
    primaryBranchId: input.primaryBranchId ?? "bialystok",
    createdAt: now,
    updatedAt: now,
  };
}

export function updatePatientRecord(
  id: string,
  input: PatientInput,
  existing: DoctorPatient[]
): DoctorPatient | null {
  const prev = existing.find((p) => p.id === id);
  if (!prev) return null;
  const now = new Date().toISOString();
  return {
    ...prev,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    pesel: input.pesel.replace(/\s/g, ""),
    birthDate: input.birthDate,
    sex: input.sex,
    phone: input.phone.trim(),
    email: input.email.trim(),
    street: input.street.trim(),
    buildingNo: input.buildingNo.trim(),
    apartmentNo: input.apartmentNo.trim(),
    postalCode: input.postalCode.trim(),
    city: input.city.trim(),
    cardNumber: input.cardNumber.trim() || prev.cardNumber,
    groups: input.groups,
    notes: input.notes.trim(),
    rodConsent: input.rodConsent,
    rodConsentAt: input.rodConsent
      ? prev.rodConsentAt ?? now
      : undefined,
    status: input.status,
    primaryBranchId: input.primaryBranchId ?? prev.primaryBranchId ?? "bialystok",
    updatedAt: now,
  };
}

import {
  SEED_E_PRESCRIPTIONS,
  SEED_E_REFERRALS,
} from "@/lib/doctor/seed-ehealth";
import type {
  EHealthStore,
  EPrescription,
  EPrescriptionItem,
  EPrescriptionKind,
  EReferral,
  EReferralUrgency,
} from "@/lib/doctor/ehealth-types";

export const EHEALTH_STORAGE_KEY = "cmkw-doctor-ehealth-v1";
export const EHEALTH_EVENT = "cmkw-ehealth-updated";

function cloneStore(): EHealthStore {
  return {
    prescriptions: structuredClone(SEED_E_PRESCRIPTIONS),
    referrals: structuredClone(SEED_E_REFERRALS),
  };
}

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EHEALTH_EVENT));
}

export function loadEHealthStore(): EHealthStore {
  if (typeof window === "undefined") return cloneStore();
  try {
    const raw = localStorage.getItem(EHEALTH_STORAGE_KEY);
    if (!raw) {
      const seed = cloneStore();
      localStorage.setItem(EHEALTH_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<EHealthStore>;
    return {
      prescriptions: Array.isArray(parsed.prescriptions)
        ? parsed.prescriptions.map(normalizePrescription)
        : cloneStore().prescriptions,
      referrals: Array.isArray(parsed.referrals)
        ? parsed.referrals.map(normalizeReferral)
        : cloneStore().referrals,
    };
  } catch {
    return cloneStore();
  }
}

export function saveEHealthStore(store: EHealthStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EHEALTH_STORAGE_KEY, JSON.stringify(store));
    notify();
  } catch {
    // quota
  }
}

export function resetEHealthStore(): EHealthStore {
  const seed = cloneStore();
  saveEHealthStore(seed);
  return seed;
}

function normalizePrescription(p: Partial<EPrescription>): EPrescription {
  return {
    id: p.id ?? `epx-${crypto.randomUUID().slice(0, 8)}`,
    number: p.number ?? generateEPrescriptionNumber(),
    accessCode: p.accessCode ?? generateAccessCode(),
    status: p.status === "cancelled" ? "cancelled" : "issued",
    kind: p.kind === "annual" ? "annual" : "30_days",
    visitId: p.visitId ?? "",
    patientId: p.patientId ?? "",
    patientName: p.patientName ?? "",
    patientPesel: p.patientPesel ?? "",
    doctorId: p.doctorId ?? "",
    doctorName: p.doctorName ?? "",
    doctorPwz: p.doctorPwz ?? "",
    items: Array.isArray(p.items) ? p.items : [],
    generalNotes: p.generalNotes ?? "",
    issuedAt: p.issuedAt ?? new Date().toISOString(),
    cancelledAt: p.cancelledAt,
    cancelReason: p.cancelReason,
    smsSentAt: p.smsSentAt,
    p1Ready: p.p1Ready ?? true,
    createdAt: p.createdAt ?? new Date().toISOString(),
    updatedAt: p.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeReferral(r: Partial<EReferral>): EReferral {
  return {
    id: r.id ?? `eref-${crypto.randomUUID().slice(0, 8)}`,
    number: r.number ?? generateEReferralNumber(),
    accessCode: r.accessCode ?? generateAccessCode(),
    status: r.status === "cancelled" ? "cancelled" : "issued",
    visitId: r.visitId ?? "",
    patientId: r.patientId ?? "",
    patientName: r.patientName ?? "",
    patientPesel: r.patientPesel ?? "",
    doctorId: r.doctorId ?? "",
    doctorName: r.doctorName ?? "",
    doctorPwz: r.doctorPwz ?? "",
    examCategory: r.examCategory ?? "Inne",
    examType: r.examType ?? "",
    justification: r.justification ?? "",
    urgency: r.urgency === "urgent" ? "urgent" : "normal",
    targetFacility: r.targetFacility ?? "",
    icdCode: r.icdCode ?? "",
    issuedAt: r.issuedAt ?? new Date().toISOString(),
    cancelledAt: r.cancelledAt,
    cancelReason: r.cancelReason,
    p1Ready: r.p1Ready ?? true,
    createdAt: r.createdAt ?? new Date().toISOString(),
    updatedAt: r.updatedAt ?? new Date().toISOString(),
  };
}

/** Mock numer e-recepty w stylu 4-4-4 */
export function generateEPrescriptionNumber(): string {
  const n = () =>
    String(Math.floor(1000 + Math.random() * 9000));
  return `${n()}-${n()}-${n()}`;
}

/** Mock numer e-skierowania */
export function generateEReferralNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(100000 + Math.random() * 900000));
  return `ES-${year}-${seq}`;
}

export function generateAccessCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export type CreatePrescriptionInput = {
  visitId: string;
  patientId: string;
  patientName: string;
  patientPesel: string;
  doctorId: string;
  doctorName: string;
  doctorPwz?: string;
  kind: EPrescriptionKind;
  items: Omit<EPrescriptionItem, "id">[];
  generalNotes?: string;
};

export function createEPrescription(
  store: EHealthStore,
  input: CreatePrescriptionInput
): { store: EHealthStore; prescription: EPrescription } {
  const now = new Date().toISOString();
  const prescription: EPrescription = {
    id: `epx-${crypto.randomUUID().slice(0, 10)}`,
    number: generateEPrescriptionNumber(),
    accessCode: generateAccessCode(),
    status: "issued",
    kind: input.kind,
    visitId: input.visitId,
    patientId: input.patientId,
    patientName: input.patientName,
    patientPesel: input.patientPesel,
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    doctorPwz: input.doctorPwz ?? "",
    items: input.items.map((it) => ({
      ...it,
      id: `epi-${crypto.randomUUID().slice(0, 8)}`,
    })),
    generalNotes: input.generalNotes?.trim() ?? "",
    issuedAt: now,
    p1Ready: true,
    createdAt: now,
    updatedAt: now,
  };
  const next = {
    ...store,
    prescriptions: [prescription, ...store.prescriptions],
  };
  return { store: next, prescription };
}

export function updateEPrescription(
  store: EHealthStore,
  id: string,
  patch: Partial<
    Pick<
      EPrescription,
      | "kind"
      | "items"
      | "generalNotes"
      | "status"
      | "cancelledAt"
      | "cancelReason"
      | "smsSentAt"
    >
  >
): { store: EHealthStore; prescription: EPrescription | null } {
  let updated: EPrescription | null = null;
  const prescriptions = store.prescriptions.map((p) => {
    if (p.id !== id) return p;
    updated = {
      ...p,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  return { store: { ...store, prescriptions }, prescription: updated };
}

export function cancelEPrescription(
  store: EHealthStore,
  id: string,
  reason: string
): { store: EHealthStore; prescription: EPrescription | null } {
  let updated: EPrescription | null = null;
  const prescriptions = store.prescriptions.map((p) => {
    if (p.id !== id) return p;
    updated = {
      ...p,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: reason.trim() || "Anulowano przez lekarza",
      p1Ready: false,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  return { store: { ...store, prescriptions }, prescription: updated };
}

export type CreateReferralInput = {
  visitId: string;
  patientId: string;
  patientName: string;
  patientPesel: string;
  doctorId: string;
  doctorName: string;
  doctorPwz?: string;
  examCategory: string;
  examType: string;
  justification: string;
  urgency: EReferralUrgency;
  targetFacility?: string;
  icdCode?: string;
};

export function createEReferral(
  store: EHealthStore,
  input: CreateReferralInput
): { store: EHealthStore; referral: EReferral } {
  const now = new Date().toISOString();
  const referral: EReferral = {
    id: `eref-${crypto.randomUUID().slice(0, 10)}`,
    number: generateEReferralNumber(),
    accessCode: generateAccessCode(),
    status: "issued",
    visitId: input.visitId,
    patientId: input.patientId,
    patientName: input.patientName,
    patientPesel: input.patientPesel,
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    doctorPwz: input.doctorPwz ?? "",
    examCategory: input.examCategory,
    examType: input.examType.trim(),
    justification: input.justification.trim(),
    urgency: input.urgency,
    targetFacility: input.targetFacility?.trim() ?? "",
    icdCode: input.icdCode?.trim() ?? "",
    issuedAt: now,
    p1Ready: true,
    createdAt: now,
    updatedAt: now,
  };
  const next = {
    ...store,
    referrals: [referral, ...store.referrals],
  };
  return { store: next, referral };
}

export function updateEReferral(
  store: EHealthStore,
  id: string,
  patch: Partial<
    Pick<
      EReferral,
      | "examCategory"
      | "examType"
      | "justification"
      | "urgency"
      | "targetFacility"
      | "icdCode"
      | "status"
      | "cancelledAt"
      | "cancelReason"
    >
  >
): { store: EHealthStore; referral: EReferral | null } {
  let updated: EReferral | null = null;
  const referrals = store.referrals.map((r) => {
    if (r.id !== id) return r;
    updated = {
      ...r,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  return { store: { ...store, referrals }, referral: updated };
}

export function cancelEReferral(
  store: EHealthStore,
  id: string,
  reason: string
): { store: EHealthStore; referral: EReferral | null } {
  let updated: EReferral | null = null;
  const referrals = store.referrals.map((r) => {
    if (r.id !== id) return r;
    updated = {
      ...r,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: reason.trim() || "Anulowano przez lekarza",
      p1Ready: false,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  return { store: { ...store, referrals }, referral: updated };
}

/**
 * Adapter pod przyszłe API P1 — serializacja mock payload.
 * Nie wysyła niczego na zewnątrz.
 */
export function toP1PrescriptionPayload(rx: EPrescription) {
  return {
    documentType: "e_prescription" as const,
    externalId: rx.id,
    prescriptionKey: rx.number.replace(/-/g, ""),
    accessCode: rx.accessCode,
    kind: rx.kind,
    patient: {
      pesel: rx.patientPesel,
      displayName: rx.patientName,
    },
    prescriber: {
      doctorId: rx.doctorId,
      name: rx.doctorName,
      pwz: rx.doctorPwz,
    },
    items: rx.items.map((it) => ({
      drugId: it.drugId,
      name: it.drugName,
      inn: it.inn,
      dosage: it.dosage,
      quantity: it.quantity,
      duration: it.duration,
      frequency: it.frequency,
      notes: it.notes,
    })),
    notes: rx.generalNotes,
    issuedAt: rx.issuedAt,
  };
}

export function toP1ReferralPayload(ref: EReferral) {
  return {
    documentType: "e_referral" as const,
    externalId: ref.id,
    referralNumber: ref.number,
    accessCode: ref.accessCode,
    patient: {
      pesel: ref.patientPesel,
      displayName: ref.patientName,
    },
    referrer: {
      doctorId: ref.doctorId,
      name: ref.doctorName,
      pwz: ref.doctorPwz,
    },
    service: {
      category: ref.examCategory,
      type: ref.examType,
      urgency: ref.urgency,
      targetFacility: ref.targetFacility,
      icdCode: ref.icdCode,
    },
    justification: ref.justification,
    issuedAt: ref.issuedAt,
  };
}

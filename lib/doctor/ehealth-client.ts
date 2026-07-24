import {
  SEED_E_PRESCRIPTIONS,
  SEED_E_REFERRALS,
  SEED_E_TEMPLATES,
} from "@/lib/doctor/seed-ehealth";
import type {
  EAuditAction,
  EAuditEntry,
  EHealthStore,
  EPrescription,
  EPrescriptionItem,
  EPrescriptionKind,
  EPrescriptionTemplate,
  EReferral,
  EReferralUrgency,
} from "@/lib/doctor/ehealth-types";

/** v2 — szablony + auditLog na dokumentach */
export const EHEALTH_STORAGE_KEY = "cmkw-doctor-ehealth-v2";
export const EHEALTH_EVENT = "cmkw-ehealth-updated";
const LEGACY_KEY = "cmkw-doctor-ehealth-v1";

export type EHealthActor = {
  userId: string;
  name: string;
  role: string;
};

function cloneStore(): EHealthStore {
  return {
    prescriptions: structuredClone(SEED_E_PRESCRIPTIONS),
    referrals: structuredClone(SEED_E_REFERRALS),
    templates: structuredClone(SEED_E_TEMPLATES),
  };
}

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EHEALTH_EVENT));
}

export function makeAuditEntry(
  action: EAuditAction,
  actor: EHealthActor,
  summary: string
): EAuditEntry {
  return {
    id: `aud-${crypto.randomUUID().slice(0, 10)}`,
    at: new Date().toISOString(),
    action,
    actorUserId: actor.userId,
    actorName: actor.name,
    actorRole: actor.role,
    summary,
  };
}

export function loadEHealthStore(): EHealthStore {
  if (typeof window === "undefined") return cloneStore();
  try {
    const raw = localStorage.getItem(EHEALTH_STORAGE_KEY);
    if (!raw) {
      // migracja z v1
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy) as Partial<EHealthStore>;
        const migrated: EHealthStore = {
          prescriptions: Array.isArray(parsed.prescriptions)
            ? parsed.prescriptions.map(normalizePrescription)
            : cloneStore().prescriptions,
          referrals: Array.isArray(parsed.referrals)
            ? parsed.referrals.map(normalizeReferral)
            : cloneStore().referrals,
          templates: cloneStore().templates,
        };
        localStorage.setItem(EHEALTH_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      const seed = cloneStore();
      localStorage.setItem(EHEALTH_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<EHealthStore>;
    const templates = Array.isArray(parsed.templates)
      ? parsed.templates.map(normalizeTemplate)
      : cloneStore().templates;
    // ensure system templates always present
    const systemIds = new Set(SEED_E_TEMPLATES.map((t) => t.id));
    const userTpls = templates.filter((t) => t.source === "user");
    const systemTpls = SEED_E_TEMPLATES.map((s) => {
      const existing = templates.find((t) => t.id === s.id);
      return existing && existing.source === "system" ? existing : s;
    });
    void systemIds;
    return {
      prescriptions: Array.isArray(parsed.prescriptions)
        ? parsed.prescriptions.map(normalizePrescription)
        : cloneStore().prescriptions,
      referrals: Array.isArray(parsed.referrals)
        ? parsed.referrals.map(normalizeReferral)
        : cloneStore().referrals,
      templates: [...systemTpls, ...userTpls],
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

function normalizeAudit(entries: unknown): EAuditEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries.map((e) => {
    const x = e as Partial<EAuditEntry>;
    return {
      id: x.id ?? `aud-${crypto.randomUUID().slice(0, 8)}`,
      at: x.at ?? new Date().toISOString(),
      action: (x.action as EAuditAction) ?? "issued",
      actorUserId: x.actorUserId ?? "",
      actorName: x.actorName ?? "?",
      actorRole: x.actorRole ?? "",
      summary: x.summary ?? "",
    };
  });
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
    auditLog: normalizeAudit(p.auditLog),
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
    auditLog: normalizeAudit(r.auditLog),
    createdAt: r.createdAt ?? new Date().toISOString(),
    updatedAt: r.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeTemplate(
  t: Partial<EPrescriptionTemplate>
): EPrescriptionTemplate {
  return {
    id: t.id ?? `tpl-${crypto.randomUUID().slice(0, 8)}`,
    name: t.name ?? "Szablon",
    description: t.description ?? "",
    kind: t.kind === "annual" ? "annual" : "30_days",
    items: Array.isArray(t.items) ? t.items : [],
    generalNotes: t.generalNotes ?? "",
    source: t.source === "user" ? "user" : "system",
    createdAt: t.createdAt ?? new Date().toISOString(),
    updatedAt: t.updatedAt ?? new Date().toISOString(),
  };
}

export function generateEPrescriptionNumber(): string {
  const n = () => String(Math.floor(1000 + Math.random() * 9000));
  return `${n()}-${n()}-${n()}`;
}

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
  actor: EHealthActor;
  templateName?: string;
};

export function createEPrescription(
  store: EHealthStore,
  input: CreatePrescriptionInput
): { store: EHealthStore; prescription: EPrescription } {
  const now = new Date().toISOString();
  const log: EAuditEntry[] = [
    makeAuditEntry(
      "issued",
      input.actor,
      `Wystawiono e-receptę (${input.items.length} poz., ${input.kind === "annual" ? "roczna" : "30-dniowa"})`
    ),
  ];
  if (input.templateName) {
    log.push(
      makeAuditEntry(
        "template_applied",
        input.actor,
        `Szablon: ${input.templateName}`
      )
    );
  }
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
    auditLog: log,
    createdAt: now,
    updatedAt: now,
  };
  return {
    store: {
      ...store,
      prescriptions: [prescription, ...store.prescriptions],
    },
    prescription,
  };
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
  >,
  actor?: EHealthActor,
  auditSummary?: string
): { store: EHealthStore; prescription: EPrescription | null } {
  let updated: EPrescription | null = null;
  const prescriptions = store.prescriptions.map((p) => {
    if (p.id !== id) return p;
    const nextLog = [...(p.auditLog ?? [])];
    if (actor && auditSummary) {
      nextLog.push(makeAuditEntry("updated", actor, auditSummary));
    }
    updated = {
      ...p,
      ...patch,
      auditLog: nextLog,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  return { store: { ...store, prescriptions }, prescription: updated };
}

export function cancelEPrescription(
  store: EHealthStore,
  id: string,
  reason: string,
  actor: EHealthActor
): { store: EHealthStore; prescription: EPrescription | null } {
  let updated: EPrescription | null = null;
  const prescriptions = store.prescriptions.map((p) => {
    if (p.id !== id) return p;
    const summary = reason.trim() || "Anulowano przez lekarza";
    updated = {
      ...p,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: summary,
      p1Ready: false,
      auditLog: [
        ...(p.auditLog ?? []),
        makeAuditEntry("cancelled", actor, `Anulowano: ${summary}`),
      ],
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  return { store: { ...store, prescriptions }, prescription: updated };
}

export function markPrescriptionSms(
  store: EHealthStore,
  id: string,
  actor: EHealthActor
): { store: EHealthStore; prescription: EPrescription | null } {
  let updated: EPrescription | null = null;
  const prescriptions = store.prescriptions.map((p) => {
    if (p.id !== id) return p;
    updated = {
      ...p,
      smsSentAt: new Date().toISOString(),
      auditLog: [
        ...(p.auditLog ?? []),
        makeAuditEntry(
          "sms_sent",
          actor,
          `SMS mock: kod ${p.accessCode}, nr ${p.number}`
        ),
      ],
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
  actor: EHealthActor;
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
    auditLog: [
      makeAuditEntry(
        "issued",
        input.actor,
        `Wystawiono e-skierowanie: ${input.examType.trim()}${input.urgency === "urgent" ? " (pilne)" : ""}`
      ),
    ],
    createdAt: now,
    updatedAt: now,
  };
  return {
    store: { ...store, referrals: [referral, ...store.referrals] },
    referral,
  };
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
  >,
  actor?: EHealthActor,
  auditSummary?: string
): { store: EHealthStore; referral: EReferral | null } {
  let updated: EReferral | null = null;
  const referrals = store.referrals.map((r) => {
    if (r.id !== id) return r;
    const nextLog = [...(r.auditLog ?? [])];
    if (actor && auditSummary) {
      nextLog.push(makeAuditEntry("updated", actor, auditSummary));
    }
    updated = {
      ...r,
      ...patch,
      auditLog: nextLog,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  return { store: { ...store, referrals }, referral: updated };
}

export function cancelEReferral(
  store: EHealthStore,
  id: string,
  reason: string,
  actor: EHealthActor
): { store: EHealthStore; referral: EReferral | null } {
  let updated: EReferral | null = null;
  const referrals = store.referrals.map((r) => {
    if (r.id !== id) return r;
    const summary = reason.trim() || "Anulowano przez lekarza";
    updated = {
      ...r,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: summary,
      p1Ready: false,
      auditLog: [
        ...(r.auditLog ?? []),
        makeAuditEntry("cancelled", actor, `Anulowano: ${summary}`),
      ],
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  return { store: { ...store, referrals }, referral: updated };
}

/* ─── Szablony ─── */

export function saveTemplate(
  store: EHealthStore,
  input: {
    name: string;
    description?: string;
    kind: EPrescriptionKind;
    items: Omit<EPrescriptionItem, "id">[];
    generalNotes?: string;
    id?: string;
  }
): { store: EHealthStore; template: EPrescriptionTemplate } {
  const now = new Date().toISOString();
  if (input.id) {
    let updated: EPrescriptionTemplate | null = null;
    const templates = store.templates.map((t) => {
      if (t.id !== input.id) return t;
      if (t.source === "system") return t;
      updated = {
        ...t,
        name: input.name.trim(),
        description: input.description?.trim() ?? t.description,
        kind: input.kind,
        items: input.items,
        generalNotes: input.generalNotes?.trim() ?? "",
        updatedAt: now,
      };
      return updated;
    });
    if (updated) {
      return { store: { ...store, templates }, template: updated };
    }
  }
  const template: EPrescriptionTemplate = {
    id: `tpl-user-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    kind: input.kind,
    items: input.items,
    generalNotes: input.generalNotes?.trim() ?? "",
    source: "user",
    createdAt: now,
    updatedAt: now,
  };
  return {
    store: { ...store, templates: [...store.templates, template] },
    template,
  };
}

export function deleteTemplate(
  store: EHealthStore,
  id: string
): EHealthStore {
  return {
    ...store,
    templates: store.templates.filter(
      (t) => !(t.id === id && t.source === "user")
    ),
  };
}

/** Recepcja: tylko odczyt e-dokumentów + SMS mock */
export function canIssueEHealthDocuments(
  role: string | undefined | null
): boolean {
  return role === "doctor" || role === "admin" || role === "facility";
}

export function canResendEHealthSms(
  role: string | undefined | null
): boolean {
  return (
    role === "doctor" ||
    role === "admin" ||
    role === "facility" ||
    role === "reception"
  );
}

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
    auditLog: rx.auditLog,
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
    auditLog: ref.auditLog,
  };
}

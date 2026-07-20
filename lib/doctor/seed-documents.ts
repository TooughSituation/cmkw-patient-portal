import type { DoctorDocument } from "@/lib/doctor/types";

const now = new Date().toISOString();

/** Seed dokumentów mock (powiązane z pacjentami / wizytami). */
export const SEED_DOCUMENTS: DoctorDocument[] = [
  {
    id: "doc-visit-001",
    name: "Skierowanie_MRI_kolano_P.pdf",
    type: "skierowanie",
    scope: "visit",
    patientId: "p-001",
    visitId: "v-001",
    content:
      "SKIEROWANIE (mock)\nPacjent: Anna Kowalska\nBadanie: MRI kolana prawego\nCel: ocena łąkotki i chrząstki\nLekarz: Dr n. med. Jan Kiryluk\nData: " +
      now.slice(0, 10),
    mimeType: "text/plain",
    sizeBytes: 420,
    createdAt: now,
    createdBy: "Dr n. med. Jan Kiryluk",
  },
  {
    id: "doc-visit-016",
    name: "Skierowanie_USG_bark.pdf",
    type: "skierowanie",
    scope: "visit",
    patientId: "p-016",
    visitId: "v-016",
    content:
      "SKIEROWANIE (mock)\nUSG barku – stożek rotatorów\nLekarz: Dr n. med. Jan Kiryluk",
    mimeType: "text/plain",
    sizeBytes: 280,
    createdAt: now,
    createdBy: "Dr n. med. Jan Kiryluk",
  },
  {
    id: "doc-pat-001",
    name: "Zgoda_RODO_Kowalska.pdf",
    type: "zgoda",
    scope: "patient",
    patientId: "p-001",
    content: "Zgoda na przetwarzanie danych osobowych (mock) – Anna Kowalska",
    mimeType: "text/plain",
    sizeBytes: 180,
    createdAt: now,
    createdBy: "Recepcja",
  },
  {
    id: "doc-pat-004",
    name: "Wynik_RTG_biodro_P.pdf",
    type: "wynik",
    scope: "patient",
    patientId: "p-004",
    content:
      "Wynik RTG (mock)\nEndoproteza biodra P – komponenty w prawidłowej pozycji, bez cech obluzowania.",
    mimeType: "text/plain",
    sizeBytes: 350,
    createdAt: now,
    createdBy: "Pracownia RTG",
  },
  {
    id: "doc-pat-008",
    name: "Recepta_placeholder.pdf",
    type: "recepta",
    scope: "patient",
    patientId: "p-008",
    content: "E-recepta (placeholder mock) – Tramal 50 mg",
    mimeType: "text/plain",
    sizeBytes: 120,
    createdAt: now,
    createdBy: "Dr n. med. Jan Kiryluk",
  },
];

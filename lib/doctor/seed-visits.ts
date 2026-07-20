import type { DoctorVisit } from "@/lib/doctor/types";
import { SEED_PATIENTS } from "@/lib/doctor/seed-patients";
import { format, addDays, subDays } from "date-fns";

/**
 * Deterministyczne seed-y wizyt EDM (20).
 * Daty względne do „dziś”; patientId spięty z SEED_PATIENTS.
 */
function d(offset: number): string {
  return format(addDays(new Date(), offset), "yyyy-MM-dd");
}

function past(offset: number): string {
  return format(subDays(new Date(), offset), "yyyy-MM-dd");
}

const now = new Date().toISOString();

function visit(
  partial: Omit<
    DoctorVisit,
    | "patientFirstName"
    | "patientLastName"
    | "patientPesel"
    | "patientGroups"
    | "createdAt"
    | "updatedAt"
  > & { patientId: string }
): DoctorVisit {
  const patient = SEED_PATIENTS.find((p) => p.id === partial.patientId);
  if (!patient) {
    throw new Error(`Seed visit: missing patient ${partial.patientId}`);
  }
  return {
    ...partial,
    patientFirstName: patient.firstName,
    patientLastName: patient.lastName,
    patientPesel: patient.pesel,
    patientGroups: [...patient.groups],
    createdAt: now,
    updatedAt: now,
  };
}

export const SEED_VISITS: DoctorVisit[] = [
  visit({
    id: "v-001",
    date: d(0),
    time: "08:00",
    patientId: "p-001",
    doctorId: "kiryluk",
    doctorName: "Dr n. med. Jan Kiryluk",
    status: "confirmed",
    type: "konsultacja",
    note: "Ból kolana prawego, MRI w toku",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-002",
    date: d(0),
    time: "08:30",
    patientId: "p-002",
    doctorId: "wenta",
    doctorName: "Lek. Tomas Wenta",
    status: "scheduled",
    type: "kontrolna",
    note: "Kontrola po artroskopii",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-003",
    date: d(0),
    time: "09:00",
    patientId: "p-003",
    doctorId: "frankowski",
    doctorName: "Lek. Paweł Frankowski",
    status: "confirmed",
    type: "konsultacja",
    note: "Uraz barku – siatkówka",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-004",
    date: d(0),
    time: "09:30",
    patientId: "p-004",
    doctorId: "kiryluk",
    doctorName: "Dr n. med. Jan Kiryluk",
    status: "scheduled",
    type: "kontrolna",
    note: "6 tyg. po endoprotezie biodra",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-005",
    date: d(0),
    time: "10:00",
    patientId: "p-005",
    doctorId: "zawadzki",
    doctorName: "Lek. Andrzej Zawadzki",
    status: "confirmed",
    type: "konsultacja",
    note: "Pierwsza wizyta – ból kręgosłupa L-S",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-006",
    date: d(0),
    time: "10:30",
    patientId: "p-006",
    doctorId: "torba",
    doctorName: "Lek. Grzegorz Torba",
    status: "completed",
    type: "rehabilitacja",
    note: "Sesja 4/10 – staw skokowy",
    departmentId: "rehabilitacja",
  }),
  visit({
    id: "v-007",
    date: d(0),
    time: "11:00",
    patientId: "p-007",
    doctorId: "sammoudi",
    doctorName: "Lek. Saddam Sammoudi",
    status: "cancelled",
    type: "konsultacja",
    note: "Pacjent odwołał – przełożone",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-008",
    date: d(0),
    time: "11:30",
    patientId: "p-008",
    doctorId: "kiryluk",
    doctorName: "Dr n. med. Jan Kiryluk",
    status: "confirmed",
    type: "pilna",
    note: "Ostry ból – podejrzenie uszkodzenia ACL",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-009",
    date: d(0),
    time: "12:00",
    patientId: "p-009",
    doctorId: "wenta",
    doctorName: "Lek. Tomas Wenta",
    status: "scheduled",
    type: "zabieg",
    note: "Kwalifikacja do PRP kolano L",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-010",
    date: d(0),
    time: "13:00",
    patientId: "p-010",
    doctorId: "torba",
    doctorName: "Lek. Grzegorz Torba",
    status: "confirmed",
    type: "rehabilitacja",
    note: "Pooperacyjna RHB barku",
    departmentId: "rehabilitacja",
  }),
  visit({
    id: "v-011",
    date: d(1),
    time: "08:00",
    patientId: "p-011",
    doctorId: "frankowski",
    doctorName: "Lek. Paweł Frankowski",
    status: "scheduled",
    type: "konsultacja",
    note: "Hallux valgus – konsultacja",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-012",
    date: d(1),
    time: "09:00",
    patientId: "p-012",
    doctorId: "sammoudi",
    doctorName: "Lek. Saddam Sammoudi",
    status: "scheduled",
    type: "konsultacja",
    note: "Ból ścięgna Achillesa",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-013",
    date: d(1),
    time: "10:30",
    patientId: "p-013",
    doctorId: "kiryluk",
    doctorName: "Dr n. med. Jan Kiryluk",
    status: "confirmed",
    type: "kontrolna",
    note: "Kontrola RTG po złamaniu nadgarstka",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-014",
    date: d(2),
    time: "08:30",
    patientId: "p-014",
    doctorId: "zawadzki",
    doctorName: "Lek. Andrzej Zawadzki",
    status: "scheduled",
    type: "zabieg",
    note: "Iniekcja dostawowa bark",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-015",
    date: d(2),
    time: "11:00",
    patientId: "p-015",
    doctorId: "wenta",
    doctorName: "Lek. Tomas Wenta",
    status: "scheduled",
    type: "konsultacja",
    note: "Kontuzja kolana – bieganie",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-016",
    date: past(1),
    time: "09:00",
    patientId: "p-016",
    doctorId: "kiryluk",
    doctorName: "Dr n. med. Jan Kiryluk",
    status: "completed",
    type: "konsultacja",
    note: "Wydano skierowanie na USG",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-017",
    date: past(1),
    time: "10:00",
    patientId: "p-017",
    doctorId: "torba",
    doctorName: "Lek. Grzegorz Torba",
    status: "completed",
    type: "rehabilitacja",
    note: "Sesja 8/10 – zakończono plan",
    departmentId: "rehabilitacja",
  }),
  visit({
    id: "v-018",
    date: past(2),
    time: "14:00",
    patientId: "p-018",
    doctorId: "frankowski",
    doctorName: "Lek. Paweł Frankowski",
    status: "cancelled",
    type: "kontrolna",
    note: "Nie stawił się",
    departmentId: "ortopedia",
  }),
  visit({
    id: "v-019",
    date: past(3),
    time: "08:00",
    patientId: "p-019",
    doctorId: "wenta",
    doctorName: "Lek. Tomas Wenta",
    status: "completed",
    type: "konsultacja",
    note: "Zalecenia – odciążenie, orteza",
    departmentId: "poradnia",
  }),
  visit({
    id: "v-020",
    date: d(3),
    time: "09:30",
    patientId: "p-020",
    doctorId: "sammoudi",
    doctorName: "Lek. Saddam Sammoudi",
    status: "scheduled",
    type: "konsultacja",
    note: "Pierwsza wizyta – uraz sportowy",
    departmentId: "ortopedia",
  }),
];

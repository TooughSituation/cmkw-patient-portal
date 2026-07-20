import type { DoctorVisit } from "@/lib/doctor/types";
import { emptyVisitClinical } from "@/lib/doctor/types";
import { SEED_PATIENTS } from "@/lib/doctor/seed-patients";
import { format, addDays, subDays } from "date-fns";

/**
 * Deterministyczne seed-y wizyt EDM (20) z notatkami / ICD / lekami (Etap 4).
 */
function d(offset: number): string {
  return format(addDays(new Date(), offset), "yyyy-MM-dd");
}

function past(offset: number): string {
  return format(subDays(new Date(), offset), "yyyy-MM-dd");
}

const now = new Date().toISOString();

type VisitSeed = {
  id: string;
  date: string;
  time: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  status: DoctorVisit["status"];
  type: DoctorVisit["type"];
  note: string;
  departmentId?: string;
  medicalNote?: string;
  diagnoses?: DoctorVisit["diagnoses"];
  prescriptions?: DoctorVisit["prescriptions"];
  referrals?: DoctorVisit["referrals"];
  documentIds?: string[];
  needsTeleconfirm?: boolean;
};

function visit(partial: VisitSeed): DoctorVisit {
  const patient = SEED_PATIENTS.find((p) => p.id === partial.patientId);
  if (!patient) {
    throw new Error(`Seed visit: missing patient ${partial.patientId}`);
  }
  const clinical = emptyVisitClinical();
  return {
    ...clinical,
    id: partial.id,
    date: partial.date,
    time: partial.time,
    patientId: partial.patientId,
    doctorId: partial.doctorId,
    doctorName: partial.doctorName,
    status: partial.status,
    type: partial.type,
    note: partial.note,
    departmentId: partial.departmentId ?? "ortopedia",
    medicalNote: partial.medicalNote ?? clinical.medicalNote,
    diagnoses: partial.diagnoses ?? clinical.diagnoses,
    prescriptions: partial.prescriptions ?? clinical.prescriptions,
    referrals: partial.referrals ?? clinical.referrals,
    documentIds: partial.documentIds ?? clinical.documentIds,
    needsTeleconfirm: partial.needsTeleconfirm ?? clinical.needsTeleconfirm,
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
    needsTeleconfirm: false,
    medicalNote:
      "Wywiad: ból kolana P od 3 mies., nasila się przy schodzeniu. Obrzęk okresowy. Brak urazu ostrego.\nBadanie: bolesność szpary przyśrodkowej, testy łąkotkowe (+/-), ROM prawie pełny.\nPlan: ocena MRI, NLPZ, odciążenie, ewentualnie iniekcja HA.",
    diagnoses: [
      {
        code: "M17.1",
        namePl: "Inna pierwotna gonartroza",
        description: "Gonartroza kolana prawego, stadium radiologiczne II",
      },
    ],
    prescriptions: [
      {
        id: "rx-001",
        drugId: "drug-001",
        drugName: "Ketonal Forte",
        inn: "Ketoprofenum",
        dosage: "100 mg 1×/d z posiłkiem",
        duration: "7 dni",
        notes: "Z IPP przy dolegliwościach żołądkowych",
      },
      {
        id: "rx-002",
        drugId: "drug-029",
        drugName: "Omeprazol Sandoz",
        inn: "Omeprazolum",
        dosage: "20 mg rano",
        duration: "7 dni",
        notes: "",
      },
    ],
    referrals: [
      {
        id: "ref-001",
        title: "MRI kolana P",
        type: "Obrazowanie",
        notes: "Protokół łąkotki + chrząstka",
      },
    ],
    documentIds: ["doc-visit-001"],
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
    needsTeleconfirm: true,
    medicalNote: "Kontrola 4 tyg. po artroskopii łąkotki. Pacjent zgłasza poprawę.",
    diagnoses: [
      {
        code: "M23.2",
        namePl: "Uszkodzenie łąkotki w wyniku starego urazu lub oderwania",
        description: "Stan po artroskopii",
      },
    ],
  }),
  visit({
    id: "v-003",
    date: d(0),
    time: "09:00",
    patientId: "p-003",
    doctorId: "frankowski",
    doctorName: "Lek. Paweł Frankowski",
    status: "teleconfirmed",
    type: "konsultacja",
    note: "Uraz barku – siatkówka",
    needsTeleconfirm: true,
    medicalNote:
      "Uraz barku L podczas bloku. Ból nocny, ograniczenie uniesienia. Podejrzenie impingement / uszkodzenie stożka.",
    diagnoses: [
      {
        code: "M75.1",
        namePl: "Zespół stożka rotatorów",
        description: "Bark L — siatkówka",
      },
    ],
    prescriptions: [
      {
        id: "rx-003",
        drugId: "drug-038",
        drugName: "Voltaren Emulgel",
        inn: "Diclofenacum diethylaminum",
        dosage: "cienka warstwa 3×/d",
        duration: "10 dni",
        notes: "Miejscowo na bark",
      },
    ],
  }),
  visit({
    id: "v-004",
    date: d(0),
    time: "09:30",
    patientId: "p-004",
    doctorId: "kiryluk",
    doctorName: "Dr n. med. Jan Kiryluk",
    status: "in_progress",
    type: "kontrolna",
    note: "6 tyg. po endoprotezie biodra",
    medicalNote:
      "Kontrola po THA. Chód z kulą, rana wygojona. RTG w normie. Zalecenia RHB.",
    diagnoses: [
      {
        code: "Z96.6",
        namePl: "Obecność endoprotezy stawu",
        description: "THA biodro P",
      },
    ],
    prescriptions: [
      {
        id: "rx-004",
        drugId: "drug-027",
        drugName: "Rivaroxaban Sandoz",
        inn: "Rivaroxabanum",
        dosage: "10 mg 1×/d",
        duration: "do 35 dni po zabiegu (wg schematu)",
        notes: "Profilaktyka VTE",
      },
    ],
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
    needsTeleconfirm: true,
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
    medicalNote: "Sesja RHB 4/10. Poprawa ROM i siły. Kontynuacja programu.",
    diagnoses: [
      {
        code: "S93.4",
        namePl: "Skręcenie i naderwanie stawu skokowego",
        description: "Stan po skręceniu – faza RHB",
      },
    ],
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
    needsTeleconfirm: true,
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
    needsTeleconfirm: false,
    medicalNote:
      "Uraz skrętny kolana podczas biegu. Bloq, obrzęk. Lachman (+). Pilne MRI.",
    diagnoses: [
      {
        code: "S83.5",
        namePl: "Skręcenie i naderwanie więzadła krzyżowego kolana",
        description: "Podejrzenie ACL",
      },
    ],
    prescriptions: [
      {
        id: "rx-005",
        drugId: "drug-007",
        drugName: "Tramal",
        inn: "Tramadoli hydrochloridum",
        dosage: "50 mg w razie bólu, max 4×/d",
        duration: "3–5 dni",
        notes: "Ostrożnie – senność",
      },
    ],
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
    needsTeleconfirm: true,
  }),
  visit({
    id: "v-010",
    date: d(0),
    time: "13:00",
    patientId: "p-010",
    doctorId: "torba",
    doctorName: "Lek. Grzegorz Torba",
    status: "teleconfirmed",
    type: "rehabilitacja",
    note: "Pooperacyjna RHB barku",
    needsTeleconfirm: true,
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
    needsTeleconfirm: true,
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
    needsTeleconfirm: true,
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
    needsTeleconfirm: false,
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
    needsTeleconfirm: true,
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
    needsTeleconfirm: true,
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
    medicalNote: "Ból barku – USG stożka zalecone. NLPZ doraźnie.",
    diagnoses: [
      {
        code: "M75.4",
        namePl: "Zespół ciasnoty podbarkowej",
        description: "",
      },
    ],
    referrals: [
      {
        id: "ref-002",
        title: "USG barku",
        type: "Obrazowanie",
        notes: "Stożek rotatorów",
      },
    ],
    documentIds: ["doc-visit-016"],
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
    medicalNote: "Zakończenie cyklu RHB. Ćwiczenia domowe, kontrola za 6 tyg.",
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
    needsTeleconfirm: true,
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
    medicalNote: "Skręcenie stawu skokowego – orteza, RICE, kontrola.",
    diagnoses: [
      {
        code: "S93.4",
        namePl: "Skręcenie i naderwanie stawu skokowego",
        description: "Stopień II",
      },
    ],
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
    needsTeleconfirm: true,
  }),
];

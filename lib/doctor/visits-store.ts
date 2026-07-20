import { promises as fs } from "fs";
import path from "path";
import { SEED_VISITS } from "@/lib/doctor/seed-visits";
import type { DoctorVisit, VisitStatus } from "@/lib/doctor/types";

/**
 * Magazyn wizyt EDM — tylko serwer (Node / Route Handlers).
 * Klient: `lib/doctor/visits-client.ts` (localStorage).
 * Docelowo: Prisma / Postgres.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "doctor-visits.json");

type GlobalStore = {
  items: Map<string, DoctorVisit>;
  loaded: boolean;
};

function getStore(): GlobalStore {
  const g = globalThis as typeof globalThis & {
    __cmkwDoctorVisits?: GlobalStore;
  };
  if (!g.__cmkwDoctorVisits) {
    g.__cmkwDoctorVisits = { items: new Map(), loaded: false };
  }
  return g.__cmkwDoctorVisits;
}

async function ensureLoaded(): Promise<void> {
  const store = getStore();
  if (store.loaded) return;

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const list = JSON.parse(raw) as DoctorVisit[];
    if (Array.isArray(list) && list.length > 0) {
      store.items = new Map(list.map((v) => [v.id, v]));
    } else {
      store.items = new Map(SEED_VISITS.map((v) => [v.id, v]));
      await persist();
    }
  } catch {
    store.items = new Map(SEED_VISITS.map((v) => [v.id, v]));
    await persist();
  }
  store.loaded = true;
}

async function persist(): Promise<void> {
  const store = getStore();
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(Array.from(store.items.values()), null, 2),
      "utf8"
    );
  } catch {
    // Vercel read-only FS
  }
}

function sortVisits(list: DoctorVisit[]): DoctorVisit[] {
  return list.sort((a, b) => {
    const da = `${a.date}T${a.time}`;
    const db = `${b.date}T${b.time}`;
    return da.localeCompare(db);
  });
}

export async function listDoctorVisits(): Promise<DoctorVisit[]> {
  await ensureLoaded();
  return sortVisits(Array.from(getStore().items.values()));
}

export async function listVisitsByDate(date: string): Promise<DoctorVisit[]> {
  const all = await listDoctorVisits();
  return all.filter((v) => v.date === date);
}

export type VisitFilters = {
  patient?: string;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
  status?: VisitStatus | "all";
  hideCompleted?: boolean;
  query?: string;
  departmentId?: string;
};

export async function filterDoctorVisits(
  filters: VisitFilters = {}
): Promise<DoctorVisit[]> {
  let list = await listDoctorVisits();

  if (filters.departmentId) {
    list = list.filter((v) => v.departmentId === filters.departmentId);
  }
  if (filters.doctorId && filters.doctorId !== "all") {
    list = list.filter((v) => v.doctorId === filters.doctorId);
  }
  if (filters.dateFrom) {
    list = list.filter((v) => v.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    list = list.filter((v) => v.date <= filters.dateTo!);
  }
  if (filters.status && filters.status !== "all") {
    list = list.filter((v) => v.status === filters.status);
  }
  if (filters.hideCompleted) {
    list = list.filter((v) => v.status !== "completed");
  }
  if (filters.patient?.trim()) {
    const q = filters.patient.trim().toLowerCase();
    list = list.filter(
      (v) =>
        `${v.patientFirstName} ${v.patientLastName}`.toLowerCase().includes(q) ||
        v.patientPesel.includes(q)
    );
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    list = list.filter(
      (v) =>
        `${v.patientFirstName} ${v.patientLastName}`.toLowerCase().includes(q) ||
        v.note.toLowerCase().includes(q) ||
        v.doctorName.toLowerCase().includes(q) ||
        v.time.includes(q)
    );
  }

  return list;
}

export async function updateVisitStatus(
  id: string,
  status: VisitStatus
): Promise<DoctorVisit | null> {
  await ensureLoaded();
  const item = getStore().items.get(id);
  if (!item) return null;
  const updated: DoctorVisit = {
    ...item,
    status,
    updatedAt: new Date().toISOString(),
  };
  getStore().items.set(id, updated);
  await persist();
  return updated;
}

export async function getVisitById(id: string): Promise<DoctorVisit | null> {
  await ensureLoaded();
  return getStore().items.get(id) ?? null;
}

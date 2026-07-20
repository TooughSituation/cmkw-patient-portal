import { promises as fs } from "fs";
import path from "path";
import { SEED_PATIENTS } from "@/lib/doctor/seed-patients";
import type { DoctorPatient } from "@/lib/doctor/types";

/**
 * Magazyn pacjentów EDM — tylko serwer (Node / Route Handlers).
 * Klient: `lib/doctor/patients-client.ts`.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "patients.json");

type GlobalStore = {
  items: Map<string, DoctorPatient>;
  loaded: boolean;
};

function getStore(): GlobalStore {
  const g = globalThis as typeof globalThis & {
    __cmkwDoctorPatients?: GlobalStore;
  };
  if (!g.__cmkwDoctorPatients) {
    g.__cmkwDoctorPatients = { items: new Map(), loaded: false };
  }
  return g.__cmkwDoctorPatients;
}

async function ensureLoaded(): Promise<void> {
  const store = getStore();
  if (store.loaded) return;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const list = JSON.parse(raw) as DoctorPatient[];
    if (Array.isArray(list) && list.length > 0) {
      store.items = new Map(list.map((p) => [p.id, p]));
    } else {
      store.items = new Map(SEED_PATIENTS.map((p) => [p.id, p]));
      await persist();
    }
  } catch {
    store.items = new Map(SEED_PATIENTS.map((p) => [p.id, p]));
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
    // Vercel read-only
  }
}

export async function listPatients(): Promise<DoctorPatient[]> {
  await ensureLoaded();
  return Array.from(getStore().items.values()).sort((a, b) =>
    a.lastName.localeCompare(b.lastName, "pl")
  );
}

export async function getPatientById(
  id: string
): Promise<DoctorPatient | null> {
  await ensureLoaded();
  return getStore().items.get(id) ?? null;
}

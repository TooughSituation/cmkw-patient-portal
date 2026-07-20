import { promises as fs } from "fs";
import path from "path";
import { SEED_ICD10 } from "@/lib/doctor/seed-icd10";
import type { Icd10Code } from "@/lib/doctor/icd-types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "icd10.json");

type GlobalStore = {
  items: Map<string, Icd10Code>;
  loaded: boolean;
};

function getStore(): GlobalStore {
  const g = globalThis as typeof globalThis & {
    __cmkwIcd?: GlobalStore;
  };
  if (!g.__cmkwIcd) {
    g.__cmkwIcd = { items: new Map(), loaded: false };
  }
  return g.__cmkwIcd;
}

async function ensureLoaded(): Promise<void> {
  const store = getStore();
  if (store.loaded) return;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const list = JSON.parse(raw) as Icd10Code[];
    if (Array.isArray(list) && list.length > 0) {
      store.items = new Map(list.map((d) => [d.code, d]));
    } else {
      store.items = new Map(SEED_ICD10.map((d) => [d.code, d]));
      await persist();
    }
  } catch {
    store.items = new Map(SEED_ICD10.map((d) => [d.code, d]));
    await persist();
  }
  store.loaded = true;
}

async function persist(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(Array.from(getStore().items.values()), null, 2),
      "utf8"
    );
  } catch {
    // Vercel RO
  }
}

export async function listIcd10(): Promise<Icd10Code[]> {
  await ensureLoaded();
  return Array.from(getStore().items.values());
}

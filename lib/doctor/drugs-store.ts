import { promises as fs } from "fs";
import path from "path";
import { SEED_DRUGS } from "@/lib/doctor/seed-drugs";
import type { Drug } from "@/lib/doctor/drug-types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "drugs.json");

type GlobalStore = {
  items: Map<string, Drug>;
  loaded: boolean;
};

function getStore(): GlobalStore {
  const g = globalThis as typeof globalThis & {
    __cmkwDrugs?: GlobalStore;
  };
  if (!g.__cmkwDrugs) {
    g.__cmkwDrugs = { items: new Map(), loaded: false };
  }
  return g.__cmkwDrugs;
}

async function ensureLoaded(): Promise<void> {
  const store = getStore();
  if (store.loaded) return;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const list = JSON.parse(raw) as Drug[];
    if (Array.isArray(list) && list.length > 0) {
      store.items = new Map(list.map((d) => [d.id, d]));
    } else {
      store.items = new Map(SEED_DRUGS.map((d) => [d.id, d]));
      await persist();
    }
  } catch {
    store.items = new Map(SEED_DRUGS.map((d) => [d.id, d]));
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

export async function listDrugs(): Promise<Drug[]> {
  await ensureLoaded();
  return Array.from(getStore().items.values());
}

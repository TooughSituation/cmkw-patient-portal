import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/lib/auth/roles";
import {
  ALL_DEMO_ACCOUNTS,
  DEMO_SEED_VERSION,
  LEGACY_DEMO_EMAILS,
  type DemoAccountSeed,
} from "@/lib/demo-accounts";

/**
 * Tymczasowy magazyn użytkowników (bez bazy).
 * - Lokalnie: plik `.data/users.json`
 * - Serverless: pamięć procesu + re-seed demo przy starcie
 */

export type StoredUser = {
  id: string;
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  doctorId?: string;
  rodConsent: boolean;
  rodConsentAt: string;
  createdAt: string;
  seedVersion?: number;
};

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  peselMasked: string;
  role: UserRole;
  doctorId?: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  phone: string;
  password: string;
  rodConsent: boolean;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

type GlobalStore = {
  users: Map<string, StoredUser>;
  loaded: boolean;
  seeded: boolean;
};

function getStore(): GlobalStore {
  const g = globalThis as typeof globalThis & {
    __cmkwUsers?: GlobalStore;
  };
  if (!g.__cmkwUsers) {
    g.__cmkwUsers = { users: new Map(), loaded: false, seeded: false };
  }
  return g.__cmkwUsers;
}

async function ensureLoaded(): Promise<void> {
  const store = getStore();
  if (store.loaded) return;

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const list = JSON.parse(raw) as StoredUser[];
    store.users = new Map(
      list.map((u) => [
        u.email.toLowerCase(),
        { ...u, role: u.role ?? "patient" },
      ])
    );
  } catch {
    // empty
  }
  store.loaded = true;
  await ensureDemoSeeded();
}

/**
 * Upsert kont demo (zawsze aktualizuje hasła/role do wersji seeda).
 */
async function ensureDemoSeeded(): Promise<void> {
  const store = getStore();
  if (store.seeded) return;

  let changed = false;

  // Usuń stare e-maile demo
  for (const legacy of LEGACY_DEMO_EMAILS) {
    if (store.users.has(legacy)) {
      store.users.delete(legacy);
      changed = true;
    }
  }

  for (const seed of ALL_DEMO_ACCOUNTS) {
    const key = seed.email.toLowerCase();
    const existing = store.users.get(key);
    if (existing && existing.seedVersion === DEMO_SEED_VERSION) {
      continue;
    }
    const passwordHash = await bcrypt.hash(seed.password, 12);
    const now = new Date().toISOString();
    const stored: StoredUser = {
      id: existing?.id ?? seed.id,
      firstName: seed.firstName,
      lastName: seed.lastName,
      pesel: seed.pesel,
      email: key,
      phone: seed.phone,
      passwordHash,
      role: seed.role,
      doctorId: seed.doctorId,
      rodConsent: true,
      rodConsentAt: existing?.rodConsentAt ?? now,
      createdAt: existing?.createdAt ?? now,
      seedVersion: DEMO_SEED_VERSION,
    };
    store.users.set(key, stored);
    changed = true;
  }

  store.seeded = true;
  if (changed) await persist();
}

async function persist(): Promise<void> {
  const store = getStore();
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const list = Array.from(store.users.values());
    await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {
    // Vercel RO
  }
}

function toPublic(user: StoredUser): PublicUser {
  const pesel = user.pesel;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    peselMasked:
      pesel.length >= 6 ? `${pesel.slice(0, 6)}*****` : "***********",
    role: user.role ?? "patient",
    doctorId: user.doctorId,
  };
}

export async function findUserByEmail(
  email: string
): Promise<StoredUser | null> {
  await ensureLoaded();
  return getStore().users.get(email.toLowerCase()) ?? null;
}

export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<PublicUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return toPublic(user);
}

export async function createUser(
  input: RegisterInput
): Promise<{ user?: PublicUser; error?: string }> {
  await ensureLoaded();
  const email = input.email.toLowerCase().trim();
  const store = getStore();

  if (store.users.has(email)) {
    return { error: "Konto z tym adresem e-mail już istnieje." };
  }

  for (const u of store.users.values()) {
    if (u.pesel === input.pesel) {
      return { error: "Konto z tym numerem PESEL już istnieje." };
    }
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const now = new Date().toISOString();

  const stored: StoredUser = {
    id: randomUUID(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    pesel: input.pesel.replace(/\s/g, ""),
    email,
    phone: input.phone.trim(),
    passwordHash,
    role: "patient",
    rodConsent: input.rodConsent,
    rodConsentAt: now,
    createdAt: now,
  };

  store.users.set(email, stored);
  await persist();

  return { user: toPublic(stored) };
}

export async function getPublicUserById(
  id: string
): Promise<PublicUser | null> {
  await ensureLoaded();
  for (const u of getStore().users.values()) {
    if (u.id === id) return toPublic(u);
  }
  return null;
}

export function formatDemoList(accounts: DemoAccountSeed[]) {
  return accounts.map((s) => ({
    email: s.email,
    password: s.password,
    role: s.role,
    name: `${s.firstName} ${s.lastName}`,
  }));
}

export const DEMO_STAFF_ACCOUNTS = formatDemoList([
  ...ALL_DEMO_ACCOUNTS.filter((a) => a.role !== "patient"),
]);

export const DEMO_PATIENT_LIST = formatDemoList(
  ALL_DEMO_ACCOUNTS.filter((a) => a.role === "patient")
);

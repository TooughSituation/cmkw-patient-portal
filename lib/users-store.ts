import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/lib/auth/roles";

/**
 * Tymczasowy magazyn użytkowników (bez bazy).
 * - Lokalnie: plik `.data/users.json` (persist między restartami).
 * - Serverless (Vercel): pamięć procesu (ephemeral – po cold starcie puste).
 *
 * Produkcja medyczna wymaga docelowo bazy (np. Postgres) + szyfrowania PII.
 */

export type StoredUser = {
  id: string;
  firstName: string;
  lastName: string;
  /** PESEL przechowywany tylko lokalnie w pliku – nie w JWT w całości */
  pesel: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  /** Opcjonalnie powiązanie z lib/booking/doctors.ts */
  doctorId?: string;
  rodConsent: boolean;
  rodConsentAt: string;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Zmaskowany PESEL do wyświetlenia */
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
    // Brak pliku / brak zapisu – start z pustą mapą
  }
  store.loaded = true;
  await ensureStaffSeeded();
}

/**
 * Konta demo personelu (Portal Lekarza).
 * Hasła tylko do środowiska deweloperskiego.
 */
const STAFF_SEEDS: Array<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  pesel: string;
  role: UserRole;
  doctorId?: string;
}> = [
  {
    email: "jan.kiryluk@cmkw.pl",
    password: "Lekarz123!",
    firstName: "Jan",
    lastName: "Kiryluk",
    phone: "+48 85 123 45 01",
    pesel: "70010112345",
    role: "doctor",
    doctorId: "kiryluk",
  },
  {
    email: "tomas.wenta@cmkw.pl",
    password: "Lekarz123!",
    firstName: "Tomas",
    lastName: "Wenta",
    phone: "+48 85 123 45 02",
    pesel: "75021512345",
    role: "doctor",
    doctorId: "wenta",
  },
  {
    email: "recepcja@cmkw.pl",
    password: "Recep123!",
    firstName: "Anna",
    lastName: "Nowak",
    phone: "+48 85 123 45 00",
    pesel: "90031012345",
    role: "reception",
  },
  {
    email: "admin@cmkw.pl",
    password: "Admin123!",
    firstName: "Admin",
    lastName: "CMKW",
    phone: "+48 85 123 45 99",
    pesel: "80010112345",
    role: "admin",
  },
];

async function ensureStaffSeeded(): Promise<void> {
  const store = getStore();
  if (store.seeded) return;

  let added = false;
  for (const seed of STAFF_SEEDS) {
    const key = seed.email.toLowerCase();
    if (store.users.has(key)) continue;

    const passwordHash = await bcrypt.hash(seed.password, 12);
    const now = new Date().toISOString();
    const stored: StoredUser = {
      id: randomUUID(),
      firstName: seed.firstName,
      lastName: seed.lastName,
      pesel: seed.pesel,
      email: key,
      phone: seed.phone,
      passwordHash,
      role: seed.role,
      doctorId: seed.doctorId,
      rodConsent: true,
      rodConsentAt: now,
      createdAt: now,
    };
    store.users.set(key, stored);
    added = true;
  }

  store.seeded = true;
  if (added) await persist();
}

async function persist(): Promise<void> {
  const store = getStore();
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const list = Array.from(store.users.values());
    await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {
    // Na Vercel FS jest read-only – ignorujemy, zostaje memory
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

  // Unikalność PESEL (lokalny magazyn)
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

/** Konta demo do dokumentacji / dev login */
export const DEMO_STAFF_ACCOUNTS = STAFF_SEEDS.map((s) => ({
  email: s.email,
  password: s.password,
  role: s.role,
  name: `${s.firstName} ${s.lastName}`,
}));

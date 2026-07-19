import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

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
};

function getStore(): GlobalStore {
  const g = globalThis as typeof globalThis & {
    __cmkwUsers?: GlobalStore;
  };
  if (!g.__cmkwUsers) {
    g.__cmkwUsers = { users: new Map(), loaded: false };
  }
  return g.__cmkwUsers;
}

async function ensureLoaded(): Promise<void> {
  const store = getStore();
  if (store.loaded) return;

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const list = JSON.parse(raw) as StoredUser[];
    store.users = new Map(list.map((u) => [u.email.toLowerCase(), u]));
  } catch {
    // Brak pliku / brak zapisu – start z pustą mapą
  }
  store.loaded = true;
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

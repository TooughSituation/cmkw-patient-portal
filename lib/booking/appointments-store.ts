import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type AppointmentStatus = "pending_payment" | "confirmed" | "cancelled";

export type Appointment = {
  id: string;
  userId: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  pricePln: number;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  note: string;
  status: AppointmentStatus;
  createdAt: string;
  paidAt?: string;
};

export type CreateAppointmentInput = Omit<
  Appointment,
  "id" | "createdAt" | "status" | "paidAt"
> & {
  status?: AppointmentStatus;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");

type GlobalStore = {
  items: Map<string, Appointment>;
  loaded: boolean;
};

function getStore(): GlobalStore {
  const g = globalThis as typeof globalThis & {
    __cmkwAppointments?: GlobalStore;
  };
  if (!g.__cmkwAppointments) {
    g.__cmkwAppointments = { items: new Map(), loaded: false };
  }
  return g.__cmkwAppointments;
}

async function ensureLoaded(): Promise<void> {
  const store = getStore();
  if (store.loaded) return;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const list = JSON.parse(raw) as Appointment[];
    store.items = new Map(list.map((a) => [a.id, a]));
  } catch {
    // empty
  }
  store.loaded = true;
  await ensureDemoAppointments();
}

/** Wizyty demo powiązane z kontami pacjentów (stałe userId). */
async function ensureDemoAppointments(): Promise<void> {
  const store = getStore();
  if (store.items.has("demo-apt-jan-1")) return;

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const demos: Appointment[] = [
    {
      id: "demo-apt-jan-1",
      userId: "user-patient-jan",
      patientFirstName: "Jan",
      patientLastName: "Kowalski",
      patientEmail: "jan.kowalski@email.pl",
      patientPhone: "500111001",
      doctorId: "kiryluk",
      doctorName: "Dr n. med. Jan Kiryluk",
      serviceId: "konsultacja-ortopedyczna",
      serviceName: "Konsultacja ortopedyczna",
      pricePln: 250,
      date: today,
      time: "10:00",
      note: "Ból kolana — wizyta demo",
      status: "confirmed",
      createdAt: now,
      paidAt: now,
    },
    {
      id: "demo-apt-tomasz-1",
      userId: "user-patient-tomasz",
      patientFirstName: "Tomasz",
      patientLastName: "Nowak",
      patientEmail: "tomasz.nowak@email.pl",
      patientPhone: "501222003",
      doctorId: "wenta",
      doctorName: "Lek. Tomasz Wenta",
      serviceId: "konsultacja-ortopedyczna",
      serviceName: "Konsultacja ortopedyczna",
      pricePln: 250,
      date: today,
      time: "11:30",
      note: "Kontrola po urazie — demo",
      status: "confirmed",
      createdAt: now,
      paidAt: now,
    },
    {
      id: "demo-apt-anna-1",
      userId: "user-patient-anna",
      patientFirstName: "Anna",
      patientLastName: "Nowicka",
      patientEmail: "anna.nowicka@email.pl",
      patientPhone: "502333004",
      doctorId: "frankowski",
      doctorName: "Lek. Paweł Frankowski",
      serviceId: "usg",
      serviceName: "USG stawu",
      pricePln: 180,
      date: today,
      time: "14:00",
      note: "USG barku — demo",
      status: "confirmed",
      createdAt: now,
      paidAt: now,
    },
  ];

  for (const a of demos) {
    store.items.set(a.id, a);
  }
  await persist();
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

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<Appointment> {
  await ensureLoaded();
  const now = new Date().toISOString();
  const appointment: Appointment = {
    ...input,
    id: randomUUID(),
    status: input.status ?? "confirmed",
    createdAt: now,
    paidAt: input.status === "confirmed" || !input.status ? now : undefined,
  };
  getStore().items.set(appointment.id, appointment);
  await persist();
  return appointment;
}

export async function listAppointmentsByUser(
  userId: string
): Promise<Appointment[]> {
  await ensureLoaded();
  return Array.from(getStore().items.values())
    .filter((a) => a.userId === userId)
    .sort((a, b) => {
      const da = `${a.date}T${a.time}`;
      const db = `${b.date}T${b.time}`;
      return da.localeCompare(db);
    });
}

export async function getAppointmentById(
  id: string
): Promise<Appointment | null> {
  await ensureLoaded();
  return getStore().items.get(id) ?? null;
}

export async function cancelAppointment(
  id: string,
  userId: string
): Promise<Appointment | null> {
  await ensureLoaded();
  const item = getStore().items.get(id);
  if (!item || item.userId !== userId) return null;
  item.status = "cancelled";
  getStore().items.set(id, item);
  await persist();
  return item;
}

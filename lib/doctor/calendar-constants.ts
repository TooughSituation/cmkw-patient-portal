export type CalMode = "day" | "week" | "month";

export const CAL_MODE_STORAGE_KEY = "cmkw-doctor-cal-mode-v1";
export const CAL_DOCTOR_FILTER_KEY = "cmkw-doctor-cal-doctor-v1";

/** Oś czasu kalendarza (minuty od północy) */
export const DAY_START_MIN = 8 * 60; // 08:00
export const DAY_END_MIN = 18 * 60; // 18:00
export const SLOT_STEP_MIN = 15;

export const STATUS_COLORS: Record<
  string,
  { bar: string; bg: string; border: string; label: string }
> = {
  scheduled: {
    bar: "#10b981",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Zaplanowana",
  },
  confirmed: {
    bar: "#0ea5e9",
    bg: "bg-sky-50",
    border: "border-sky-200",
    label: "Potwierdzona",
  },
  teleconfirmed: {
    bar: "#8b5cf6",
    bg: "bg-violet-50",
    border: "border-violet-200",
    label: "Telepotwierdzona",
  },
  in_progress: {
    bar: "#f59e0b",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "W trakcie",
  },
  completed: {
    bar: "#94a3b8",
    bg: "bg-slate-100",
    border: "border-slate-200",
    label: "Zakończona",
  },
  cancelled: {
    bar: "#f87171",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Odwołana",
  },
};

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function buildTimeSlots(
  startMin = DAY_START_MIN,
  endMin = DAY_END_MIN,
  step = SLOT_STEP_MIN
): string[] {
  const out: string[] = [];
  for (let t = startMin; t < endMin; t += step) {
    out.push(minutesToTime(t));
  }
  return out;
}

export function slotDropId(date: string, time: string, doctorId?: string): string {
  return doctorId
    ? `slot|${date}|${time}|${doctorId}`
    : `slot|${date}|${time}`;
}

export function parseSlotDropId(
  id: string
): { date: string; time: string; doctorId?: string } | null {
  if (!id.startsWith("slot|")) return null;
  const parts = id.split("|");
  if (parts.length < 3) return null;
  return {
    date: parts[1]!,
    time: parts[2]!,
    doctorId: parts[3],
  };
}

export const KEYBOARD_CHEATSHEET: Array<{ keys: string; action: string }> = [
  { keys: "N", action: "Szybka wizyta" },
  { keys: "F", action: "Focus wyszukiwarki" },
  { keys: "T", action: "Dziś" },
  { keys: "← →", action: "Poprzedni / następny dzień lub tydzień" },
  { keys: "1 / 2 / 3", action: "Dzień / Tydzień / Miesiąc" },
  { keys: "?", action: "Pokaż skróty" },
  { keys: "Esc", action: "Zamknij menu / dialog" },
  { keys: "2× klik", action: "Otwórz kartę wizyty" },
  { keys: "PPM", action: "Menu kontekstowe wizyty" },
];

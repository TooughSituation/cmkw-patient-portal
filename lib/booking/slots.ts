import {
  addDays,
  format,
  isBefore,
  isSunday,
  isSaturday,
  startOfDay,
  parseISO,
} from "date-fns";
import { pl } from "date-fns/locale";
import { doctors, getDoctorById } from "@/lib/booking/doctors";

/** Godziny pracy: 8:00–18:00, sloty co 30 min (ostatni start 17:30). */
export const SLOT_START_HOUR = 8;
export const SLOT_END_HOUR = 18;
export const SLOT_INTERVAL_MIN = 30;
/** Horyzont rezerwacji (dni od dziś). */
export const BOOKING_HORIZON_DAYS = 40;

export type TimeSlot = {
  time: string; // "HH:mm"
  available: boolean;
};

/** Deterministyczny PRNG (mulberry32) na podstawie seeda. */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateDayTimes(): string[] {
  const times: string[] = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MIN) {
      if (h === SLOT_END_HOUR - 0 && m > 0) break;
      // last slot starts at 17:30
      if (h === 17 && m > 30) continue;
      if (h === 18) continue;
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  // 8:00 ... 17:30
  return times.filter((t) => {
    const [hh, mm] = t.split(":").map(Number);
    const minutes = hh! * 60 + mm!;
    return minutes >= 8 * 60 && minutes <= 17 * 60 + 30;
  });
}

/**
 * Losowa (deterministyczna) zajętość slotów dla lekarza i dnia.
 * Kiryluk (availabilityFactor ~0.22) ma najmniej wolnych terminów.
 */
export function getSlotsForDay(
  doctorId: string,
  dateIso: string // yyyy-MM-dd
): TimeSlot[] {
  const doctor = getDoctorById(doctorId);
  const factor = doctor?.availabilityFactor ?? 0.5;
  const times = generateDayTimes();
  const rng = mulberry32(hashSeed(`${doctorId}:${dateIso}`));

  const day = parseISO(dateIso);
  // Weekend: mniej slotów (tylko sobota poranek z małą szansą, niedziela zamknięte)
  if (isSunday(day)) {
    return times.map((time) => ({ time, available: false }));
  }

  return times.map((time) => {
    let chance = factor;
    if (isSaturday(day)) {
      chance *= 0.35;
      // sobota tylko do 13:00
      const [hh] = time.split(":").map(Number);
      if (hh! >= 13) return { time, available: false };
    }
    // poranne i późne godziny trochę wolniejsze
    const [hh] = time.split(":").map(Number);
    if (hh! >= 16) chance *= 0.75;
    if (hh! === 8) chance *= 0.85;

    return { time, available: rng() < chance };
  });
}

export function getAvailableDates(
  doctorId: string,
  from: Date = new Date(),
  days: number = BOOKING_HORIZON_DAYS
): string[] {
  const result: string[] = [];
  const start = startOfDay(from);
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    // nie pokazuj przeszłości (dziś tylko przyszłe sloty filtrujemy osobno)
    if (isBefore(d, startOfDay(new Date())) && i > 0) continue;
    const iso = format(d, "yyyy-MM-dd");
    const slots = getSlotsForDay(doctorId, iso);
    if (slots.some((s) => s.available)) {
      result.push(iso);
    }
  }
  return result;
}

export function formatDatePl(iso: string): string {
  return format(parseISO(iso), "d MMMM yyyy (EEEE)", { locale: pl });
}

export function isSlotInPast(dateIso: string, time: string): boolean {
  const now = new Date();
  const [hh, mm] = time.split(":").map(Number);
  const slot = parseISO(dateIso);
  slot.setHours(hh!, mm!, 0, 0);
  return isBefore(slot, now);
}

export function doctorAvailabilityLabel(doctorId: string): string {
  const d = doctors.find((x) => x.id === doctorId);
  if (!d) return "";
  if (d.availabilityFactor < 0.3) return "Mało wolnych terminów";
  if (d.availabilityFactor < 0.55) return "Umiarkowana dostępność";
  return "Więcej wolnych terminów";
}

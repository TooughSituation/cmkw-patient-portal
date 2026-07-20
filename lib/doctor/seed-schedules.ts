import {
  defaultWeekDays,
  type DoctorSchedule,
  type ScheduleException,
} from "@/lib/doctor/schedule-types";
import { format, addDays } from "date-fns";

const now = new Date().toISOString();

function ex(
  id: string,
  offsetDays: number,
  type: ScheduleException["type"],
  note: string,
  hours?: { startTime: string; endTime: string }
): ScheduleException {
  return {
    id,
    date: format(addDays(new Date(), offsetDays), "yyyy-MM-dd"),
    type,
    note,
    ...hours,
  };
}

function schedule(
  partial: Omit<DoctorSchedule, "updatedAt" | "days" | "exceptions"> & {
    days?: DoctorSchedule["days"];
    exceptions?: ScheduleException[];
  }
): DoctorSchedule {
  return {
    days: partial.days ?? defaultWeekDays(),
    exceptions: partial.exceptions ?? [],
    updatedAt: now,
    ...partial,
  };
}

/**
 * Realistyczne grafiki — Kiryluk najmniej godzin (Pn, Śr, Pt 9–14).
 */
export const SEED_SCHEDULES: DoctorSchedule[] = [
  // Kiryluk — tylko Białystok, 3 dni, krótsze godziny
  schedule({
    id: "sch-kiryluk-bialystok",
    staffId: "st-kiryluk",
    doctorId: "kiryluk",
    branchId: "bialystok",
    days: defaultWeekDays(20, "09:00", "14:00", [1, 3, 5]),
    exceptions: [
      ex("ex-k1", 10, "urlop", "Kongres ortopedyczny"),
      ex("ex-k2", 11, "urlop", "Kongres ortopedyczny"),
    ],
  }),

  // Wenta — Białystok Pn–Pt 8–16
  schedule({
    id: "sch-wenta-bialystok",
    staffId: "st-wenta",
    doctorId: "wenta",
    branchId: "bialystok",
    days: defaultWeekDays(20, "08:00", "16:00", [1, 2, 3, 4, 5]),
    exceptions: [ex("ex-w1", 18, "wolne", "Dzień szkoleniowy")],
  }),
  // Wenta — Hajnówka wtorek + czwartek
  schedule({
    id: "sch-wenta-hajnowka",
    staffId: "st-wenta",
    doctorId: "wenta",
    branchId: "hajnowka",
    days: defaultWeekDays(20, "09:00", "15:00", [2, 4]),
  }),

  // Frankowski — Białystok
  schedule({
    id: "sch-frankowski-bialystok",
    staffId: "st-frankowski",
    doctorId: "frankowski",
    branchId: "bialystok",
    days: defaultWeekDays(15, "08:00", "15:00", [1, 2, 3, 4, 5]),
  }),

  // Zawadzki — Białystok Pn–Śr
  schedule({
    id: "sch-zawadzki-bialystok",
    staffId: "st-zawadzki",
    doctorId: "zawadzki",
    branchId: "bialystok",
    days: defaultWeekDays(20, "10:00", "18:00", [1, 2, 3]),
  }),
  // Zawadzki — Hajnówka Pt
  schedule({
    id: "sch-zawadzki-hajnowka",
    staffId: "st-zawadzki",
    doctorId: "zawadzki",
    branchId: "hajnowka",
    days: defaultWeekDays(20, "08:00", "14:00", [5]),
  }),

  // Torba — rehabilitacja, dłuższe sloty
  schedule({
    id: "sch-torba-bialystok",
    staffId: "st-torba",
    doctorId: "torba",
    branchId: "bialystok",
    days: defaultWeekDays(30, "08:00", "16:00", [1, 2, 3, 4, 5]),
    exceptions: [
      ex("ex-t1", 7, "dyzur", "Dyżur popołudniowy", {
        startTime: "16:00",
        endTime: "19:00",
      }),
    ],
  }),

  // Sammoudi — najwięcej: Białystok + Hajnówka
  schedule({
    id: "sch-sammoudi-bialystok",
    staffId: "st-sammoudi",
    doctorId: "sammoudi",
    branchId: "bialystok",
    days: defaultWeekDays(15, "08:00", "18:00", [1, 3, 5]),
  }),
  schedule({
    id: "sch-sammoudi-hajnowka",
    staffId: "st-sammoudi",
    doctorId: "sammoudi",
    branchId: "hajnowka",
    days: defaultWeekDays(15, "08:00", "16:00", [2, 4, 6]).map((d) =>
      d.weekday === 6
        ? { ...d, enabled: true, startTime: "09:00", endTime: "13:00", slotMinutes: 20 }
        : d
    ),
  }),
];

/** 0 = niedziela … 6 = sobota (jak Date.getDay()) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DaySchedule = {
  weekday: Weekday;
  enabled: boolean;
  /** HH:mm */
  startTime: string;
  /** HH:mm */
  endTime: string;
  slotMinutes: number;
};

export type ScheduleExceptionType = "urlop" | "wolne" | "dyzur";

export type ScheduleException = {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  type: ScheduleExceptionType;
  note: string;
  /** tylko dla dyżuru — opcjonalne nadpisanie godzin */
  startTime?: string;
  endTime?: string;
};

/**
 * Grafik pracy: lekarz × oddział.
 * Jeden lekarz może mieć osobny grafik per oddział.
 */
export type DoctorSchedule = {
  id: string;
  staffId: string;
  doctorId: string;
  branchId: string;
  days: DaySchedule[];
  exceptions: ScheduleException[];
  updatedAt: string;
};

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Niedziela",
  1: "Poniedziałek",
  2: "Wtorek",
  3: "Środa",
  4: "Czwartek",
  5: "Piątek",
  6: "Sobota",
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  0: "Nd",
  1: "Pn",
  2: "Wt",
  3: "Śr",
  4: "Cz",
  5: "Pt",
  6: "So",
};

export const EXCEPTION_LABELS: Record<ScheduleExceptionType, string> = {
  urlop: "Urlop",
  wolne: "Dzień wolny",
  dyzur: "Dyżur (nadgodziny)",
};

export function defaultWeekDays(
  slotMinutes = 20,
  start = "08:00",
  end = "16:00",
  enabledDays: Weekday[] = [1, 2, 3, 4, 5]
): DaySchedule[] {
  const enabled = new Set(enabledDays);
  return ([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((weekday) => ({
    weekday,
    enabled: enabled.has(weekday),
    startTime: start,
    endTime: end,
    slotMinutes,
  }));
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

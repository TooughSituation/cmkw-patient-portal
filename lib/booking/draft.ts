/** Draft rezerwacji w sessionStorage (przed płatnością). */

export const BOOKING_DRAFT_KEY = "cmkw_booking_draft";
export const APPOINTMENTS_LS_KEY = "cmkw_appointments";

export type BookingDraft = {
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  pricePln: number;
  date: string;
  time: string;
  note: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone: string;
};

export function saveBookingDraft(draft: BookingDraft): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
}

export function loadBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BOOKING_DRAFT_KEY);
}

/** Lokalny backup listy wizyt (localStorage) — sync po udanej płatności. */
export function appendLocalAppointment(appointment: unknown): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(APPOINTMENTS_LS_KEY);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    list.push(appointment);
    localStorage.setItem(APPOINTMENTS_LS_KEY, JSON.stringify(list));
  } catch {
    // ignore quota
  }
}

export function loadLocalAppointments<T = unknown>(): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPOINTMENTS_LS_KEY);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

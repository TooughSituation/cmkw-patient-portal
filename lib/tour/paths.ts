import type { TourPath, TourPathId } from "@/lib/tour/types";
import { PATIENT_TOUR_STEPS } from "@/lib/tour/steps-patient";
import { DOCTOR_TOUR_STEPS } from "@/lib/tour/steps-doctor";
import { FACILITY_TOUR_STEPS } from "@/lib/tour/steps-facility";

export const TOUR_PATHS: TourPath[] = [
  {
    id: "patient",
    title: "Przewodnik Pacjenta",
    description:
      "Logowanie, dashboard, umawianie wizyty, moje wizyty, płatność mock i wylogowanie.",
    roles: ["patient"],
    steps: PATIENT_TOUR_STEPS,
  },
  {
    id: "doctor",
    title: "Przewodnik Lekarza (EDM)",
    description:
      "Kalendarz DnD, skróty, karta wizyty, pacjenci, leki, ICD, terminy, izolacja danych.",
    roles: ["doctor", "admin", "reception", "facility"],
    steps: DOCTOR_TOUR_STEPS,
  },
  {
    id: "facility",
    title: "Przewodnik Placówki",
    description:
      "Przełącznik lekarzy, Administracja, udostępnianie kalendarzy, pełne statystyki.",
    roles: ["facility"],
    steps: FACILITY_TOUR_STEPS,
  },
  {
    id: "full",
    title: "Pełny przewodnik EDM",
    description:
      "Połączona ścieżka: funkcje lekarza + placówki (dla konta facility).",
    roles: ["facility"],
    steps: [
      ...FACILITY_TOUR_STEPS.filter((s) => s.id !== "f-tour"),
      ...DOCTOR_TOUR_STEPS.filter(
        (s) =>
          !["d-login", "d-shell", "d-tour"].includes(s.id) &&
          !s.id.startsWith("d-login")
      ),
      {
        id: "full-end",
        target: '[data-tour="doctor-nav-przewodnik"]',
        title: "Koniec pełnego przewodnika",
        description:
          "Przeszedłeś kluczowe funkcje placówki i EDM. Wróć tu w każdej chwili.",
        href: "/doctor/przewodnik",
      },
    ],
  },
];

export function getTourPath(id: TourPathId): TourPath | undefined {
  return TOUR_PATHS.find((p) => p.id === id);
}

export function toursForRole(
  role: string | undefined | null
): TourPath[] {
  if (!role) return [];
  return TOUR_PATHS.filter((p) =>
    p.roles.includes(role as TourPath["roles"][number])
  );
}

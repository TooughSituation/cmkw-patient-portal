import type { TourStep } from "@/lib/tour/types";

/** Przewodnik Portal Pacjenta (uruchamiany po zalogowaniu) */
export const PATIENT_TOUR_STEPS: TourStep[] = [
  {
    id: "p-dashboard",
    target: '[data-tour="patient-dashboard"]',
    title: "Dashboard pacjenta",
    description:
      "Po zalogowaniu (/login lub rejestracja z PESEL+RODO) widzisz powitanie i skróty. Stąd umawiasz wizyty i przeglądasz rezerwacje.",
    href: "/portal",
  },
  {
    id: "p-book-cta",
    target: '[data-tour="patient-book-cta"]',
    title: "Umów wizytę",
    description:
      "Główny przycisk rezerwacji — uruchamia kreator umawiania wizyty online.",
    href: "/portal",
  },
  {
    id: "p-appointments",
    target: '[data-tour="patient-my-appointments"]',
    title: "Moje wizyty",
    description:
      "Lista Twoich rezerwacji: status, data, lekarz i usługa. Tutaj wracasz do szczegółów po rezerwacji.",
    href: "/portal",
  },
  {
    id: "p-profile",
    target: '[data-tour="patient-profile"]',
    title: "Dane konta",
    description:
      "Podgląd danych z sesji (PESEL tylko zmaskowany). Pełna edycja profilu — w kolejnych etapach.",
    href: "/portal",
  },
  {
    id: "p-wizard",
    target: '[data-tour="patient-booking-wizard"]',
    title: "Kreator rezerwacji",
    description:
      "Krok po kroku: usługa → lekarz → termin → dane. Po wyborze terminu przejdziesz do płatności (mock).",
    href: "/portal/umow-wizyte",
  },
  {
    id: "p-payment",
    target: '[data-tour="patient-booking-wizard"]',
    title: "Płatność (mock)",
    description:
      "Po wyborze terminu przejdziesz do mock płatności. W produkcji będzie prawdziwa bramka — w demo środki nie są pobierane.",
    href: "/portal/umow-wizyte",
  },
  {
    id: "p-logout",
    target: '[data-tour="patient-logout"]',
    title: "Wylogowanie",
    description:
      "Bezpiecznie zakończ sesję. Przy kolejnym wejściu zalogujesz się ponownie przez /login (lub rejestracja).",
    href: "/portal",
  },
  {
    id: "p-tour-hub",
    target: '[data-tour="patient-tour-hub"]',
    title: "Przewodnik",
    description:
      "W każdej chwili możesz ponownie uruchomić ten przewodnik z zakładki Przewodnik.",
    href: "/portal/przewodnik",
  },
];

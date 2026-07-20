import type { TourStep } from "@/lib/tour/types";

/** Przewodnik poziomu Placówka (facility) */
export const FACILITY_TOUR_STEPS: TourStep[] = [
  {
    id: "f-badge",
    target: '[data-tour="doctor-role-badge"]',
    title: "Widok placówki",
    description:
      "Konto cmkw@cmkw.pl — badge „Widok placówki”. Widzisz wszystkich lekarzy, wszystkie wizyty i Administrację.",
    href: "/doctor",
  },
  {
    id: "f-view-as",
    target: '[data-tour="facility-view-as"]',
    title: "Przełącznik lekarzy",
    description:
      "Wybierz „Wszyscy lekarze” albo konkretnego lekarza — kalendarz i dane filtrują się od razu.",
    href: "/doctor",
  },
  {
    id: "f-sidebar",
    target: '[data-tour="facility-doctor-sidebar"]',
    title: "Awatary lekarzy",
    description:
      "Pasek po prawej (duży ekran): szybki filtr po lekarzu. Ikona budynku = wszyscy. Tylko facility/reception.",
    href: "/doctor",
  },
  {
    id: "f-dashboard",
    target: '[data-tour="doctor-dashboard-insights"]',
    title: "Statystyki operacyjne",
    description:
      "Kafelki podsumowania obejmują całą placówkę (lub wybranego lekarza po filtrze).",
    href: "/doctor",
  },
  {
    id: "f-cal-filter",
    target: '[data-tour="facility-doctor-filter"]',
    title: "Filtr lekarza w kalendarzu",
    description:
      "Dodatkowy select w toolbarze kalendarza — ten sam zakres co przełącznik w topbarze.",
    href: "/doctor",
  },
  {
    id: "f-admin-nav",
    target: '[data-tour="doctor-nav-admin"]',
    title: "Administracja",
    description:
      "Zakładka Admin jest widoczna wyłącznie dla placówki. Lekarze jej nie widzą.",
    href: "/doctor/admin",
  },
  {
    id: "f-admin-stats",
    target: '[data-tour="admin-panel"]',
    title: "Panel administracyjny",
    description:
      "Statystyki placówki, dane firmy, ustawienia, pracownicy, grafiki, gabinety, typy wizyt.",
    href: "/doctor/admin",
  },
  {
    id: "f-sharing",
    target: '[data-tour="admin-sharing"]',
    title: "Udostępnianie kalendarzy",
    description:
      "Matryca: kto może podglądać czyj kalendarz. Seed demo: Wenta → Kiryluk (tylko podgląd, bez edycji).",
    href: "/doctor/admin",
  },
  {
    id: "f-all-visits",
    target: '[data-tour="doctor-visits-list"]',
    title: "Wszystkie wizyty",
    description:
      "Jako placówka widzisz wizyty wszystkich lekarzy i możesz filtrować po lekarzu.",
    href: "/doctor/wizyty",
  },
  {
    id: "f-tour",
    target: '[data-tour="doctor-nav-przewodnik"]',
    title: "Koniec przewodnika placówki",
    description:
      "Możesz też uruchomić Przewodnik Lekarza, by zobaczyć perspektywę klinicysty. Powodzenia!",
    href: "/doctor/przewodnik",
  },
];

import type { TourStep } from "@/lib/tour/types";

/** Przewodnik Portal Lekarza (EDM) — rola doctor / admin kliniczny */
export const DOCTOR_TOUR_STEPS: TourStep[] = [
  {
    id: "d-shell",
    target: '[data-tour="doctor-navbar"]',
    title: "Portal Lekarza (EDM)",
    description:
      "Zalogowałeś się przez /doctor/login (osobne od pacjenta). Górny pasek: logo CMKW EDM, oddział, konto — jasny brand, nie dark MyDr.",
    href: "/doctor",
  },
  {
    id: "d-branch",
    target: '[data-tour="doctor-branch-switcher"]',
    title: "Przełącznik oddziałów",
    description:
      "Filtruj widok: Białystok, Hajnówka lub Wszystkie. Wpływa na kalendarz, wizyty i pacjentów.",
    href: "/doctor",
  },
  {
    id: "d-role-badge",
    target: '[data-tour="doctor-role-badge"]',
    title: "Twoja rola",
    description:
      "Badge pokazuje rolę (Lekarz / Administrator). Jako lekarz widzisz wyłącznie swój kalendarz — bez awatarów innych.",
    href: "/doctor",
  },
  {
    id: "d-isolation",
    target: '[data-tour="doctor-calendar-title"]',
    title: "Izolacja danych",
    description:
      "Domyślnie widzisz tylko własne wizyty i pacjentów powiązanych z Twoim grafikiem. Cudze kalendarze — tylko po jawnym udostępnieniu.",
    href: "/doctor",
  },
  {
    id: "d-dashboard",
    target: '[data-tour="doctor-dashboard-insights"]',
    title: "Dzisiejsze podsumowanie",
    description:
      "Kafelki: dzisiejsze wizyty, do potwierdzenia, w trakcie. Kliknięcie filtruje kalendarz.",
    href: "/doctor",
  },
  {
    id: "d-cal-modes",
    target: '[data-tour="doctor-cal-modes"]',
    title: "Widoki kalendarza",
    description:
      "Przełącznik Dzień | Tydzień | Miesiąc (skróty 1 / 2 / 3). Preferencja zapamiętuje się w przeglądarce.",
    href: "/doctor",
  },
  {
    id: "d-cal-nav",
    target: '[data-tour="doctor-cal-nav"]',
    title: "Nawigacja dat",
    description:
      "Strzałki ← → i przycisk Dziś (skrót T) — szybka zmiana dnia, tygodnia lub miesiąca.",
    href: "/doctor",
  },
  {
    id: "d-dnd",
    target: '[data-tour="doctor-cal-timeline"]',
    title: "Drag & Drop wizyt",
    description:
      "Przeciągnij wizytę na wolny slot (dzień/tydzień). System waliduje grafik i zajętość. Po dropie — potwierdzenie i toast.",
    href: "/doctor",
  },
  {
    id: "d-shortcuts",
    target: '[data-tour="doctor-cal-help"]',
    title: "Skróty klawiszowe",
    description:
      "N = szybka wizyta, F = szukaj, T = dziś, ? = cheatsheet, Esc = zamknij. Przyśpieszają codzienną pracę.",
    href: "/doctor",
  },
  {
    id: "d-quick",
    target: '[data-tour="doctor-quick-visit"]',
    title: "Szybka wizyta",
    description:
      "Dodaj wizytę bez wychodzenia z kalendarza: pacjent, data, godzina, typ. Walidacja grafiku działa od razu.",
    href: "/doctor",
  },
  {
    id: "d-context",
    target: '[data-tour="doctor-cal-timeline"]',
    title: "Menu kontekstowe i 2× klik",
    description:
      "PPM na wizycie: status, duplikuj, anuluj, karta. Dwuklik otwiera pełną kartę wizyty. Hover = tooltip z PESEL maskowanym.",
    href: "/doctor",
  },
  {
    id: "d-nav-tabs",
    target: '[data-tour="doctor-tabs"]',
    title: "Menu główne EDM",
    description:
      "Kalendarz, Terminy, Wizyty, Pacjenci, Leki, ICD-10, Kalkulatory — i Przewodnik. Admin tylko dla placówki.",
    href: "/doctor",
  },
  {
    id: "d-visits",
    target: '[data-tour="doctor-visits-list"]',
    title: "Lista wizyt",
    description:
      "Tabela z filtrami (data, status, pacjent). Paginacja i szybkie akcje statusu.",
    href: "/doctor/wizyty",
  },
  {
    id: "d-visit-card",
    target: '[data-tour="doctor-visits-list"]',
    title: "Karta wizyty EDM",
    description:
      "Z listy otwórz wizytę — pełna dokumentacja: wywiad, ICD, leki, skierowania, dokumenty, historia i autosave notatki.",
    href: "/doctor/wizyty",
  },
  {
    id: "d-patients",
    target: '[data-tour="doctor-patients-list"]',
    title: "Pacjenci",
    description:
      "Lista z wyszukiwaniem, filtrami i sortowaniem. Klik w nazwisko → karta pacjenta z historią wizyt.",
    href: "/doctor/pacjenci",
  },
  {
    id: "d-drugs",
    target: '[data-tour="doctor-drugs"]',
    title: "Baza leków",
    description:
      "Szukaj leków, szczegóły, powiązania z ICD. Picker leków w karcie wizyty korzysta z tej bazy.",
    href: "/doctor/leki",
  },
  {
    id: "d-icd",
    target: '[data-tour="doctor-icd"]',
    title: "ICD-10",
    description:
      "Kody rozpoznań z filtrami i kopiowaniem. Używane w karcie wizyty przy zakończeniu wizyty.",
    href: "/doctor/icd10",
  },
  {
    id: "d-calc",
    target: '[data-tour="doctor-calculators"]',
    title: "Kalkulatory",
    description:
      "BMI, eGFR, BASDAI, CHA₂DS₂-VASc i inne — szybkie narzędzia kliniczne w EDM.",
    href: "/doctor/kalkulatory",
  },
  {
    id: "d-slots",
    target: '[data-tour="doctor-slots-search"]',
    title: "Wyszukiwarka terminów",
    description:
      "Wolne sloty z grafiku minus zajęte wizyty. Rezerwacja tworzy wizytę w EDM.",
    href: "/doctor/terminy",
  },
  {
    id: "d-tele",
    target: '[data-tour="doctor-teleconfirm"]',
    title: "Telepotwierdzenia",
    description:
      "Panel wizyt wymagających potwierdzenia (SMS/IVR mock). Potwierdź, wyślij SMS lub odwołaj.",
    href: "/doctor",
  },
  {
    id: "d-schedules-hint",
    target: '[data-tour="doctor-cal-timeline"]',
    title: "Grafiki pracy",
    description:
      "Sloty i DnD respektują grafik z Administracji placówki. Urlopy i poza godzinami blokują drop.",
    href: "/doctor",
  },
  {
    id: "d-tour",
    target: '[data-tour="doctor-nav-przewodnik"]',
    title: "Przewodnik",
    description:
      "Zawsze możesz wrócić tutaj i uruchomić ścieżkę ponownie. Miłej pracy w CMKW EDM!",
    href: "/doctor/przewodnik",
  },
];

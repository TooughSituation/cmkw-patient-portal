export type TourPathId = "patient" | "doctor" | "facility" | "full";

export type TourStep = {
  id: string;
  /** Selektor CSS, np. [data-tour="doctor-nav-kalendarz"] */
  target: string;
  title: string;
  description: string;
  /** Nawigacja przed fokusem */
  href?: string;
};

export type TourPath = {
  id: TourPathId;
  title: string;
  description: string;
  /** Role, które mogą uruchomić ten przewodnik */
  roles: Array<"patient" | "doctor" | "admin" | "reception" | "facility">;
  steps: TourStep[];
};

export const TOUR_STORAGE_PREFIX = "cmkw-tour-seen-v1";

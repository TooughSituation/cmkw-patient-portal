export type ServiceCategory = "ortopedia" | "fizjoterapia" | "zabiegi" | "inne";

export type Service = {
  id: string;
  name: string;
  description: string;
  pricePln: number;
  durationMin: number;
  category: ServiceCategory;
};

/**
 * Cennik orientacyjny (Białystok / CMKW) — do potwierdzenia z placówką.
 */
export const services: Service[] = [
  {
    id: "konsultacja-ortopedyczna",
    name: "Konsultacja ortopedyczna",
    description: "Badanie, wywiad, zalecenia i plan leczenia.",
    pricePln: 250,
    durationMin: 30,
    category: "ortopedia",
  },
  {
    id: "konsultacja-usg",
    name: "Konsultacja + USG",
    description: "Konsultacja ortopedyczna z ultrasonografią narządu ruchu.",
    pricePln: 380,
    durationMin: 45,
    category: "ortopedia",
  },
  {
    id: "usg-narzadu-ruchu",
    name: "USG narządu ruchu",
    description: "Diagnostyka ultrasonograficzna stawów i tkanek miękkich.",
    pricePln: 180,
    durationMin: 30,
    category: "ortopedia",
  },
  {
    id: "prp",
    name: "Terapia PRP (osocze bogatopłytkowe)",
    description: "Iniekcja osocza bogatopłytkowego w schorzeniach stawów.",
    pricePln: 650,
    durationMin: 45,
    category: "zabiegi",
  },
  {
    id: "kwas-hialuronowy",
    name: "Iniekcja kwasu hialuronowego",
    description: "Wiskosuplementacja stawu (np. kolano, bark).",
    pricePln: 450,
    durationMin: 30,
    category: "zabiegi",
  },
  {
    id: "artroskopia-diagnostyczna",
    name: "Artroskopia diagnostyczna",
    description: "Kwalifikacja i procedura diagnostyczna (orientacyjna cena).",
    pricePln: 1200,
    durationMin: 60,
    category: "zabiegi",
  },
  {
    id: "rehabilitacja-sesja",
    name: "Rehabilitacja / fizjoterapia (1 sesja)",
    description: "Indywidualna sesja fizjoterapeutyczna.",
    pricePln: 160,
    durationMin: 45,
    category: "fizjoterapia",
  },
  {
    id: "rehabilitacja-pakiet-10",
    name: "Rehabilitacja pooperacyjna (pakiet 10 sesji)",
    description: "Pakiet 10 sesji w programie powrotu do sprawności.",
    pricePln: 1450,
    durationMin: 45,
    category: "fizjoterapia",
  },
  {
    id: "szyna-cpm",
    name: "Wynajem szyny CPM (tydzień)",
    description: "Zmotoryzowana szyna CPM do rehabilitacji w domu.",
    pricePln: 280,
    durationMin: 20,
    category: "inne",
  },
  {
    id: "blokada-stawowa",
    name: "Blokada stawowa / okołostawowa",
    description: "Iniekcja sterydowa lub znieczulająca w leczeniu bólu.",
    pricePln: 320,
    durationMin: 30,
    category: "zabiegi",
  },
  {
    id: "kontrola-pooperacyjna",
    name: "Kontrola pooperacyjna",
    description: "Wizyta kontrolna po zabiegu ortopedycznym.",
    pricePln: 200,
    durationMin: 20,
    category: "ortopedia",
  },
  {
    id: "terapia-falami",
    name: "Terapia falami uderzeniowymi (1 sesja)",
    description: "ESWT w leczeniu entezopatii i zespołów przeciążeniowych.",
    pricePln: 190,
    durationMin: 30,
    category: "fizjoterapia",
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function formatPricePln(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export type Doctor = {
  id: string;
  name: string;
  title: string;
  specialty: string;
  /**
   * 0–1: bazowa szansa na wolny slot (niższa = mniej wolnych).
   * Dr Kiryluk ma najmniej dostępności.
   */
  availabilityFactor: number;
  bio: string;
};

export const doctors: Doctor[] = [
  {
    id: "kiryluk",
    name: "Jan Kiryluk",
    title: "Dr n. med.",
    specialty: "Ortopedia i traumatologia narządu ruchu",
    availabilityFactor: 0.22,
    bio: "Specjalista z bogatym doświadczeniem klinicznym i operacyjnym. Ograniczona liczba terminów.",
  },
  {
    id: "wenta",
    name: "Tomas Wenta",
    title: "Lek.",
    specialty: "Ortopedia i traumatologia",
    availabilityFactor: 0.48,
    bio: "Konsultacje ortopedyczne, diagnostyka i planowanie leczenia.",
  },
  {
    id: "frankowski",
    name: "Paweł Frankowski",
    title: "Lek.",
    specialty: "Ortopedia",
    availabilityFactor: 0.55,
    bio: "Diagnostyka i leczenie schorzeń stawów oraz urazów sportowych.",
  },
  {
    id: "zawadzki",
    name: "Andrzej Zawadzki",
    title: "Lek.",
    specialty: "Ortopedia",
    availabilityFactor: 0.58,
    bio: "Konsultacje i kwalifikacja do zabiegów małoinwazyjnych.",
  },
  {
    id: "torba",
    name: "Grzegorz Torba",
    title: "Lek.",
    specialty: "Ortopedia / rehabilitacja",
    availabilityFactor: 0.62,
    bio: "Współpraca z fizjoterapią, prowadzenie pacjentów pooperacyjnych.",
  },
  {
    id: "sammoudi",
    name: "Saddam Sammoudi",
    title: "Lek.",
    specialty: "Ortopedia",
    availabilityFactor: 0.68,
    bio: "Najwięcej wolnych terminów w najbliższych tygodniach.",
  },
];

export function getDoctorById(id: string): Doctor | undefined {
  return doctors.find((d) => d.id === id);
}

export function formatDoctorName(doctor: Doctor): string {
  return `${doctor.title} ${doctor.name}`;
}

import type { UserRole } from "@/lib/auth/roles";
import { buildPesel } from "@/lib/pesel";

/**
 * Konta demo — Etap 7.
 * Lekarze: imie.nazwisko@cmkw.pl / imienazwisko123
 * Pacjenci: …@email.pl / imienazwisko123
 */
export type DemoAccountSeed = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  pesel: string;
  role: UserRole;
  doctorId?: string;
};

export const DEMO_DOCTOR_ACCOUNTS: DemoAccountSeed[] = [
  {
    id: "user-doctor-kiryluk",
    email: "jan.kiryluk@cmkw.pl",
    password: "jankiryluk123",
    firstName: "Jan",
    lastName: "Kiryluk",
    phone: "+48 85 123 45 01",
    pesel: buildPesel(1970, 1, 15, 101, "M"),
    role: "admin", // lekarz + admin demo
    doctorId: "kiryluk",
  },
  {
    id: "user-doctor-wenta",
    email: "tomasz.wenta@cmkw.pl",
    password: "tomaszwenta123",
    firstName: "Tomasz",
    lastName: "Wenta",
    phone: "+48 85 123 45 02",
    pesel: buildPesel(1975, 3, 20, 202, "M"),
    role: "doctor",
    doctorId: "wenta",
  },
  {
    id: "user-doctor-frankowski",
    email: "pawel.frankowski@cmkw.pl",
    password: "pawelfrankowski123",
    firstName: "Paweł",
    lastName: "Frankowski",
    phone: "+48 85 123 45 03",
    pesel: buildPesel(1980, 5, 10, 303, "M"),
    role: "doctor",
    doctorId: "frankowski",
  },
  {
    id: "user-doctor-zawadzki",
    email: "andrzej.zawadzki@cmkw.pl",
    password: "andrzejzawadzki123",
    firstName: "Andrzej",
    lastName: "Zawadzki",
    phone: "+48 85 123 45 04",
    pesel: buildPesel(1978, 7, 22, 404, "M"),
    role: "doctor",
    doctorId: "zawadzki",
  },
  {
    id: "user-doctor-torba",
    email: "grzegorz.torba@cmkw.pl",
    password: "grzegorztorba123",
    firstName: "Grzegorz",
    lastName: "Torba",
    phone: "+48 85 123 45 05",
    pesel: buildPesel(1982, 9, 5, 505, "M"),
    role: "doctor",
    doctorId: "torba",
  },
  {
    id: "user-doctor-sammoudi",
    email: "saddam.sammoudi@cmkw.pl",
    password: "saddamsammoudi123",
    firstName: "Saddam",
    lastName: "Sammoudi",
    phone: "+48 85 123 45 06",
    pesel: buildPesel(1985, 11, 12, 606, "M"),
    role: "doctor",
    doctorId: "sammoudi",
  },
];

export const DEMO_RECEPTION_ACCOUNTS: DemoAccountSeed[] = [
  {
    id: "user-reception-anna",
    email: "recepcja@cmkw.pl",
    password: "recepcja123",
    firstName: "Anna",
    lastName: "Nowak",
    phone: "+48 85 123 45 00",
    pesel: buildPesel(1990, 3, 10, 707, "K"),
    role: "reception",
  },
];

/** Pacjenci demo — ID stałe (powiązanie z bookingiem / EDM). */
export const DEMO_PATIENT_ACCOUNTS: DemoAccountSeed[] = [
  {
    id: "user-patient-jan",
    email: "jan.kowalski@email.pl",
    password: "jankowalski123",
    firstName: "Jan",
    lastName: "Kowalski",
    phone: "500111001",
    pesel: buildPesel(1985, 4, 12, 111, "M"),
    role: "patient",
  },
  {
    id: "user-patient-tomasz",
    email: "tomasz.nowak@email.pl",
    password: "tomasznowak123",
    firstName: "Tomasz",
    lastName: "Nowak",
    phone: "501222003",
    pesel: buildPesel(1978, 9, 5, 222, "M"),
    role: "patient",
  },
  {
    id: "user-patient-anna",
    email: "anna.nowicka@email.pl",
    password: "annanowicka123",
    firstName: "Anna",
    lastName: "Nowicka",
    phone: "502333004",
    pesel: buildPesel(1992, 2, 18, 333, "K"),
    role: "patient",
  },
];

export const ALL_DEMO_ACCOUNTS: DemoAccountSeed[] = [
  ...DEMO_DOCTOR_ACCOUNTS,
  ...DEMO_RECEPTION_ACCOUNTS,
  ...DEMO_PATIENT_ACCOUNTS,
];

/** Stare e-maile do usunięcia przy migracji seeda */
export const LEGACY_DEMO_EMAILS = [
  "tomas.wenta@cmkw.pl",
  "admin@cmkw.pl",
];

export const DEMO_SEED_VERSION = 7;

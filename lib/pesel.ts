/**
 * Walidacja i parsowanie numeru PESEL (11 cyfr + suma kontrolna).
 * https://pl.wikipedia.org/wiki/PESEL
 */
const WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3] as const;

export type PeselSex = "M" | "K";

export function isValidPesel(raw: string): boolean {
  const pesel = raw.replace(/\s/g, "");
  if (!/^\d{11}$/.test(pesel)) return false;

  // Reject obviously fake all-same digits (optional hygiene)
  if (/^(\d)\1{10}$/.test(pesel)) return false;

  const digits = pesel.split("").map(Number);
  const sum = WEIGHTS.reduce((acc, w, i) => acc + w * digits[i]!, 0);
  const control = (10 - (sum % 10)) % 10;
  return control === digits[10];
}

/** Mask PESEL for UI: 123456***** */
export function maskPesel(pesel: string): string {
  const clean = pesel.replace(/\s/g, "");
  if (clean.length < 6) return "***********";
  return `${clean.slice(0, 6)}*****`;
}

function centuryFromMonth(monthEncoded: number): {
  century: number;
  month: number;
} {
  if (monthEncoded >= 1 && monthEncoded <= 12)
    return { century: 1900, month: monthEncoded };
  if (monthEncoded >= 21 && monthEncoded <= 32)
    return { century: 2000, month: monthEncoded - 20 };
  if (monthEncoded >= 41 && monthEncoded <= 52)
    return { century: 2100, month: monthEncoded - 40 };
  if (monthEncoded >= 61 && monthEncoded <= 72)
    return { century: 2200, month: monthEncoded - 60 };
  if (monthEncoded >= 81 && monthEncoded <= 92)
    return { century: 1800, month: monthEncoded - 80 };
  return { century: 1900, month: monthEncoded };
}

/**
 * Data urodzenia i płeć z PESEL (gdy numer jest poprawny).
 * birthDate: yyyy-MM-dd
 */
export function parsePesel(raw: string): {
  birthDate: string;
  sex: PeselSex;
} | null {
  const pesel = raw.replace(/\s/g, "");
  if (!isValidPesel(pesel)) return null;

  const yy = Number(pesel.slice(0, 2));
  const mm = Number(pesel.slice(2, 4));
  const dd = Number(pesel.slice(4, 6));
  const { century, month } = centuryFromMonth(mm);
  const year = century + yy;
  const sexDigit = Number(pesel[9]);
  const sex: PeselSex = sexDigit % 2 === 1 ? "M" : "K";

  const birthDate = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  return { birthDate, sex };
}

function encodeMonth(year: number, month: number): number {
  if (year >= 2000 && year <= 2099) return month + 20;
  if (year >= 1800 && year <= 1899) return month + 80;
  if (year >= 2100 && year <= 2199) return month + 40;
  if (year >= 2200 && year <= 2299) return month + 60;
  return month; // 1900–1999
}

/** Buduje poprawny PESEL (suma kontrolna) dla seedów i testów. */
export function buildPesel(
  year: number,
  month: number,
  day: number,
  serial3: number,
  sex: PeselSex
): string {
  const yy = String(year % 100).padStart(2, "0");
  const mm = String(encodeMonth(year, month)).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const serial = String(serial3 % 1000).padStart(3, "0");
  // 10. cyfra: nieparzysta = M, parzysta = K
  const sexDigit = sex === "M" ? "1" : "2";
  const base = `${yy}${mm}${dd}${serial}${sexDigit}`;
  const digits = base.split("").map(Number);
  const sum = WEIGHTS.reduce((acc, w, i) => acc + w * digits[i]!, 0);
  const control = (10 - (sum % 10)) % 10;
  return `${base}${control}`;
}

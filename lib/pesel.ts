/**
 * Walidacja numeru PESEL (11 cyfr + suma kontrolna).
 * https://pl.wikipedia.org/wiki/PESEL
 */
const WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3] as const;

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

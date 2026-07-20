export type Drug = {
  id: string;
  name: string;
  inn: string;
  manufacturer: string;
  form: string;
  strength: string;
  packageSize: string;
  pricePln: number;
  category: string;
  /** Powiązane kody ICD-10 (opcjonalnie) */
  relatedIcd10: string[];
  indications: string;
  dosage: string;
  contraindications: string;
  warnings: string;
  interactions: string;
  pregnancyLactation: string;
  sideEffects: string;
  overdose: string;
  mechanism: string;
  composition: string;
};

export type DrugSectionKey =
  | "indications"
  | "dosage"
  | "contraindications"
  | "warnings"
  | "interactions"
  | "pregnancyLactation"
  | "sideEffects"
  | "overdose"
  | "mechanism"
  | "composition";

export const DRUG_SECTION_LABELS: Record<DrugSectionKey, string> = {
  indications: "Wskazania",
  dosage: "Dawkowanie",
  contraindications: "Przeciwwskazania",
  warnings: "Ostrzeżenia",
  interactions: "Interakcje",
  pregnancyLactation: "Ciąża i laktacja",
  sideEffects: "Działania niepożądane",
  overdose: "Przedawkowanie",
  mechanism: "Działanie",
  composition: "Skład",
};

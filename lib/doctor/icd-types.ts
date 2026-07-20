export type Icd10Code = {
  code: string;
  namePl: string;
  nameLa: string;
  /** chapter letter range e.g. M, S, A */
  chapter: string;
  kind: string;
  specialty: string;
  /** ID leków z bazy (opcjonalnie) */
  relatedDrugIds: string[];
};

export const ICD_CHAPTERS: { id: string; label: string }[] = [
  { id: "all", label: "Wszystkie" },
  { id: "A", label: "A – Zakaźne" },
  { id: "E", label: "E – Endokrynologia" },
  { id: "G", label: "G – Układ nerwowy" },
  { id: "I", label: "I – Układ krążenia" },
  { id: "J", label: "J – Układ oddechowy" },
  { id: "M", label: "M – Układ ruchu" },
  { id: "R", label: "R – Objawy" },
  { id: "S", label: "S – Urazy" },
  { id: "T", label: "T – Skutki urazów" },
  { id: "Z", label: "Z – Czynniki zdrowotne" },
];

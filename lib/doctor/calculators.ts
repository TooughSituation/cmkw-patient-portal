export type CalcField = {
  name: string;
  label: string;
  type: "number" | "select";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
};

export type CalcResult = {
  title: string;
  value: string;
  interpretation: string;
  level: "info" | "success" | "warning" | "danger";
};

export type CalculatorDef = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  source: string;
  fields: CalcField[];
  compute: (values: Record<string, string>) => CalcResult[];
};

function num(v: string | undefined): number {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function levelBmi(bmi: number): CalcResult["level"] {
  if (bmi < 18.5) return "warning";
  if (bmi < 25) return "success";
  if (bmi < 30) return "warning";
  return "danger";
}

function interpretBmi(bmi: number): string {
  if (bmi < 16.5) return "Wygłodzenie";
  if (bmi < 18.5) return "Niedowaga";
  if (bmi < 25) return "Waga prawidłowa";
  if (bmi < 30) return "Nadwaga";
  if (bmi < 35) return "Otyłość I stopnia";
  if (bmi < 40) return "Otyłość II stopnia";
  return "Otyłość III stopnia";
}

/** Idealna masa ciała (Lorentz, uproszczona). */
function idealWeightKg(heightCm: number, sex: string): number {
  if (sex === "M") return heightCm - 100 - (heightCm - 150) / 4;
  return heightCm - 100 - (heightCm - 150) / 2.5;
}

export const CALCULATORS: CalculatorDef[] = [
  {
    id: "bmi",
    name: "BMI / Idealna masa ciała",
    shortName: "BMI",
    category: "Ogólne",
    description:
      "Wskaźnik masy ciała (BMI) oraz orientacyjna idealna masa ciała (wzór Lorentza).",
    source: "WHO; Lorentz (ideal body weight) — orientacyjnie",
    fields: [
      {
        name: "weight",
        label: "Masa ciała",
        type: "number",
        unit: "kg",
        min: 20,
        max: 300,
        step: 0.1,
        placeholder: "70",
      },
      {
        name: "height",
        label: "Wzrost",
        type: "number",
        unit: "cm",
        min: 100,
        max: 250,
        step: 0.1,
        placeholder: "175",
      },
      {
        name: "sex",
        label: "Płeć",
        type: "select",
        options: [
          { value: "K", label: "Kobieta" },
          { value: "M", label: "Mężczyzna" },
        ],
        defaultValue: "K",
      },
    ],
    compute(values) {
      const w = num(values.weight);
      const hCm = num(values.height);
      if (!(w > 0 && hCm > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj prawidłową masę i wzrost.",
            level: "danger",
          },
        ];
      }
      const h = hCm / 100;
      const bmi = w / (h * h);
      const ideal = idealWeightKg(hCm, values.sex || "K");
      return [
        {
          title: "BMI",
          value: bmi.toFixed(1) + " kg/m²",
          interpretation: interpretBmi(bmi),
          level: levelBmi(bmi),
        },
        {
          title: "Idealna masa ciała (Lorentz)",
          value: ideal.toFixed(1) + " kg",
          interpretation: "Wartość orientacyjna — nie zastępuje oceny klinicznej.",
          level: "info",
        },
      ];
    },
  },
  {
    id: "dose-weight",
    name: "Dawka wg masy ciała",
    shortName: "Dawka/kg",
    category: "Farmakologia",
    description: "Oblicza dawkę całkowitą na podstawie mg/kg i masy pacjenta.",
    source: "Zasady dawkowania — weryfikuj z ChPL",
    fields: [
      {
        name: "weight",
        label: "Masa ciała",
        type: "number",
        unit: "kg",
        min: 1,
        max: 300,
        step: 0.1,
      },
      {
        name: "mgPerKg",
        label: "Dawka",
        type: "number",
        unit: "mg/kg",
        min: 0.01,
        max: 200,
        step: 0.01,
      },
      {
        name: "times",
        label: "Liczba dawek na dobę",
        type: "number",
        unit: "×/d",
        min: 1,
        max: 6,
        step: 1,
        defaultValue: "1",
      },
    ],
    compute(values) {
      const w = num(values.weight);
      const d = num(values.mgPerKg);
      const t = num(values.times) || 1;
      if (!(w > 0 && d > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj masę i dawkę mg/kg.",
            level: "danger",
          },
        ];
      }
      const single = w * d;
      const daily = single * t;
      return [
        {
          title: "Dawka jednorazowa",
          value: single.toFixed(1) + " mg",
          interpretation: `${d} mg/kg × ${w} kg`,
          level: "success",
        },
        {
          title: "Dawka dobowa",
          value: daily.toFixed(1) + " mg/d",
          interpretation: `${t}× na dobę`,
          level: "info",
        },
      ];
    },
  },
  {
    id: "pediatric-dose",
    name: "Dawki u dzieci (Clark / Young)",
    shortName: "Dawki dzieci",
    category: "Farmakologia",
    description:
      "Orientacyjna dawka dziecięca na podstawie dawki dorosłej (wzór Younga lub Clarka).",
    source: "Young (wiek), Clark (masa) — tylko orientacyjnie!",
    fields: [
      {
        name: "adultDose",
        label: "Dawka dorosłego",
        type: "number",
        unit: "mg",
        min: 0.1,
        max: 5000,
      },
      {
        name: "method",
        label: "Metoda",
        type: "select",
        options: [
          { value: "young", label: "Young (wiek w latach)" },
          { value: "clark", label: "Clark (masa w funtach)" },
        ],
        defaultValue: "young",
      },
      {
        name: "age",
        label: "Wiek dziecka",
        type: "number",
        unit: "lat",
        min: 0.1,
        max: 17,
        step: 0.1,
        placeholder: "dla Young",
      },
      {
        name: "weightLb",
        label: "Masa (funty)",
        type: "number",
        unit: "lb",
        min: 5,
        max: 200,
        placeholder: "dla Clark (1 kg ≈ 2,2 lb)",
      },
    ],
    compute(values) {
      const adult = num(values.adultDose);
      if (!(adult > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj dawkę dorosłego.",
            level: "danger",
          },
        ];
      }
      if (values.method === "clark") {
        const lb = num(values.weightLb);
        if (!(lb > 0)) {
          return [
            {
              title: "Błąd",
              value: "—",
              interpretation: "Podaj masę w funtach.",
              level: "danger",
            },
          ];
        }
        const dose = (adult * lb) / 150;
        return [
          {
            title: "Dawka (Clark)",
            value: dose.toFixed(1) + " mg",
            interpretation: "(dawka dorosła × lb) / 150",
            level: "warning",
          },
        ];
      }
      const age = num(values.age);
      if (!(age > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj wiek dziecka.",
            level: "danger",
          },
        ];
      }
      const dose = (adult * age) / (age + 12);
      return [
        {
          title: "Dawka (Young)",
          value: dose.toFixed(1) + " mg",
          interpretation: "(dawka dorosła × wiek) / (wiek + 12)",
          level: "warning",
        },
      ];
    },
  },
  {
    id: "steroid-convert",
    name: "Kalkulator kortykosteroidów (równoważność)",
    shortName: "Kortykosteroidy",
    category: "Farmakologia",
    description:
      "Przeliczanie dawek między popularnymi glikokortykosteroidami (równoważność przeciwzapalna).",
    source: "Tabele równoważności GKS (np. prednizon = 1)",
    fields: [
      {
        name: "from",
        label: "Z leku",
        type: "select",
        options: [
          { value: "prednisone", label: "Prednizon / Prednizolon" },
          { value: "methylpred", label: "Metyloprednizolon" },
          { value: "hydrocort", label: "Hydrokortyzon" },
          { value: "dexa", label: "Deksametazon" },
          { value: "betamethasone", label: "Betametazon" },
        ],
        defaultValue: "prednisone",
      },
      {
        name: "dose",
        label: "Dawka",
        type: "number",
        unit: "mg",
        min: 0.1,
        max: 1000,
      },
      {
        name: "to",
        label: "Na lek",
        type: "select",
        options: [
          { value: "prednisone", label: "Prednizon / Prednizolon" },
          { value: "methylpred", label: "Metyloprednizolon" },
          { value: "hydrocort", label: "Hydrokortyzon" },
          { value: "dexa", label: "Deksametazon" },
          { value: "betamethasone", label: "Betametazon" },
        ],
        defaultValue: "methylpred",
      },
    ],
    compute(values) {
      // relative potency vs prednisone 5 mg
      const pot: Record<string, number> = {
        hydrocort: 1,
        prednisone: 4,
        methylpred: 5,
        betamethasone: 25,
        dexa: 25,
      };
      const dose = num(values.dose);
      const pFrom = pot[values.from ?? ""] ?? 0;
      const pTo = pot[values.to ?? ""] ?? 0;
      if (!(dose > 0 && pFrom && pTo)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Uzupełnij pola.",
            level: "danger",
          },
        ];
      }
      // dose_to = dose_from * (pot_from / pot_to)  — same anti-inflammatory effect
      // If prednisone 5mg = hydrocort 20mg: pot hydro=1, pred=4 → 20 * 1/4 = 5 ✓
      const converted = (dose * pFrom) / pTo;
      return [
        {
          title: "Dawka równoważna",
          value: converted.toFixed(2) + " mg",
          interpretation:
            "Przybliżona równoważność przeciwzapalna — uwzględnij mineralokortykoidy i farmakokinetykę.",
          level: "info",
        },
      ];
    },
  },
  {
    id: "basdai",
    name: "BASDAI (aktywność ZZSK)",
    shortName: "BASDAI",
    category: "Ortopedia / Reumatologia",
    description:
      "Bath Ankylosing Spondylitis Disease Activity Index — 6 pytań (skala 0–10).",
    source: "BASDAI — Garrett et al.",
    fields: [
      {
        name: "q1",
        label: "1. Zmęczenie / senność",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
        unit: "0–10",
      },
      {
        name: "q2",
        label: "2. Ból karku, pleców, bioder",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
        unit: "0–10",
      },
      {
        name: "q3",
        label: "3. Ból / obrzęk innych stawów",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
        unit: "0–10",
      },
      {
        name: "q4",
        label: "4. Miejsca wrażliwe na ucisk",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
        unit: "0–10",
      },
      {
        name: "q5",
        label: "5. Nasilenie sztywności porannej",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
        unit: "0–10",
      },
      {
        name: "q6",
        label: "6. Czas trwania sztywności porannej",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
        unit: "0–10",
      },
    ],
    compute(values) {
      const qs = [1, 2, 3, 4, 5, 6].map((i) => num(values[`q${i}`]));
      if (qs.some((x) => Number.isNaN(x) || x < 0 || x > 10)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Wypełnij wszystkie pytania (0–10).",
            level: "danger",
          },
        ];
      }
      const score =
        (qs[0]! + qs[1]! + qs[2]! + qs[3]! + (qs[4]! + qs[5]!) / 2) / 5;
      const active = score >= 4;
      return [
        {
          title: "BASDAI",
          value: score.toFixed(2),
          interpretation: active
            ? "Wynik ≥ 4 — możliwa aktywna choroba (ocena kliniczna)."
            : "Wynik < 4 — niższa aktywność wg skali.",
          level: active ? "warning" : "success",
        },
      ];
    },
  },
  {
    id: "asdas-crp",
    name: "ASDAS-CRP (orientacyjny)",
    shortName: "ASDAS",
    category: "Ortopedia / Reumatologia",
    description:
      "Ankylosing Spondylitis Disease Activity Score z CRP (uproszczony wzór).",
    source: "ASAS — ASDAS-CRP",
    fields: [
      {
        name: "backPain",
        label: "Ból pleców (0–10)",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        name: "duration",
        label: "Czas sztywności porannej (0–10)",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        name: "peripheral",
        label: "Ból/obrzęk stawów obwodowych (0–10)",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        name: "patientGlobal",
        label: "Ocena globalna pacjenta (0–10)",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        name: "crp",
        label: "CRP",
        type: "number",
        unit: "mg/l",
        min: 0,
        max: 300,
        step: 0.1,
      },
    ],
    compute(values) {
      const bp = num(values.backPain);
      const dur = num(values.duration);
      const per = num(values.peripheral);
      const pg = num(values.patientGlobal);
      const crp = num(values.crp);
      if ([bp, dur, per, pg, crp].some((x) => Number.isNaN(x))) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Uzupełnij wszystkie pola.",
            level: "danger",
          },
        ];
      }
      const crpSafe = Math.max(crp, 2);
      const asdas =
        0.12 * bp +
        0.06 * dur +
        0.11 * per +
        0.07 * pg +
        0.58 * Math.log(crpSafe + 1);
      let interp = "Niska aktywność (< 1,3)";
      let level: CalcResult["level"] = "success";
      if (asdas >= 3.5) {
        interp = "Bardzo wysoka aktywność (≥ 3,5)";
        level = "danger";
      } else if (asdas >= 2.1) {
        interp = "Wysoka aktywność (2,1–3,5)";
        level = "warning";
      } else if (asdas >= 1.3) {
        interp = "Umiarkowana aktywność (1,3–2,1)";
        level = "info";
      }
      return [
        {
          title: "ASDAS-CRP",
          value: asdas.toFixed(2),
          interpretation: interp,
          level,
        },
      ];
    },
  },
  {
    id: "homa",
    name: "HOMA-IR / QUICKI",
    shortName: "HOMA / QUICKI",
    category: "Endokrynologia",
    description:
      "Wskaźniki insulinooporności na podstawie glukozy na czczo i insuliny.",
    source: "HOMA-IR; QUICKI (Katz et al.)",
    fields: [
      {
        name: "glucose",
        label: "Glukoza na czczo",
        type: "number",
        unit: "mg/dl",
        min: 40,
        max: 400,
      },
      {
        name: "insulin",
        label: "Insulina na czczo",
        type: "number",
        unit: "µU/ml",
        min: 0.1,
        max: 200,
        step: 0.1,
      },
    ],
    compute(values) {
      const g = num(values.glucose);
      const i = num(values.insulin);
      if (!(g > 0 && i > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj glukozę i insulinę.",
            level: "danger",
          },
        ];
      }
      const homa = (g * i) / 405;
      const quicki = 1 / (Math.log10(i) + Math.log10(g));
      return [
        {
          title: "HOMA-IR",
          value: homa.toFixed(2),
          interpretation:
            homa > 2.5
              ? "Powyżej typowego progu 2,5 — możliwa insulinooporność (lab. zależne)."
              : "W zakresie często uznawanym za prawidłowy (< 2,5).",
          level: homa > 2.5 ? "warning" : "success",
        },
        {
          title: "QUICKI",
          value: quicki.toFixed(3),
          interpretation:
            quicki < 0.339
              ? "Niższe wartości sugerują większą insulinooporność."
              : "Wyższe wartości — lepsza wrażliwość na insulinę.",
          level: quicki < 0.339 ? "warning" : "success",
        },
      ];
    },
  },
  {
    id: "egfr",
    name: "eGFR / klirens kreatyniny (CKD-EPI / Cockcroft-Gault)",
    shortName: "eGFR",
    category: "Nefrologia",
    description:
      "Szacunkowy GFR (CKD-EPI 2009, uproszczony) oraz klirens kreatyniny (Cockcroft-Gault).",
    source: "CKD-EPI 2009; Cockcroft-Gault",
    fields: [
      {
        name: "creat",
        label: "Kreatynina w surowicy",
        type: "number",
        unit: "mg/dl",
        min: 0.1,
        max: 20,
        step: 0.01,
      },
      {
        name: "age",
        label: "Wiek",
        type: "number",
        unit: "lat",
        min: 18,
        max: 110,
      },
      {
        name: "sex",
        label: "Płeć",
        type: "select",
        options: [
          { value: "K", label: "Kobieta" },
          { value: "M", label: "Mężczyzna" },
        ],
        defaultValue: "K",
      },
      {
        name: "weight",
        label: "Masa (dla CG)",
        type: "number",
        unit: "kg",
        min: 30,
        max: 250,
      },
    ],
    compute(values) {
      const scr = num(values.creat);
      const age = num(values.age);
      const weight = num(values.weight);
      const female = values.sex === "K";
      if (!(scr > 0 && age > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj kreatyninę i wiek.",
            level: "danger",
          },
        ];
      }
      // CKD-EPI creatinine 2009
      const kappa = female ? 0.7 : 0.9;
      const alpha = female ? -0.329 : -0.411;
      const minScr = Math.min(scr / kappa, 1);
      const maxScr = Math.max(scr / kappa, 1);
      let egfr =
        141 *
        Math.pow(minScr, alpha) *
        Math.pow(maxScr, -1.209) *
        Math.pow(0.993, age);
      if (female) egfr *= 1.018;
      // race factor omitted (non-Black default)

      let stage = "G1 (≥ 90)";
      let level: CalcResult["level"] = "success";
      if (egfr < 15) {
        stage = "G5 (< 15)";
        level = "danger";
      } else if (egfr < 30) {
        stage = "G4 (15–29)";
        level = "danger";
      } else if (egfr < 45) {
        stage = "G3b (30–44)";
        level = "warning";
      } else if (egfr < 60) {
        stage = "G3a (45–59)";
        level = "warning";
      } else if (egfr < 90) {
        stage = "G2 (60–89)";
        level = "info";
      }

      const results: CalcResult[] = [
        {
          title: "eGFR (CKD-EPI)",
          value: egfr.toFixed(0) + " ml/min/1,73 m²",
          interpretation: `Stadium PChN (eGFR): ${stage}`,
          level,
        },
      ];

      if (weight > 0) {
        let cg = ((140 - age) * weight) / (72 * scr);
        if (female) cg *= 0.85;
        results.push({
          title: "Klirens (Cockcroft-Gault)",
          value: cg.toFixed(0) + " ml/min",
          interpretation: "Używane m.in. do dawkowania leków.",
          level: "info",
        });
      }
      return results;
    },
  },
  {
    id: "glucose-units",
    name: "Jednostki glikemii",
    shortName: "Glikemia",
    category: "Lab",
    description: "Przeliczanie glukozy między mg/dl a mmol/l.",
    source: "1 mmol/l = 18,02 mg/dl",
    fields: [
      {
        name: "value",
        label: "Wartość",
        type: "number",
        min: 0.1,
        max: 1000,
        step: 0.01,
      },
      {
        name: "from",
        label: "Jednostka wejściowa",
        type: "select",
        options: [
          { value: "mg", label: "mg/dl" },
          { value: "mmol", label: "mmol/l" },
        ],
        defaultValue: "mg",
      },
    ],
    compute(values) {
      const v = num(values.value);
      if (!(v > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj wartość.",
            level: "danger",
          },
        ];
      }
      if (values.from === "mmol") {
        const mg = v * 18.02;
        return [
          {
            title: "mg/dl",
            value: mg.toFixed(1),
            interpretation: `${v} mmol/l × 18,02`,
            level: "success",
          },
        ];
      }
      const mmol = v / 18.02;
      return [
        {
          title: "mmol/l",
          value: mmol.toFixed(2),
          interpretation: `${v} mg/dl ÷ 18,02`,
          level: "success",
        },
      ];
    },
  },
  {
    id: "bsa",
    name: "Powierzchnia ciała (BSA, Mosteller)",
    shortName: "BSA",
    category: "Ogólne",
    description: "Powierzchnia ciała wg Mostellera — dawkowanie chemoterapii, m.in.",
    source: "Mosteller RD, 1987",
    fields: [
      {
        name: "weight",
        label: "Masa",
        type: "number",
        unit: "kg",
        min: 1,
        max: 300,
      },
      {
        name: "height",
        label: "Wzrost",
        type: "number",
        unit: "cm",
        min: 40,
        max: 250,
      },
    ],
    compute(values) {
      const w = num(values.weight);
      const h = num(values.height);
      if (!(w > 0 && h > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj masę i wzrost.",
            level: "danger",
          },
        ];
      }
      const bsa = Math.sqrt((h * w) / 3600);
      return [
        {
          title: "BSA",
          value: bsa.toFixed(2) + " m²",
          interpretation: "√((wzrost_cm × masa_kg) / 3600)",
          level: "success",
        },
      ];
    },
  },
  {
    id: "map",
    name: "Ciśnienie średnie (MAP)",
    shortName: "MAP",
    category: "Kardiologia",
    description: "Średnie ciśnienie tętnicze: MAP = DBP + 1/3 (SBP − DBP).",
    source: "Wzór standardowy MAP",
    fields: [
      {
        name: "sbp",
        label: "Ciśnienie skurczowe",
        type: "number",
        unit: "mmHg",
        min: 50,
        max: 300,
      },
      {
        name: "dbp",
        label: "Ciśnienie rozkurczowe",
        type: "number",
        unit: "mmHg",
        min: 30,
        max: 200,
      },
    ],
    compute(values) {
      const s = num(values.sbp);
      const d = num(values.dbp);
      if (!(s > 0 && d > 0) || s < d) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Sprawdź SBP i DBP.",
            level: "danger",
          },
        ];
      }
      const map = d + (s - d) / 3;
      return [
        {
          title: "MAP",
          value: map.toFixed(0) + " mmHg",
          interpretation:
            map < 65
              ? "MAP < 65 — niska perfuzja (kontekst OIT)."
              : "Typowy cel MAP ≥ 65 mmHg w stanach krytycznych.",
          level: map < 65 ? "danger" : "success",
        },
      ];
    },
  },
  {
    id: "corrected-ca",
    name: "Wapń skorygowany (albumina)",
    shortName: "Ca skoryg.",
    category: "Lab",
    description:
      "Wapń całkowity skorygowany o stężenie albuminy (wzór popularny w lab).",
    source: "Ca_corr = Ca + 0,8 × (4 − albumina_g/dl)",
    fields: [
      {
        name: "ca",
        label: "Wapń całkowity",
        type: "number",
        unit: "mg/dl",
        min: 1,
        max: 20,
        step: 0.01,
      },
      {
        name: "alb",
        label: "Albumina",
        type: "number",
        unit: "g/dl",
        min: 0.5,
        max: 6,
        step: 0.01,
      },
    ],
    compute(values) {
      const ca = num(values.ca);
      const alb = num(values.alb);
      if (!(ca > 0 && alb > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj wapń i albuminę.",
            level: "danger",
          },
        ];
      }
      const corr = ca + 0.8 * (4 - alb);
      let level: CalcResult["level"] = "success";
      let interp = "W zakresie często uznawanym za prawidłowy (~8,5–10,5 mg/dl).";
      if (corr < 8.5) {
        level = "warning";
        interp = "Poniżej typowego zakresu — hipokalcemia?";
      } else if (corr > 10.5) {
        level = "warning";
        interp = "Powyżej typowego zakresu — hiperkalcemia?";
      }
      return [
        {
          title: "Ca skorygowany",
          value: corr.toFixed(2) + " mg/dl",
          interpretation: interp,
          level,
        },
      ];
    },
  },
  {
    id: "qtc",
    name: "QTc (Bazett / Fridericia)",
    shortName: "QTc",
    category: "Kardiologia",
    description: "Skorygowany odstęp QT względem częstości rytmu.",
    source: "Bazett; Fridericia",
    fields: [
      {
        name: "qt",
        label: "QT",
        type: "number",
        unit: "ms",
        min: 200,
        max: 700,
      },
      {
        name: "hr",
        label: "Częstość rytmu",
        type: "number",
        unit: "bpm",
        min: 30,
        max: 220,
      },
      {
        name: "sex",
        label: "Płeć",
        type: "select",
        options: [
          { value: "K", label: "Kobieta" },
          { value: "M", label: "Mężczyzna" },
        ],
        defaultValue: "K",
      },
    ],
    compute(values) {
      const qt = num(values.qt);
      const hr = num(values.hr);
      if (!(qt > 0 && hr > 0)) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj QT i HR.",
            level: "danger",
          },
        ];
      }
      const rr = 60 / hr;
      const bazett = qt / Math.sqrt(rr);
      const frid = qt / Math.cbrt(rr);
      const limit = values.sex === "M" ? 450 : 460;
      return [
        {
          title: "QTc Bazett",
          value: bazett.toFixed(0) + " ms",
          interpretation:
            bazett > limit
              ? `Powyżej progu ~${limit} ms — wydłużenie QTc?`
              : `W granicach często stosowanego progu (~${limit} ms).`,
          level: bazett > limit ? "warning" : "success",
        },
        {
          title: "QTc Fridericia",
          value: frid.toFixed(0) + " ms",
          interpretation: "Mniej zależny od tachykardii niż Bazett.",
          level: "info",
        },
      ];
    },
  },
  {
    id: "anion-gap",
    name: "Luka anionowa",
    shortName: "AG",
    category: "Lab",
    description: "Anion gap = Na⁺ − (Cl⁻ + HCO₃⁻). Opcjonalnie z potasem.",
    source: "Wzór klasyczny AG",
    fields: [
      { name: "na", label: "Na⁺", type: "number", unit: "mmol/l", min: 100, max: 180 },
      { name: "cl", label: "Cl⁻", type: "number", unit: "mmol/l", min: 70, max: 130 },
      { name: "hco3", label: "HCO₃⁻", type: "number", unit: "mmol/l", min: 5, max: 45 },
      {
        name: "k",
        label: "K⁺ (opcjonalnie)",
        type: "number",
        unit: "mmol/l",
        min: 1,
        max: 10,
        step: 0.1,
      },
    ],
    compute(values) {
      const na = num(values.na);
      const cl = num(values.cl);
      const hco3 = num(values.hco3);
      if ([na, cl, hco3].some((x) => Number.isNaN(x))) {
        return [
          {
            title: "Błąd",
            value: "—",
            interpretation: "Podaj Na, Cl i HCO₃.",
            level: "danger",
          },
        ];
      }
      const ag = na - (cl + hco3);
      const k = num(values.k);
      const results: CalcResult[] = [
        {
          title: "Luka anionowa",
          value: ag.toFixed(1) + " mmol/l",
          interpretation:
            ag > 12
              ? "Podwyższona AG — rozważ kwasicę metaboliczną z luką."
              : "W typowym zakresie referencyjnym lab. (ok. 8–12, metoda zależna).",
          level: ag > 12 ? "warning" : "success",
        },
      ];
      if (!Number.isNaN(k) && k > 0) {
        results.push({
          title: "AG z potasem",
          value: (ag + k).toFixed(1) + " mmol/l",
          interpretation: "Na + K − (Cl + HCO₃)",
          level: "info",
        });
      }
      return results;
    },
  },
  {
    id: "cha2ds2",
    name: "CHA₂DS₂-VASc",
    shortName: "CHA₂DS₂-VASc",
    category: "Kardiologia",
    description:
      "Ryzyko udaru w migotaniu przedsionków — skala punktowa (0–9).",
    source: "ESC AF guidelines",
    fields: [
      {
        name: "chf",
        label: "Niewydolność serca / LV dysfunction",
        type: "select",
        options: [
          { value: "0", label: "Nie (0)" },
          { value: "1", label: "Tak (+1)" },
        ],
        defaultValue: "0",
      },
      {
        name: "htn",
        label: "Nadciśnienie",
        type: "select",
        options: [
          { value: "0", label: "Nie (0)" },
          { value: "1", label: "Tak (+1)" },
        ],
        defaultValue: "0",
      },
      {
        name: "age",
        label: "Wiek",
        type: "select",
        options: [
          { value: "0", label: "< 65 (0)" },
          { value: "1", label: "65–74 (+1)" },
          { value: "2", label: "≥ 75 (+2)" },
        ],
        defaultValue: "0",
      },
      {
        name: "dm",
        label: "Cukrzyca",
        type: "select",
        options: [
          { value: "0", label: "Nie (0)" },
          { value: "1", label: "Tak (+1)" },
        ],
        defaultValue: "0",
      },
      {
        name: "stroke",
        label: "Udar / TIA / zator w wywiadzie",
        type: "select",
        options: [
          { value: "0", label: "Nie (0)" },
          { value: "2", label: "Tak (+2)" },
        ],
        defaultValue: "0",
      },
      {
        name: "vascular",
        label: "Choroba naczyniowa (MI, PAD, blaszka aortalna)",
        type: "select",
        options: [
          { value: "0", label: "Nie (0)" },
          { value: "1", label: "Tak (+1)" },
        ],
        defaultValue: "0",
      },
      {
        name: "sex",
        label: "Płeć żeńska",
        type: "select",
        options: [
          { value: "0", label: "Nie (0)" },
          { value: "1", label: "Tak (+1)" },
        ],
        defaultValue: "0",
      },
    ],
    compute(values) {
      const score =
        num(values.chf) +
        num(values.htn) +
        num(values.age) +
        num(values.dm) +
        num(values.stroke) +
        num(values.vascular) +
        num(values.sex);
      let interp = "Niskie ryzyko — decyzja o OAC indywidualna.";
      let level: CalcResult["level"] = "success";
      if (score >= 2) {
        interp = "≥ 2 — zwykle wskazanie do doustnej antykoagulacji (wytyczne).";
        level = "warning";
      } else if (score === 1) {
        interp = "1 pkt — rozważ OAC (szczególnie nie-płeć jako jedyny punkt).";
        level = "info";
      }
      return [
        {
          title: "CHA₂DS₂-VASc",
          value: String(score) + " pkt",
          interpretation: interp,
          level,
        },
      ];
    },
  },
];

export function getCalculatorById(id: string): CalculatorDef | undefined {
  return CALCULATORS.find((c) => c.id === id);
}

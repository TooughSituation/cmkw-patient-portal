"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CALCULATORS,
  type CalcResult,
  type CalculatorDef,
} from "@/lib/doctor/calculators";
import { cn } from "@/lib/utils";

const resultStyles: Record<CalcResult["level"], string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  danger: "border-red-200 bg-red-50 text-red-900",
};

export function CalculatorsPanel({
  initialId,
}: {
  initialId?: string;
}) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(
    initialId && CALCULATORS.some((c) => c.id === initialId)
      ? initialId
      : CALCULATORS[0]!.id
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<CalcResult[] | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CALCULATORS;
    return CALCULATORS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [query]);

  const active: CalculatorDef =
    CALCULATORS.find((c) => c.id === activeId) ?? CALCULATORS[0]!;

  function selectCalc(id: string) {
    setActiveId(id);
    setResults(null);
    const def = CALCULATORS.find((c) => c.id === id);
    const defaults: Record<string, string> = {};
    def?.fields.forEach((f) => {
      if (f.defaultValue) defaults[f.name] = f.defaultValue;
    });
    setValues(defaults);
  }

  function handleCompute() {
    setResults(active.compute(values));
  }

  return (
    <div className="p-3 md:p-4 lg:p-5" data-tour="doctor-calculators">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-brand-heading md:text-xl">
          Kalkulatory medyczne
        </h1>
        <p className="text-sm text-muted-foreground">
          {CALCULATORS.length} narzędzi · wyniki orientacyjne, nie zastępują
          oceny klinicznej
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit border-slate-200 bg-white shadow-sm ring-slate-200 lg:sticky lg:top-20">
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj kalkulatora…"
                className="h-9 pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <ScrollArea className="h-[min(520px,60vh)]">
              <ul className="space-y-0.5 px-2">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectCalc(c.id)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2.5 text-left text-sm transition",
                        activeId === c.id
                          ? "bg-brand text-white"
                          : "hover:bg-secondary text-slate-700"
                      )}
                    >
                      <span className="block font-medium">{c.shortName}</span>
                      <span
                        className={cn(
                          "block text-[11px]",
                          activeId === c.id
                            ? "text-white/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {c.category}
                      </span>
                    </button>
                  </li>
                ))}
                {filtered.length === 0 ? (
                  <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                    Brak wyników
                  </li>
                ) : null}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-brand">
                  <Calculator className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base text-brand-heading">
                    {active.name}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="mt-1 border-brand/20 bg-secondary text-brand-deep"
                  >
                    {active.category}
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {active.description}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Źródło: {active.source}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {active.fields.map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <Label className="text-xs">
                      {field.label}
                      {field.unit ? (
                        <span className="text-muted-foreground">
                          {" "}
                          ({field.unit})
                        </span>
                      ) : null}
                    </Label>
                    {field.type === "select" ? (
                      <Select
                        value={values[field.name] ?? field.defaultValue ?? ""}
                        onValueChange={(v) =>
                          setValues((prev) => ({ ...prev, [field.name]: v }))
                        }
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Wybierz" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="number"
                        className="h-10"
                        min={field.min}
                        max={field.max}
                        step={field.step ?? "any"}
                        placeholder={field.placeholder}
                        value={values[field.name] ?? ""}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button
                className="h-11 gap-2 bg-brand px-8 text-white hover:bg-brand-deep"
                onClick={handleCompute}
              >
                <Calculator className="size-4" />
                Oblicz
              </Button>
            </CardContent>
          </Card>

          {results ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((r, i) => (
                <Card
                  key={i}
                  className={cn(
                    "border shadow-sm ring-0",
                    resultStyles[r.level]
                  )}
                >
                  <CardContent className="pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                      {r.title}
                    </p>
                    <p className="mt-1 text-2xl font-bold">{r.value}</p>
                    <p className="mt-2 text-sm leading-snug opacity-90">
                      {r.interpretation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-slate-300 bg-white/60 shadow-none">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Uzupełnij pola i naciśnij <strong>Oblicz</strong>, aby zobaczyć
                wynik z interpretacją.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

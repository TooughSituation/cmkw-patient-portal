"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  loadIcdFromLocalStorage,
} from "@/lib/doctor/icd-client";
import type { Icd10Code } from "@/lib/doctor/icd-types";
import type { VisitDiagnosis } from "@/lib/doctor/types";

export function IcdPicker({
  onAdd,
  existingCodes = [],
}: {
  onAdd: (d: VisitDiagnosis) => void;
  existingCodes?: string[];
}) {
  const [codes, setCodes] = useState<Icd10Code[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setCodes(loadIcdFromLocalStorage());
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 1) return [];
    return codes
      .filter(
        (c) =>
          !existingCodes.includes(c.code) &&
          (c.code.toLowerCase().includes(query) ||
            c.namePl.toLowerCase().includes(query))
      )
      .slice(0, 8);
  }, [codes, q, existingCodes]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand/60" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj kodu lub opisu ICD-10… (min. 1 znak)"
          className="h-11 border-slate-200 bg-white pl-10 text-[15px] shadow-sm focus-visible:ring-brand/30"
          autoComplete="off"
        />
      </div>
      {q.trim().length >= 1 && results.length === 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          Brak wyników dla „{q.trim()}”.
        </p>
      ) : null}
      {results.length > 0 ? (
        <ul className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {results.map((c) => (
            <li
              key={c.code}
              className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition hover:bg-secondary/60"
            >
              <div className="min-w-0">
                <span className="font-mono font-semibold text-brand">
                  {c.code}
                </span>
                <span className="ml-2 text-slate-700">{c.namePl}</span>
              </div>
              <Button
                type="button"
                size="sm"
                className="h-8 shrink-0 gap-1 bg-brand text-white hover:bg-brand-deep"
                onClick={() => {
                  onAdd({
                    code: c.code,
                    namePl: c.namePl,
                    description: "",
                  });
                  setQ("");
                }}
              >
                <Plus className="size-3.5" />
                Dodaj
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

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
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj kodu lub opisu ICD-10…"
          className="h-10 pl-8"
        />
      </div>
      {results.length > 0 ? (
        <ul className="divide-y rounded-lg border border-slate-200 bg-white">
          {results.map((c) => (
            <li
              key={c.code}
              className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
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
                variant="outline"
                className="h-8 shrink-0 gap-1"
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

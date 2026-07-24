"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loadDrugsFromLocalStorage } from "@/lib/doctor/drugs-client";
import type { Drug } from "@/lib/doctor/drug-types";
import type { VisitPrescription } from "@/lib/doctor/types";

export function DrugPicker({
  onAdd,
}: {
  onAdd: (p: VisitPrescription) => void;
}) {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setDrugs(loadDrugsFromLocalStorage());
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 1) return [];
    return drugs
      .filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.inn.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [drugs, q]);

  const selected = drugs.find((d) => d.id === selectedId);

  function handleAdd() {
    if (!selected) return;
    onAdd({
      id: `rx-${crypto.randomUUID().slice(0, 8)}`,
      drugId: selected.id,
      drugName: selected.name,
      inn: selected.inn,
      dosage: dosage || selected.dosage.slice(0, 80),
      duration: duration || "wg zaleceń",
      notes,
    });
    setQ("");
    setSelectedId(null);
    setDosage("");
    setDuration("");
    setNotes("");
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm ring-1 ring-slate-100">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand/60" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSelectedId(null);
          }}
          placeholder="Szukaj leku (nazwa / INN)…"
          className="h-11 border-slate-200 bg-white pl-10 text-[15px] shadow-sm focus-visible:ring-brand/30"
          autoComplete="off"
        />
      </div>
      {q.trim().length >= 1 && results.length === 0 && !selectedId ? (
        <p className="px-1 text-xs text-muted-foreground">
          Brak leków dla „{q.trim()}”.
        </p>
      ) : null}
      {results.length > 0 && !selectedId ? (
        <ul className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {results.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-secondary"
                onClick={() => {
                  setSelectedId(d.id);
                  setQ(d.name);
                  setDosage("");
                }}
              >
                <span>
                  <span className="font-medium text-brand-heading">
                    {d.name}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {d.inn} · {d.strength}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {selected ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <p className="text-sm font-medium text-brand-heading">
              {selected.name}{" "}
              <span className="font-normal text-muted-foreground">
                ({selected.inn})
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Dawkowanie</Label>
            <Input
              className="h-9 bg-white"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="np. 1 tabl. 2×/d"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Okres</Label>
            <Input
              className="h-9 bg-white"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="np. 7 dni"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Uwagi</Label>
            <Input
              className="h-9 bg-white"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="opcjonalnie"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="button"
              className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep"
              onClick={handleAdd}
            >
              <Plus className="size-3.5" />
              Dodaj do zaleceń
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Pill,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/doctor/empty-state";
import {
  loadDrugsFromLocalStorage,
  resetDrugsLocalStorage,
} from "@/lib/doctor/drugs-client";
import {
  DRUG_SECTION_LABELS,
  type Drug,
  type DrugSectionKey,
} from "@/lib/doctor/drug-types";
import { cn } from "@/lib/utils";
import Link from "next/link";

const SECTIONS = Object.keys(DRUG_SECTION_LABELS) as DrugSectionKey[];

export function DrugsBrowser({
  initialQuery = "",
  highlightId,
}: {
  initialQuery?: string;
  highlightId?: string;
}) {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(
    highlightId ?? null
  );

  useEffect(() => {
    const list = loadDrugsFromLocalStorage();
    setDrugs(list);
    setLoading(false);
    if (highlightId) setSelectedId(highlightId);
    else if (list[0]) setSelectedId(list[0].id);
  }, [highlightId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drugs;
    return drugs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.inn.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.manufacturer.toLowerCase().includes(q)
    );
  }, [drugs, query]);

  const selected =
    filtered.find((d) => d.id === selectedId) ??
    drugs.find((d) => d.id === selectedId) ??
    filtered[0] ??
    null;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Ładowanie bazy leków…</span>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-5" data-tour="doctor-drugs">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-brand-heading md:text-xl">
            Baza leków
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} z {drugs.length} preparatów · dane mock (nie
            zastępują ChPL)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => {
            setDrugs(resetDrugsLocalStorage());
          }}
        >
          Przywróć seed
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj: nazwa handlowa lub INN…"
            className="h-11 bg-white pl-10 shadow-sm"
          />
          {query ? (
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setQuery("")}
              aria-label="Wyczyść"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <EmptyState
                title="Brak elementów do wyświetlenia"
                description="Zmień frazę wyszukiwania lub przywróć seed."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold">Nazwa</TableHead>
                      <TableHead className="hidden font-semibold sm:table-cell">
                        Postać
                      </TableHead>
                      <TableHead className="font-semibold">Dawka</TableHead>
                      <TableHead className="hidden font-semibold md:table-cell">
                        Opakowanie
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((d) => (
                      <TableRow
                        key={d.id}
                        className={cn(
                          "cursor-pointer",
                          selected?.id === d.id && "bg-secondary/80"
                        )}
                        onClick={() => setSelectedId(d.id)}
                      >
                        <TableCell>
                          <div className="font-medium text-slate-900">
                            {d.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {d.inn}
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-1 border-brand/20 bg-secondary text-[10px] text-brand-deep"
                          >
                            {d.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm sm:table-cell">
                          {d.form}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {d.strength}
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                          {d.packageSize}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit border-slate-200 bg-white shadow-sm ring-slate-200 xl:sticky xl:top-20">
          {!selected ? (
            <EmptyState title="Wybierz lek z listy" />
          ) : (
            <>
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-brand">
                    <Pill className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base text-brand-heading">
                      {selected.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selected.inn}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selected.manufacturer}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Postać</dt>
                    <dd>{selected.form}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Dawka</dt>
                    <dd className="font-medium">{selected.strength}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Opakowanie</dt>
                    <dd>{selected.packageSize}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Cena orient.
                    </dt>
                    <dd className="font-medium text-brand">
                      {selected.pricePln.toFixed(2)} zł
                    </dd>
                  </div>
                </dl>

                {selected.relatedIcd10.length > 0 ? (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Powiązane ICD-10
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selected.relatedIcd10.map((code) => (
                        <Link
                          key={code}
                          href={`/doctor/icd10?q=${encodeURIComponent(code)}`}
                          className="rounded-md border border-brand/20 bg-secondary px-2 py-0.5 font-mono text-xs text-brand hover:bg-brand hover:text-white"
                        >
                          {code}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                <ScrollArea className="h-[min(420px,50vh)] pr-3">
                  <div className="space-y-3">
                    {SECTIONS.map((key) => (
                      <section key={key}>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-heading">
                          {DRUG_SECTION_LABELS[key]}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-700">
                          {selected[key]}
                        </p>
                      </section>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

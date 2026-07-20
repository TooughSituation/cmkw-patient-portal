"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/doctor/empty-state";
import {
  loadIcdFromLocalStorage,
  resetIcdLocalStorage,
} from "@/lib/doctor/icd-client";
import { loadDrugsFromLocalStorage } from "@/lib/doctor/drugs-client";
import { ICD_CHAPTERS, type Icd10Code } from "@/lib/doctor/icd-types";
import type { Drug } from "@/lib/doctor/drug-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function IcdBrowser({ initialQuery = "" }: { initialQuery?: string }) {
  const [codes, setCodes] = useState<Icd10Code[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [chapter, setChapter] = useState("all");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const list = loadIcdFromLocalStorage();
    setCodes(list);
    setDrugs(loadDrugsFromLocalStorage());
    setLoading(false);
    if (initialQuery) {
      const match = list.find(
        (c) =>
          c.code.toLowerCase() === initialQuery.toLowerCase() ||
          c.code.toLowerCase().startsWith(initialQuery.toLowerCase())
      );
      if (match) setSelectedCode(match.code);
      else if (list[0]) setSelectedCode(list[0].code);
    } else if (list[0]) {
      setSelectedCode(list[0].code);
    }
  }, [initialQuery]);

  const filtered = useMemo(() => {
    let list = [...codes];
    if (chapter !== "all") {
      list = list.filter((c) => c.chapter === chapter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.namePl.toLowerCase().includes(q) ||
          c.nameLa.toLowerCase().includes(q) ||
          c.specialty.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.code.localeCompare(b.code, "pl"));
  }, [codes, chapter, query]);

  const selected =
    filtered.find((c) => c.code === selectedCode) ??
    codes.find((c) => c.code === selectedCode) ??
    filtered[0] ??
    null;

  const relatedDrugs = useMemo(() => {
    if (!selected?.relatedDrugIds?.length) return [];
    return drugs.filter((d) => selected.relatedDrugIds.includes(d.id));
  }, [selected, drugs]);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Skopiowano: ${code}`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Nie udało się skopiować");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Ładowanie ICD-10…</span>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-5" data-tour="doctor-icd">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-brand-heading md:text-xl">
            ICD-10
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} z {codes.length} kodów · mock edukacyjny
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => setCodes(resetIcdLocalStorage())}
        >
          Przywróć seed
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kod lub opis (np. M17.1, gonartroza)…"
            className="h-11 bg-white pl-10 shadow-sm"
          />
          {query ? (
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
              onClick={() => setQuery("")}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <Select value={chapter} onValueChange={setChapter}>
          <SelectTrigger className="h-11 w-full bg-white sm:w-[200px]">
            <SelectValue placeholder="Rozdział" />
          </SelectTrigger>
          <SelectContent>
            {ICD_CHAPTERS.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <EmptyState title="Brak elementów do wyświetlenia" />
            ) : (
              <ScrollArea className="h-[min(640px,70vh)]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="w-[100px] font-semibold">
                        Kod
                      </TableHead>
                      <TableHead className="font-semibold">Nazwa PL</TableHead>
                      <TableHead className="hidden font-semibold lg:table-cell">
                        Specjalność
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow
                        key={c.code}
                        className={cn(
                          "cursor-pointer",
                          selected?.code === c.code && "bg-secondary/80"
                        )}
                        onClick={() => setSelectedCode(c.code)}
                      >
                        <TableCell className="font-mono font-semibold text-brand">
                          {c.code}
                        </TableCell>
                        <TableCell className="text-sm">{c.namePl}</TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                          {c.specialty}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit border-slate-200 bg-white shadow-sm ring-slate-200 xl:sticky xl:top-20">
          {!selected ? (
            <EmptyState title="Wybierz kod z listy" />
          ) : (
            <>
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-2xl font-bold text-brand">
                      {selected.code}
                    </p>
                    <CardTitle className="mt-1 text-base leading-snug text-brand-heading">
                      {selected.namePl}
                    </CardTitle>
                    <p className="mt-1 text-sm italic text-muted-foreground">
                      {selected.nameLa}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 gap-1.5"
                    onClick={() => copyCode(selected.code)}
                  >
                    {copied ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    Kopiuj
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <dl className="grid gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Rodzaj</dt>
                    <dd>
                      <Badge variant="outline">{selected.kind}</Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Specjalność
                    </dt>
                    <dd className="font-medium">{selected.specialty}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Rozdział</dt>
                    <dd className="font-mono">{selected.chapter}</dd>
                  </div>
                </dl>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Powiązane leki
                  </p>
                  {relatedDrugs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Brak powiązań w seedzie.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {relatedDrugs.map((d) => (
                        <li key={d.id}>
                          <Link
                            href={`/doctor/leki?id=${d.id}`}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm transition hover:border-brand/30 hover:bg-secondary"
                          >
                            <span>
                              <span className="font-medium text-brand">
                                {d.name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {d.inn}
                              </span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {d.strength}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

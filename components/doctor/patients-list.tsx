"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { EmptyState } from "@/components/doctor/empty-state";
import { PatientGroups } from "@/components/doctor/patient-groups";
import { useDoctorPatients } from "@/hooks/use-doctor-patients";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import {
  PATIENT_STATUS_LABELS,
  maskPesel,
  type DoctorPatient,
  type PatientGroup,
  type PatientStatus,
} from "@/lib/doctor/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type SortKey =
  | "lastName"
  | "firstName"
  | "birthDate"
  | "lastVisit"
  | "status";

const statusBadge: Record<PatientStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  inactive: "border-amber-200 bg-amber-50 text-amber-800",
  archived: "border-slate-200 bg-slate-100 text-slate-600",
};

export function PatientsList() {
  const { patients, loading, reset } = useDoctorPatients();
  const { visits } = useDoctorVisits();

  const [qLastName, setQLastName] = useState("");
  const [qFirstName, setQFirstName] = useState("");
  const [qPesel, setQPesel] = useState("");
  const [qPhone, setQPhone] = useState("");
  const [qCard, setQCard] = useState("");
  const [status, setStatus] = useState<PatientStatus | "all">("all");
  const [group, setGroup] = useState<PatientGroup | "all">("all");
  const [city, setCity] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("lastName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const lastVisitByPatient = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of visits) {
      if (!v.patientId) continue;
      const prev = map.get(v.patientId);
      const key = `${v.date}T${v.time}`;
      if (!prev || key > prev) map.set(v.patientId, key);
    }
    return map;
  }, [visits]);

  const filtered = useMemo(() => {
    let list = [...patients];

    if (qLastName.trim()) {
      const q = qLastName.trim().toLowerCase();
      list = list.filter((p) => p.lastName.toLowerCase().includes(q));
    }
    if (qFirstName.trim()) {
      const q = qFirstName.trim().toLowerCase();
      list = list.filter((p) => p.firstName.toLowerCase().includes(q));
    }
    if (qPesel.trim()) {
      const q = qPesel.trim();
      list = list.filter((p) => p.pesel.includes(q));
    }
    if (qPhone.trim()) {
      const q = qPhone.replace(/\D/g, "");
      list = list.filter((p) => p.phone.replace(/\D/g, "").includes(q));
    }
    if (qCard.trim()) {
      const q = qCard.trim().toLowerCase();
      list = list.filter((p) => p.cardNumber.toLowerCase().includes(q));
    }
    if (status !== "all") list = list.filter((p) => p.status === status);
    if (group !== "all") list = list.filter((p) => p.groups.includes(group));
    if (city.trim()) {
      const q = city.trim().toLowerCase();
      list = list.filter((p) => p.city.toLowerCase().includes(q));
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "lastName":
          cmp = a.lastName.localeCompare(b.lastName, "pl");
          if (cmp === 0) cmp = a.firstName.localeCompare(b.firstName, "pl");
          break;
        case "firstName":
          cmp = a.firstName.localeCompare(b.firstName, "pl");
          break;
        case "birthDate":
          cmp = a.birthDate.localeCompare(b.birthDate);
          break;
        case "lastVisit": {
          const la = lastVisitByPatient.get(a.id) ?? "";
          const lb = lastVisitByPatient.get(b.id) ?? "";
          cmp = la.localeCompare(lb);
          break;
        }
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return cmp * dir;
    });

    return list;
  }, [
    patients,
    qLastName,
    qFirstName,
    qPesel,
    qPhone,
    qCard,
    status,
    group,
    city,
    sortKey,
    sortDir,
    lastVisitByPatient,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="inline size-3.5" />
    ) : (
      <ChevronDown className="inline size-3.5" />
    );
  }

  function formatLastVisit(p: DoctorPatient) {
    const raw = lastVisitByPatient.get(p.id);
    if (!raw) return "—";
    const [date] = raw.split("T");
    try {
      return format(parseISO(date!), "d MMM yyyy", { locale: pl });
    } catch {
      return date ?? "—";
    }
  }

  function clearFilters() {
    setQLastName("");
    setQFirstName("");
    setQPesel("");
    setQPhone("");
    setQCard("");
    setStatus("all");
    setGroup("all");
    setCity("");
    setPage(1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Ładowanie pacjentów…</span>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-brand-heading md:text-xl">
            Pacjenci
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "pacjent"
              : filtered.length < 5
                ? "pacjentów"
                : "pacjentów"}{" "}
            w wynikach
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-9 gap-1.5 border-brand/30 text-brand hover:bg-secondary"
            onClick={() =>
              toast.info("Wyszukiwanie IVR", {
                description: "Integracja z call center — Etap 3",
              })
            }
          >
            <Phone className="size-4" />
            Wyszukiwanie IVR
          </Button>
          <Button
            asChild
            className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep"
          >
            <Link href="/doctor/pacjenci/nowy">
              <Plus className="size-4" />
              Dodaj pacjenta
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-4 border-slate-200 bg-white shadow-sm ring-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-brand-heading">
            Wyszukiwanie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs">Nazwisko</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={qLastName}
                  onChange={(e) => {
                    setQLastName(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 pl-8"
                  placeholder="Kowalska…"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Imię</Label>
              <Input
                value={qFirstName}
                onChange={(e) => {
                  setQFirstName(e.target.value);
                  setPage(1);
                }}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">PESEL</Label>
              <Input
                value={qPesel}
                onChange={(e) => {
                  setQPesel(e.target.value.replace(/\D/g, "").slice(0, 11));
                  setPage(1);
                }}
                className="h-9 font-mono"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telefon</Label>
              <Input
                value={qPhone}
                onChange={(e) => {
                  setQPhone(e.target.value);
                  setPage(1);
                }}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nr karty wewn.</Label>
              <Input
                value={qCard}
                onChange={(e) => {
                  setQCard(e.target.value);
                  setPage(1);
                }}
                className="h-9 font-mono"
                placeholder="CMKW-…"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-brand"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? "Ukryj filtry" : "Filtry zaawansowane"}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  showAdvanced && "rotate-180"
                )}
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={clearFilters}
            >
              Wyczyść
            </Button>
          </div>

          {showAdvanced && (
            <div className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v as PatientStatus | "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    <SelectItem value="active">Aktywny</SelectItem>
                    <SelectItem value="inactive">Nieaktywny</SelectItem>
                    <SelectItem value="archived">Zarchiwizowany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Grupa</Label>
                <Select
                  value={group}
                  onValueChange={(v) => {
                    setGroup(v as PatientGroup | "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie grupy</SelectItem>
                    {(
                      [
                        "VIP",
                        "NFZ",
                        "Prywatny",
                        "Sport",
                        "Pooperacyjny",
                        "Nowy",
                      ] as PatientGroup[]
                    ).map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Miasto</Label>
                <Input
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 bg-white"
                  placeholder="Białystok…"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
        <CardContent className="p-0">
          {pageItems.length === 0 ? (
            <EmptyState
              title="Brak elementów do wyświetlenia"
              description="Zmień kryteria wyszukiwania albo dodaj pierwszego pacjenta."
              className="py-12"
            />
          ) : null}

          {pageItems.length === 0 && patients.length === 0 ? (
            <div className="flex justify-center gap-2 pb-10">
              <Button
                className="gap-2 bg-brand text-white hover:bg-brand-deep"
                onClick={() => {
                  reset();
                  toast.success("Pobrano dane seed (20 pacjentów).");
                }}
              >
                <Download className="size-4" />
                Pobierz dane
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/doctor/pacjenci/nowy">
                  <UserPlus className="size-4" />
                  Dodaj pacjenta
                </Link>
              </Button>
            </div>
          ) : null}

          {pageItems.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-semibold"
                          onClick={() => toggleSort("lastName")}
                        >
                          Nazwisko <SortIcon k="lastName" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-semibold"
                          onClick={() => toggleSort("firstName")}
                        >
                          Imię <SortIcon k="firstName" />
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold">PESEL</TableHead>
                      <TableHead className="hidden font-semibold sm:table-cell">
                        Telefon
                      </TableHead>
                      <TableHead className="hidden font-semibold md:table-cell">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleSort("birthDate")}
                        >
                          Data ur. <SortIcon k="birthDate" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden font-semibold lg:table-cell">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleSort("lastVisit")}
                        >
                          Ostatnia wizyta <SortIcon k="lastVisit" />
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleSort("status")}
                        >
                          Status <SortIcon k="status" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[90px] text-right font-semibold">
                        Akcje
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link
                            href={`/doctor/pacjenci/${p.id}`}
                            className="font-medium text-brand hover:underline"
                          >
                            {p.lastName}
                          </Link>
                          <div className="mt-0.5 md:hidden">
                            <PatientGroups groups={p.groups} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/doctor/pacjenci/${p.id}`}
                            className="text-slate-800 hover:text-brand"
                          >
                            {p.firstName}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">
                          {maskPesel(p.pesel)}
                        </TableCell>
                        <TableCell className="hidden text-sm sm:table-cell">
                          {p.phone}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-sm text-slate-600 md:table-cell">
                          {format(parseISO(p.birthDate), "d.MM.yyyy")}
                        </TableCell>
                        <TableCell className="hidden text-sm text-slate-600 lg:table-cell">
                          {formatLastVisit(p)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium",
                              statusBadge[p.status]
                            )}
                          >
                            {PATIENT_STATUS_LABELS[p.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-0.5">
                            <Button
                              asChild
                              variant="ghost"
                              size="icon-sm"
                              className="text-slate-500 hover:text-brand"
                            >
                              <Link
                                href={`/doctor/pacjenci/${p.id}`}
                                aria-label="Podgląd"
                              >
                                <Eye className="size-3.5" />
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant="ghost"
                              size="icon-sm"
                              className="text-slate-500 hover:text-brand"
                            >
                              <Link
                                href={`/doctor/pacjenci/${p.id}/edytuj`}
                                aria-label="Edytuj"
                              >
                                <Pencil className="size-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Strona {safePage} z {totalPages} ·{" "}
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filtered.length)} z{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Poprzednia strona"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    aria-label="Następna strona"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

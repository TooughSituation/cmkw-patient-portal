"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import { VisitStatusBadge } from "@/components/doctor/visit-status-badge";
import { PatientGroups } from "@/components/doctor/patient-groups";
import { VisitRowActions } from "@/components/doctor/visit-row-actions";
import { EmptyState } from "@/components/doctor/empty-state";
import { PatientNameLink } from "@/components/doctor/patient-name-link";
import { QuickVisitDialog } from "@/components/doctor/quick-visit-dialog";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import {
  VISIT_STATUS_LABELS,
  maskPesel,
  type VisitStatus,
} from "@/lib/doctor/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export function VisitsList() {
  const { visits, loading, updateStatus } = useDoctorVisits();
  const { seesAllDoctors, allStaffDoctors } = useDoctorData();

  const [patient, setPatient] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [doctorId, setDoctorId] = useState("all");
  const [status, setStatus] = useState<VisitStatus | "all">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...visits];

    if (patient.trim()) {
      const q = patient.trim().toLowerCase();
      list = list.filter(
        (v) =>
          `${v.patientFirstName} ${v.patientLastName}`
            .toLowerCase()
            .includes(q) || v.patientPesel.includes(q)
      );
    }
    if (dateFrom) list = list.filter((v) => v.date >= dateFrom);
    if (dateTo) list = list.filter((v) => v.date <= dateTo);
    if (doctorId !== "all") {
      list = list.filter((v) => v.doctorId === doctorId);
    }
    if (status !== "all") {
      list = list.filter((v) => v.status === status);
    }

    return list.sort((a, b) => {
      const da = `${a.date}T${a.time}`;
      const db = `${b.date}T${b.time}`;
      return db.localeCompare(da);
    });
  }, [visits, patient, dateFrom, dateTo, doctorId, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function resetFilters() {
    setPatient("");
    setDateFrom("");
    setDateTo("");
    setDoctorId("all");
    setStatus("all");
    setPage(1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Ładowanie wizyt…</span>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-brand-heading md:text-xl">
            Lista wizyt
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "wizyta"
              : filtered.length < 5
                ? "wizyty"
                : "wizyt"}{" "}
            (wszystkie filtry)
          </p>
        </div>
        <QuickVisitDialog
          trigger={
            <Button className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep">
              <Plus className="size-4" />
              Dodaj wizytę
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <Card className="mb-4 border-slate-200 bg-white shadow-sm ring-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-brand-heading">
            Filtry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="f-patient" className="text-xs">
                Pacjent
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="f-patient"
                  value={patient}
                  onChange={(e) => {
                    setPatient(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Imię, nazwisko, PESEL…"
                  className="h-9 pl-8"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-from" className="text-xs">
                Data od
              </Label>
              <Input
                id="f-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-to" className="text-xs">
                Data do
              </Label>
              <Input
                id="f-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="h-9"
              />
            </div>
            {seesAllDoctors ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Lekarz</Label>
                <Select
                  value={doctorId}
                  onValueChange={(v) => {
                    setDoctorId(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Wszyscy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszyscy lekarze</SelectItem>
                    {allStaffDoctors.map((d) => (
                      <SelectItem
                        key={d.doctorId ?? d.id}
                        value={d.doctorId ?? d.id}
                      >
                        {d.title} {d.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label className="text-xs">Stan</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as VisitStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie stany</SelectItem>
                  {(
                    [
                      "scheduled",
                      "confirmed",
                      "teleconfirmed",
                      "in_progress",
                      "completed",
                      "cancelled",
                    ] as VisitStatus[]
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {VISIT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600"
              onClick={resetFilters}
            >
              Wyczyść filtry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
        <CardContent className="p-0">
          {pageItems.length === 0 ? (
            <EmptyState
              title="Brak elementów do wyświetlenia"
              description="Zmień filtry lub dodaj nową wizytę."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Pacjent</TableHead>
                    <TableHead className="hidden font-semibold md:table-cell">
                      Grupy pacjenta
                    </TableHead>
                    <TableHead className="hidden font-semibold sm:table-cell">
                      PESEL
                    </TableHead>
                    <TableHead className="hidden font-semibold lg:table-cell">
                      Lekarz
                    </TableHead>
                    <TableHead className="hidden font-semibold xl:table-cell">
                      Notatka
                    </TableHead>
                    <TableHead className="font-semibold">Stan</TableHead>
                    <TableHead className="w-[100px] text-right font-semibold">
                      Akcje
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((v) => (
                    <TableRow
                      key={v.id}
                      className={cn(
                        v.status === "cancelled" && "opacity-60"
                      )}
                    >
                      <TableCell className="whitespace-nowrap">
                        <Link
                          href={`/doctor/wizyty/${v.id}`}
                          className="font-medium text-brand hover:underline"
                        >
                          {format(parseISO(v.date), "d MMM yyyy", {
                            locale: pl,
                          })}
                        </Link>
                        <div className="font-mono text-xs text-slate-500">
                          {v.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PatientNameLink
                          patientId={v.patientId}
                          firstName={v.patientFirstName}
                          lastName={v.patientLastName}
                        />
                        <div className="text-xs text-slate-400 lg:hidden">
                          {v.doctorName}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <PatientGroups groups={v.patientGroups} />
                      </TableCell>
                      <TableCell className="hidden font-mono text-sm text-slate-600 sm:table-cell">
                        {maskPesel(v.patientPesel)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-slate-600 lg:table-cell">
                        {v.doctorName}
                      </TableCell>
                      <TableCell className="hidden max-w-[200px] truncate text-sm text-slate-500 xl:table-cell">
                        {v.note || "—"}
                      </TableCell>
                      <TableCell>
                        <VisitStatusBadge status={v.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <VisitRowActions
                          visit={v}
                          onStatusChange={updateStatus}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Strona {safePage} z {totalPages} · {(safePage - 1) * PAGE_SIZE + 1}
                –
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Następna strona"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/doctor/empty-state";
import {
  EPrescriptionPreview,
  EReferralPreview,
  StatusBadge,
} from "@/components/doctor/e-document-preview";
import { useEHealth } from "@/hooks/use-ehealth";
import type { EPrescription, EReferral } from "@/lib/doctor/ehealth-types";
import {
  E_PRESCRIPTION_KIND_LABELS,
  E_REFERRAL_URGENCY_LABELS,
} from "@/lib/doctor/ehealth-types";

type DocRow =
  | { kind: "rx"; doc: EPrescription }
  | { kind: "ref"; doc: EReferral };

export function PatientEHealthHistory({ patientId }: { patientId: string }) {
  const {
    loading,
    prescriptionsForPatient,
    referralsForPatient,
    annulPrescription,
    annulReferral,
    markSmsSent,
  } = useEHealth();

  const [typeFilter, setTypeFilter] = useState<"all" | "rx" | "ref">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "issued" | "cancelled">(
    "all"
  );
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [previewRx, setPreviewRx] = useState<EPrescription | null>(null);
  const [previewRef, setPreviewRef] = useState<EReferral | null>(null);

  const rxList = prescriptionsForPatient(patientId);
  const refList = referralsForPatient(patientId);

  const doctors = useMemo(() => {
    const set = new Set<string>();
    for (const r of rxList) set.add(r.doctorName);
    for (const r of refList) set.add(r.doctorName);
    return Array.from(set).sort();
  }, [rxList, refList]);

  const rows = useMemo(() => {
    const all: DocRow[] = [
      ...rxList.map((doc) => ({ kind: "rx" as const, doc })),
      ...refList.map((doc) => ({ kind: "ref" as const, doc })),
    ];
    return all
      .filter((row) => {
        if (typeFilter === "rx" && row.kind !== "rx") return false;
        if (typeFilter === "ref" && row.kind !== "ref") return false;
        if (statusFilter !== "all" && row.doc.status !== statusFilter)
          return false;
        if (doctorFilter !== "all" && row.doc.doctorName !== doctorFilter)
          return false;
        const day = row.doc.issuedAt.slice(0, 10);
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
        return true;
      })
      .sort((a, b) => b.doc.issuedAt.localeCompare(a.doc.issuedAt));
  }, [
    rxList,
    refList,
    typeFilter,
    statusFilter,
    doctorFilter,
    dateFrom,
    dateTo,
  ]);

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Ładowanie historii e-dokumentów…
      </p>
    );
  }

  return (
    <div className="space-y-4" data-tour="patient-ehealth">
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Filter className="size-3.5" />
          Filtry
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-[11px]">Typ</Label>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
            >
              <SelectTrigger className="h-9 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="rx">e-Recepty</SelectItem>
                <SelectItem value="ref">e-Skierowania</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="h-9 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="issued">Wystawione</SelectItem>
                <SelectItem value="cancelled">Anulowane</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Lekarz</Label>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="h-9 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszyscy</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Data od</Label>
            <Input
              type="date"
              className="h-9 bg-white"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Data do</Label>
            <Input
              type="date"
              className="h-9 bg-white"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Brak e-recept i e-skierowań"
          description="Dokumenty pojawią się po wystawieniu z karty wizyty."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>Data</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Numer</TableHead>
                <TableHead className="hidden md:table-cell">Opis</TableHead>
                <TableHead className="hidden lg:table-cell">Lekarz</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                if (row.kind === "rx") {
                  const d = row.doc;
                  const desc = `${E_PRESCRIPTION_KIND_LABELS[d.kind]} · ${d.items.map((i) => i.drugName).join(", ")}`;
                  return (
                    <TableRow key={`rx-${d.id}`}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(parseISO(d.issuedAt), "d MMM yyyy", {
                          locale: pl,
                        })}
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {format(parseISO(d.issuedAt), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        e-Recepta
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-brand">
                          {d.number}
                        </span>
                        {d.visitId ? (
                          <div>
                            <Link
                              href={`/doctor/wizyty/${d.visitId}`}
                              className="text-[11px] text-muted-foreground hover:text-brand hover:underline"
                            >
                              wizyta
                            </Link>
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="hidden max-w-[220px] truncate text-sm text-slate-700 md:table-cell">
                        {desc}
                      </TableCell>
                      <TableCell className="hidden text-sm lg:table-cell">
                        {d.doctorName}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={d.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => setPreviewRx(d)}
                        >
                          <Eye className="size-3.5" />
                          Otwórz
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }

                const d = row.doc;
                const desc = `${d.examType}${d.urgency === "urgent" ? ` · ${E_REFERRAL_URGENCY_LABELS.urgent}` : ""}`;
                return (
                  <TableRow key={`ref-${d.id}`}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(parseISO(d.issuedAt), "d MMM yyyy", {
                        locale: pl,
                      })}
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {format(parseISO(d.issuedAt), "HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      e-Skierowanie
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-brand">
                        {d.number}
                      </span>
                      {d.visitId ? (
                        <div>
                          <Link
                            href={`/doctor/wizyty/${d.visitId}`}
                            className="text-[11px] text-muted-foreground hover:text-brand hover:underline"
                          >
                            wizyta
                          </Link>
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden max-w-[220px] truncate text-sm text-slate-700 md:table-cell">
                      {desc}
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">
                      {d.doctorName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => setPreviewRef(d)}
                      >
                        <Eye className="size-3.5" />
                        Otwórz
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Łącznie: {rxList.length} e-recept · {refList.length} e-skierowań · widok
        po filtrach: {rows.length}
      </p>

      <EPrescriptionPreview
        rx={previewRx}
        open={!!previewRx}
        onOpenChange={(v) => {
          if (!v) setPreviewRx(null);
        }}
        onCancel={(id, reason) => annulPrescription(id, reason)}
        onSms={(id) => markSmsSent(id)}
      />
      <EReferralPreview
        refDoc={previewRef}
        open={!!previewRef}
        onOpenChange={(v) => {
          if (!v) setPreviewRef(null);
        }}
        onCancel={(id, reason) => annulReferral(id, reason)}
      />
    </div>
  );
}

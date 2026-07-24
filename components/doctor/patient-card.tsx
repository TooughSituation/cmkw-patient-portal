"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  BookMarked,
  Calculator,
  CalendarPlus,
  FileText,
  Loader2,
  Pencil,
  Pill,
  Printer,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PatientGroups } from "@/components/doctor/patient-groups";
import { VisitStatusBadge } from "@/components/doctor/visit-status-badge";
import { EmptyState } from "@/components/doctor/empty-state";
import { DocumentsPanel } from "@/components/doctor/documents-panel";
import { PatientEHealthHistory } from "@/components/doctor/patient-ehealth-history";
import { useDoctorPatients } from "@/hooks/use-doctor-patients";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import {
  PATIENT_SEX_LABELS,
  PATIENT_STATUS_LABELS,
  VISIT_TYPE_LABELS,
  maskPesel,
} from "@/lib/doctor/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PatientCard({ patientId }: { patientId: string }) {
  const { getById, loading: patientsLoading } = useDoctorPatients();
  const { visits, loading: visitsLoading } = useDoctorVisits();
  const patient = getById(patientId);

  const patientVisits = useMemo(() => {
    return visits
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  }, [visits, patientId]);

  const lastVisit = patientVisits[0];
  const loading = patientsLoading || visitsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Ładowanie karty…</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <EmptyState
          title="Brak dostępu do pacjenta"
          description="Pacjent nie istnieje albo nie jest powiązany z Twoimi wizytami / zakresem widoczności."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/doctor/pacjenci">Wróć do listy</Link>
          </Button>
        </div>
      </div>
    );
  }

  const address = [
    [patient.street, patient.buildingNo].filter(Boolean).join(" "),
    patient.apartmentNo ? `m. ${patient.apartmentNo}` : "",
    [patient.postalCode, patient.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="p-3 md:p-4 lg:p-5">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-start md:justify-between md:p-5">
        <div className="flex gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-brand">
            <UserRound className="size-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-brand-heading md:text-2xl">
              {patient.lastName} {patient.firstName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">PESEL {maskPesel(patient.pesel)}</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-slate-600">
                {patient.cardNumber}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "font-medium",
                  patient.status === "active" &&
                    "border-emerald-200 bg-emerald-50 text-emerald-800",
                  patient.status === "inactive" &&
                    "border-amber-200 bg-amber-50 text-amber-800",
                  patient.status === "archived" &&
                    "border-slate-200 bg-slate-100 text-slate-600"
                )}
              >
                {PATIENT_STATUS_LABELS[patient.status]}
              </Badge>
            </div>
            <div className="mt-2">
              <PatientGroups groups={patient.groups} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep">
            <Link href="/doctor">
              <CalendarPlus className="size-4" />
              Nowa wizyta
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9 gap-1.5">
            <Link href={`/doctor/pacjenci/${patient.id}/edytuj`}>
              <Pencil className="size-4" />
              Edytuj
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-1.5"
            onClick={() => {
              toast.success("Przygotowano do druku (podgląd przeglądarki)");
              window.print();
            }}
          >
            <Printer className="size-4" />
            Drukuj
          </Button>
          <Button asChild variant="outline" className="h-9 gap-1.5">
            <Link href="/doctor/leki">
              <Pill className="size-4" />
              Dodaj lek
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9 gap-1.5">
            <Link href="/doctor/icd10">
              <BookMarked className="size-4" />
              Dodaj kod ICD
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <Tabs defaultValue="historia" className="min-w-0">
          <TabsList className="mb-3 h-auto w-full flex-wrap justify-start gap-1 bg-white p-1 shadow-sm ring-1 ring-slate-200">
            <TabsTrigger value="historia" className="text-sm">
              Historia wizyt
            </TabsTrigger>
            <TabsTrigger value="erecepty" className="text-sm">
              e-Recepty / e-Skierowania
            </TabsTrigger>
            <TabsTrigger value="dane" className="text-sm">
              Dane osobowe
            </TabsTrigger>
            <TabsTrigger value="dokumenty" className="text-sm">
              Notatki / Dokumenty
            </TabsTrigger>
            <TabsTrigger value="grupy" className="text-sm">
              Grupy i zgody
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historia">
            <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
              <CardContent className="p-0">
                {patientVisits.length === 0 ? (
                  <EmptyState
                    title="Brak wizyt"
                    description="Ten pacjent nie ma jeszcze wizyt w EDM."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                          <TableHead className="font-semibold">Data</TableHead>
                          <TableHead className="font-semibold">Lekarz</TableHead>
                          <TableHead className="hidden font-semibold sm:table-cell">
                            Typ
                          </TableHead>
                          <TableHead className="font-semibold">Stan</TableHead>
                          <TableHead className="hidden font-semibold lg:table-cell">
                            Notatka
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientVisits.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell className="whitespace-nowrap">
                              <Link
                                href={`/doctor/wizyty/${v.id}`}
                                className="font-medium text-brand hover:underline"
                              >
                                {format(parseISO(v.date), "d MMM yyyy", {
                                  locale: pl,
                                })}
                              </Link>
                              <div className="font-mono text-xs text-muted-foreground">
                                {v.time}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {v.doctorName}
                            </TableCell>
                            <TableCell className="hidden text-sm sm:table-cell">
                              {VISIT_TYPE_LABELS[v.type]}
                            </TableCell>
                            <TableCell>
                              <VisitStatusBadge status={v.status} />
                            </TableCell>
                            <TableCell className="hidden max-w-[220px] truncate text-sm text-muted-foreground lg:table-cell">
                              {v.note || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="erecepty">
            <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-brand-heading">
                  <Pill className="size-4 text-brand" />
                  Historia recept i skierowań
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PatientEHealthHistory patientId={patient.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dane">
            <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
              <CardHeader>
                <CardTitle className="text-base text-brand-heading">
                  Dane osobowe i kontaktowe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Imię i nazwisko">
                    {patient.firstName} {patient.lastName}
                  </Field>
                  <Field label="PESEL (maskowany)">
                    <span className="font-mono">{maskPesel(patient.pesel)}</span>
                  </Field>
                  <Field label="Data urodzenia">
                    {format(parseISO(patient.birthDate), "d MMMM yyyy", {
                      locale: pl,
                    })}
                  </Field>
                  <Field label="Płeć">
                    {PATIENT_SEX_LABELS[patient.sex]}
                  </Field>
                  <Field label="Telefon">{patient.phone || "—"}</Field>
                  <Field label="E-mail">{patient.email || "—"}</Field>
                  <Field label="Adres" className="sm:col-span-2">
                    {address || "—"}
                  </Field>
                  <Field label="Nr karty wewn.">
                    <span className="font-mono">{patient.cardNumber}</span>
                  </Field>
                  <Field label="Status">
                    {PATIENT_STATUS_LABELS[patient.status]}
                  </Field>
                </dl>
                <p className="mt-4 text-xs text-muted-foreground">
                  Pełny PESEL dostępny wyłącznie w trybie edycji (personel
                  uprawniony).
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dokumenty">
            <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-brand-heading">
                  <FileText className="size-4 text-brand" />
                  Notatki / Dokumenty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.notes ? (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
                    {patient.notes}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Brak notatek przy pacjencie.
                  </p>
                )}
                <DocumentsPanel patientId={patient.id} scope="patient" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grupy">
            <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
              <CardHeader>
                <CardTitle className="text-base text-brand-heading">
                  Grupy i zgody
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Grupy pacjenta
                  </p>
                  <PatientGroups groups={patient.groups} />
                  {patient.groups.length === 0 && (
                    <p className="text-sm text-muted-foreground">Brak grup</p>
                  )}
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Zgoda RODO
                  </p>
                  <p className="mt-1 text-sm">
                    {patient.rodConsent ? (
                      <span className="font-medium text-emerald-700">
                        Udzielona
                        {patient.rodConsentAt
                          ? ` · ${format(parseISO(patient.rodConsentAt), "d.MM.yyyy HH:mm")}`
                          : ""}
                      </span>
                    ) : (
                      <span className="font-medium text-amber-700">
                        Brak zgody
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary column */}
        <div className="space-y-3">
          <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-brand-heading">
                Podsumowanie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Liczba wizyt</p>
                <p className="text-lg font-semibold text-slate-900">
                  {patientVisits.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ostatnia wizyta</p>
                <p className="font-medium text-slate-800">
                  {lastVisit
                    ? `${format(parseISO(lastVisit.date), "d MMM yyyy", { locale: pl })} · ${lastVisit.time}`
                    : "—"}
                </p>
                {lastVisit ? (
                  <p className="text-xs text-muted-foreground">
                    {lastVisit.doctorName}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Grupy</p>
                <PatientGroups groups={patient.groups} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefon</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
            </CardContent>
          </Card>
          <Button asChild variant="outline" className="w-full">
            <Link href="/doctor/pacjenci">← Lista pacjentów</Link>
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 gap-1">
              <Link href="/doctor/leki">
                <Pill className="size-3.5" />
                Leki
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 gap-1">
              <Link href="/doctor/kalkulatory">
                <Calculator className="size-3.5" />
                Kalk.
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{children}</dd>
    </div>
  );
}

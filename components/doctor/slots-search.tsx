"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, addDays } from "date-fns";
import { pl } from "date-fns/locale";
import { Fragment } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/doctor/empty-state";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { useDoctorPatients } from "@/hooks/use-doctor-patients";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import {
  generateFreeSlots,
  groupSlotsByDoctor,
  type FreeSlot,
} from "@/lib/doctor/slots";
import {
  emptyVisitClinical,
  type DoctorVisit,
  type VisitType,
} from "@/lib/doctor/types";
import { ALL_BRANCHES_ID, branchLabel } from "@/lib/doctor/branches";

const SPECIALTIES = [
  "all",
  "Ortopedia",
  "Rehabilitacja",
  "Ortopedia i traumatologia",
];

export function SlotsSearch() {
  const router = useRouter();
  const { branchFilter, staff, visitTypes, schedules, adminLoading } =
    useDoctorData();
  const { patients } = useDoctorPatients();
  const { addVisit, allVisits } = useDoctorVisits();

  const [doctorId, setDoctorId] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [dateFrom, setDateFrom] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = useState(
    format(addDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [durationMin, setDurationMin] = useState("0");
  const [timeFrom, setTimeFrom] = useState("08:00");
  const [timeTo, setTimeTo] = useState("16:00");
  const [visitTypeId, setVisitTypeId] = useState("all");
  const [mode, setMode] = useState("all");
  const [patientId, setPatientId] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const doctors = useMemo(
    () => staff.filter((s) => s.role === "doctor" && s.active),
    [staff]
  );

  const slots = useMemo(() => {
    if (adminLoading) return [];
    return generateFreeSlots({
      staff,
      visitTypes,
      schedules,
      occupiedVisits: allVisits,
      days: 40,
      branchFilter,
      doctorId,
      specialty,
      dateFrom,
      dateTo,
      timeFrom,
      timeTo,
      durationMin: Number(durationMin) || 0,
      visitTypeId,
      mode,
    });
  }, [
    adminLoading,
    staff,
    visitTypes,
    schedules,
    allVisits,
    branchFilter,
    doctorId,
    specialty,
    dateFrom,
    dateTo,
    timeFrom,
    timeTo,
    durationMin,
    visitTypeId,
    mode,
  ]);

  const groups = useMemo(() => groupSlotsByDoctor(slots), [slots]);

  function mapVisitType(vtId: string): VisitType {
    if (vtId.includes("kontrol")) return "kontrolna";
    if (vtId.includes("zabieg")) return "zabieg";
    if (vtId.includes("rehab")) return "rehabilitacja";
    if (vtId.includes("pilna")) return "pilna";
    return "konsultacja";
  }

  function bookSlot(slot: FreeSlot) {
    if (!patientId) {
      toast.error("Wybierz pacjenta do rezerwacji (powyżej filtrów).");
      return;
    }
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      toast.error("Nie znaleziono pacjenta (sprawdź filtr oddziału).");
      return;
    }
    const now = new Date().toISOString();
    const clinical = emptyVisitClinical();
    const visit: DoctorVisit = {
      ...clinical,
      id: `v-${crypto.randomUUID().slice(0, 8)}`,
      date: slot.date,
      time: slot.time,
      patientId: patient.id,
      patientFirstName: patient.firstName,
      patientLastName: patient.lastName,
      patientPesel: patient.pesel,
      patientGroups: [...patient.groups],
      doctorId: slot.doctorId,
      doctorName: slot.doctorName,
      status: "scheduled",
      type: mapVisitType(slot.visitTypeId),
      note: `Rezerwacja: ${slot.visitTypeName}`,
      medicalNote: "",
      needsTeleconfirm: true,
      departmentId: "ortopedia",
      branchId: slot.branchId,
      createdAt: now,
      updatedAt: now,
    };
    try {
      addVisit(visit);
      toast.success("Termin zarezerwowany", {
        description: `${slot.date} ${slot.time} · ${slot.doctorName}`,
      });
      router.push(`/doctor/wizyty/${visit.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nie można zarezerwować");
    }
  }

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        Ładowanie terminów…
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-5">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-brand-heading md:text-xl">
          Wyszukiwarka terminów
        </h1>
        <p className="text-sm text-muted-foreground">
          Oddział: <strong>{branchLabel(branchFilter)}</strong> · {slots.length}{" "}
          wolnych slotów · 40 dni naprzód
        </p>
      </div>

      <Card className="mb-4 border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-brand-heading">Filtry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Pacjent (do rezerwacji)</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Wybierz pacjenta" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.lastName} {p.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pracownik (lekarz)</Label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszyscy</SelectItem>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.doctorId ?? d.id}>
                      {d.title} {d.firstName} {d.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Specjalizacja</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "all" ? "Wszystkie" : s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Typ wizyty</Label>
              <Select value={visitTypeId} onValueChange={setVisitTypeId}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {visitTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.durationMin} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data od</Label>
              <Input
                type="date"
                className="h-9"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data do</Label>
              <Input
                type="date"
                className="h-9"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Godzina od</Label>
              <Input
                type="time"
                className="h-9"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Godzina do</Label>
              <Input
                type="time"
                className="h-9"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Min. czas trwania (min)</Label>
              <Select value={durationMin} onValueChange={setDurationMin}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Dowolny</SelectItem>
                  <SelectItem value="15">15+</SelectItem>
                  <SelectItem value="20">20+</SelectItem>
                  <SelectItem value="30">30+</SelectItem>
                  <SelectItem value="45">45+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tryb przyjęcia</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="stacjonarna">Stacjonarna</SelectItem>
                  <SelectItem value="teleporada">Teleporada</SelectItem>
                  <SelectItem value="domowa">Domowa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {branchFilter === ALL_BRANCHES_ID ? (
            <p className="text-xs text-muted-foreground">
              Widok wszystkich oddziałów — możesz zawęzić przełącznikiem w
              topbarze.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          {groups.length === 0 ? (
            <EmptyState
              title="Brak wolnych terminów"
              description="Zmień filtry lub oddział."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="w-8" />
                    <TableHead className="font-semibold">Lekarz</TableHead>
                    <TableHead className="hidden font-semibold md:table-cell">
                      Specjalizacja
                    </TableHead>
                    <TableHead className="font-semibold">Rodzaj</TableHead>
                    <TableHead className="hidden font-semibold sm:table-cell">
                      Tryb
                    </TableHead>
                    <TableHead className="font-semibold">Oddział</TableHead>
                    <TableHead className="font-semibold">Sloty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => {
                    const open = expanded[g.key];
                    return (
                      <Fragment key={g.key}>
                        <TableRow
                          className="cursor-pointer"
                          onClick={() =>
                            setExpanded((e) => ({
                              ...e,
                              [g.key]: !e[g.key],
                            }))
                          }
                        >
                          <TableCell>
                            {open ? (
                              <ChevronDown className="size-4 text-brand" />
                            ) : (
                              <ChevronRight className="size-4 text-slate-400" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {g.doctorName}
                          </TableCell>
                          <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                            {g.specialty}
                          </TableCell>
                          <TableCell className="text-sm">
                            {g.visitTypeName}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="text-[10px]">
                              {g.mode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {g.branchName}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-secondary text-brand-deep">
                              {g.slots.length}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {open
                          ? g.slots.slice(0, 24).map((s) => (
                              <TableRow
                                key={s.id}
                                className="bg-slate-50/50"
                              >
                                <TableCell />
                                <TableCell
                                  colSpan={5}
                                  className="text-sm text-slate-700"
                                >
                                  <span className="font-medium">
                                    {format(parseISO(s.date), "EEE d MMM", {
                                      locale: pl,
                                    })}
                                  </span>
                                  <span className="mx-2 font-mono font-semibold text-brand">
                                    {s.time}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {s.durationMin} min
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    className="h-8 bg-brand text-white hover:bg-brand-deep"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      bookSlot(s);
                                    }}
                                  >
                                    Zarezerwuj
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          : null}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

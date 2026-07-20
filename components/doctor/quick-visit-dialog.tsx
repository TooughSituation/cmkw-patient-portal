"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDoctorPatients } from "@/hooks/use-doctor-patients";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import { doctors, formatDoctorName } from "@/lib/booking/doctors";
import type { DoctorVisit, VisitType } from "@/lib/doctor/types";
import { VISIT_TYPE_LABELS } from "@/lib/doctor/types";

export function QuickVisitDialog({
  trigger,
  defaultDate,
}: {
  trigger: React.ReactNode;
  defaultDate?: string;
}) {
  const { patients, loading: patientsLoading } = useDoctorPatients();
  const { addVisit } = useDoctorVisits();
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "kiryluk");
  const [date, setDate] = useState(
    defaultDate ?? new Date().toISOString().slice(0, 10)
  );
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<VisitType>("konsultacja");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...patients].sort((a, b) =>
      a.lastName.localeCompare(b.lastName, "pl")
    );
    if (!q) return list.slice(0, 50);
    return list
      .filter(
        (p) =>
          p.lastName.toLowerCase().includes(q) ||
          p.firstName.toLowerCase().includes(q) ||
          p.pesel.includes(q) ||
          p.cardNumber.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [patients, search]);

  function resetForm() {
    setPatientId("");
    setSearch("");
    setNote("");
    setTime("10:00");
    setType("konsultacja");
    setDate(defaultDate ?? new Date().toISOString().slice(0, 10));
  }

  function handleSave() {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      toast.error("Wybierz pacjenta z listy.");
      return;
    }
    if (!date || !time) {
      toast.error("Podaj datę i godzinę.");
      return;
    }
    const doctor = doctors.find((d) => d.id === doctorId);
    const now = new Date().toISOString();
    const visit: DoctorVisit = {
      id: `v-${crypto.randomUUID().slice(0, 8)}`,
      date,
      time,
      patientId: patient.id,
      patientFirstName: patient.firstName,
      patientLastName: patient.lastName,
      patientPesel: patient.pesel,
      patientGroups: [...patient.groups],
      doctorId,
      doctorName: doctor ? formatDoctorName(doctor) : doctorId,
      status: "scheduled",
      type,
      note: note.trim(),
      departmentId: "ortopedia",
      createdAt: now,
      updatedAt: now,
    };
    addVisit(visit);
    toast.success("Wizyta dodana.", {
      description: `${patient.lastName} ${patient.firstName} · ${date} ${time}`,
    });
    setOpen(false);
    resetForm();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && defaultDate) setDate(defaultDate);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-brand-heading">Szybka wizyta</DialogTitle>
          <DialogDescription>
            Wybierz istniejącego pacjenta lub dodaj nowego w kartotece.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Szukaj pacjenta</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nazwisko, imię, PESEL, nr karty…"
              className="h-9"
              disabled={patientsLoading}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Pacjent *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Wybierz pacjenta" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {filteredPatients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.lastName} {p.firstName} · {p.cardNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              asChild
              variant="link"
              className="h-auto px-0 text-brand"
              size="sm"
            >
              <Link href="/doctor/pacjenci/nowy" onClick={() => setOpen(false)}>
                <UserPlus className="size-3.5" />
                Szybkie dodanie nowego pacjenta
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Data *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Godzina *</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Lekarz</Label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {formatDoctorName(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Typ</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as VisitType)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(VISIT_TYPE_LABELS) as VisitType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {VISIT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Notatka</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-9"
              placeholder="Opcjonalnie"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button
            className="gap-1.5 bg-brand text-white hover:bg-brand-deep"
            onClick={handleSave}
          >
            <Plus className="size-4" />
            Zapisz wizytę
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

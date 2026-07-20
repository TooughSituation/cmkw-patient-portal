"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  DoorOpen,
  Loader2,
  Plus,
  Settings2,
  Stethoscope,
  Users,
  BarChart3,
  Save,
  CalendarClock,
  Share2,
} from "lucide-react";
import { SchedulesManager } from "@/components/doctor/schedules-manager";
import { CalendarSharingPanel } from "@/components/doctor/calendar-sharing-panel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { CLINIC_BRANCHES } from "@/lib/doctor/branches";
import type {
  AppSettings,
  FacilityData,
  Room,
  StaffMember,
} from "@/lib/doctor/admin-types";
import { cn } from "@/lib/utils";

type AdminSection =
  | "stats"
  | "facility"
  | "settings"
  | "staff"
  | "schedules"
  | "sharing"
  | "rooms"
  | "visitTypes";

const MENU: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: "stats", label: "Statystyki placówki", icon: <BarChart3 className="size-4" /> },
  { id: "facility", label: "Dane placówki", icon: <Building2 className="size-4" /> },
  { id: "settings", label: "Ustawienia", icon: <Settings2 className="size-4" /> },
  { id: "staff", label: "Pracownicy / Lekarze", icon: <Users className="size-4" /> },
  { id: "schedules", label: "Grafiki pracy", icon: <CalendarClock className="size-4" /> },
  {
    id: "sharing",
    label: "Udostępnianie kalendarzy",
    icon: <Share2 className="size-4" />,
  },
  { id: "rooms", label: "Gabinety", icon: <DoorOpen className="size-4" /> },
  { id: "visitTypes", label: "Typy wizyt", icon: <Stethoscope className="size-4" /> },
];

const SETTING_LABELS: Record<keyof AppSettings, string> = {
  blockDoubleBooking: "Blokada podwójnych rezerwacji w tym samym slocie",
  requireTeleconfirm: "Wymagaj telepotwierdzenia nowych wizyt",
  showPeselMaskedOnly: "PESEL tylko maskowany poza edycją",
  autoEndDayReminder: "Przypomnienie o zakończeniu dnia",
  allowReceptionEditNotes: "Recepcja może edytować notatki lekarskie",
  smsRemindersEnabled: "Przypomnienia SMS (mock)",
  onlineBookingSync: "Synchronizacja z bookingiem online",
  strictRoomAssignment: "Wymagaj przypisania gabinetu",
  showPricesInCalendar: "Pokaż ceny w kalendarzu",
  requireIcdOnComplete: "Wymagaj ICD przy zakończeniu wizyty",
  auditLogEnabled: "Dziennik audytu (placeholder)",
  weekendSlotsEnabled: "Terminy w weekendy",
};

export function AdminPanel() {
  const {
    adminLoading,
    facility,
    settings,
    staff,
    rooms,
    visitTypes,
    patients,
    visits,
    saveFacilityData,
    saveSettingsData,
    saveStaffData,
    saveRoomsData,
    saveVisitTypesData,
  } = useDoctorData();

  const [section, setSection] = useState<AdminSection>("stats");
  const [facilityForm, setFacilityForm] = useState<FacilityData | null>(null);
  const [settingsForm, setSettingsForm] = useState<AppSettings | null>(null);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);

  useEffect(() => {
    if (facility && !facilityForm) setFacilityForm(facility);
    if (settings && !settingsForm) setSettingsForm(settings);
  }, [facility, settings, facilityForm, settingsForm]);

  const stats = useMemo(() => {
    const doctors = staff.filter((s) => s.role === "doctor" && s.active);
    const reception = staff.filter((s) => s.role === "reception" && s.active);
    return {
      patients: patients.length,
      completed: visits.filter((v) => v.status === "completed").length,
      cancelled: visits.filter((v) => v.status === "cancelled").length,
      scheduled: visits.filter(
        (v) =>
          v.status === "scheduled" ||
          v.status === "confirmed" ||
          v.status === "teleconfirmed"
      ).length,
      doctors: doctors.length,
      rooms: rooms.filter((r) => r.active).length,
      reception: reception.length,
    };
  }, [patients, visits, staff, rooms]);

  if (adminLoading || !facility || !settings) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        Ładowanie administracji…
      </div>
    );
  }

  const f = facilityForm ?? facility;
  const s = settingsForm ?? settings;

  return (
    <div
      className="flex min-h-[calc(100vh-7rem)] flex-col md:flex-row"
      data-tour="admin-panel"
    >
      <aside className="w-full shrink-0 border-b border-slate-200 bg-white md:w-60 md:border-r md:border-b-0">
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Administracja
          </p>
          <h1 className="mt-1 text-base font-semibold text-brand-heading">
            CMKW EDM
          </h1>
        </div>
        <nav className="space-y-0.5 px-2 pb-4">
          {MENU.map((m) => (
            <button
              key={m.id}
              type="button"
              data-tour={
                m.id === "sharing"
                  ? "admin-sharing"
                  : m.id === "stats"
                    ? "admin-stats"
                    : undefined
              }
              onClick={() => setSection(m.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition",
                section === m.id
                  ? "bg-brand text-white"
                  : "text-slate-700 hover:bg-secondary"
              )}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
          <Link
            href="/doctor"
            className="mt-2 block px-3 py-2 text-xs text-muted-foreground hover:text-brand"
          >
            ← Wróć do kalendarza
          </Link>
        </nav>
      </aside>

      <div className="min-w-0 flex-1 p-4 md:p-6">
        {section === "stats" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-brand-heading">
              Statystyki placówki
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <StatCard label="Pacjenci" value={stats.patients} />
              <StatCard label="Wizyty zakończone" value={stats.completed} />
              <StatCard label="Wizyty anulowane" value={stats.cancelled} />
              <StatCard label="Wizyty planowane" value={stats.scheduled} />
              <StatCard label="Lekarze" value={stats.doctors} />
              <StatCard label="Gabinety" value={stats.rooms} />
              <StatCard label="Recepcjoniści" value={stats.reception} />
              <StatCard label="Oddziały" value={CLINIC_BRANCHES.length} />
            </div>
          </div>
        )}

        {section === "facility" && (
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-heading">
                Dane placówki
              </h2>
              <Button
                className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep"
                onClick={() => {
                  saveFacilityData(f);
                  toast.success("Zapisano dane placówki");
                }}
              >
                <Save className="size-4" />
                Zapisz
              </Button>
            </div>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
                {(
                  [
                    ["name", "Nazwa"],
                    ["shortName", "Nazwa skrócona"],
                    ["regon", "REGON"],
                    ["nip", "NIP"],
                    ["address", "Adres"],
                    ["city", "Miasto"],
                    ["postalCode", "Kod pocztowy"],
                    ["phone", "Telefon"],
                    ["email", "E-mail"],
                    ["website", "WWW"],
                    ["workingHours", "Godziny pracy"],
                    ["nfzCode", "Kod NFZ"],
                    ["teryt", "TERYT"],
                    ["bankAccount", "Nr konta"],
                    ["logoUrl", "Logo (URL)"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      className="h-9"
                      value={f[key]}
                      onChange={(e) =>
                        setFacilityForm({ ...f, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Treść zgody RODO</Label>
                  <Textarea
                    rows={4}
                    value={f.rodConsentText}
                    onChange={(e) =>
                      setFacilityForm({ ...f, rodConsentText: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {section === "settings" && (
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-heading">
                Ustawienia aplikacji
              </h2>
              <Button
                className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep"
                onClick={() => {
                  saveSettingsData(s);
                  toast.success("Zapisano ustawienia");
                }}
              >
                <Save className="size-4" />
                Zapisz
              </Button>
            </div>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-brand-heading">
                  Ustawienia blokad specjalnych i aplikacji
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {(Object.keys(SETTING_LABELS) as (keyof AppSettings)[]).map(
                  (key) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <Label className="text-sm font-normal leading-snug">
                        {SETTING_LABELS[key]}
                      </Label>
                      <Switch
                        checked={s[key]}
                        onCheckedChange={(v) =>
                          setSettingsForm({ ...s, [key]: v })
                        }
                      />
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {section === "staff" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-brand-heading">
              Pracownicy / Lekarze
            </h2>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead>Imię i nazwisko</TableHead>
                      <TableHead>Rola</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Specjalizacja
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">PWZ</TableHead>
                      <TableHead>Oddziały</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="font-medium">
                            {m.title} {m.firstName} {m.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {m.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{m.role}</Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm md:table-cell">
                          {m.specialty}
                        </TableCell>
                        <TableCell className="hidden font-mono text-sm lg:table-cell">
                          {m.pwz || "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {m.branchIds
                            .map(
                              (id) =>
                                CLINIC_BRANCHES.find((b) => b.id === id)
                                  ?.shortName ?? id
                            )
                            .join(", ")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() =>
                              setEditStaffId(
                                editStaffId === m.id ? null : m.id
                              )
                            }
                          >
                            {editStaffId === m.id ? "Zamknij" : "Edytuj"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {editStaffId ? (
              <StaffEditForm
                member={staff.find((x) => x.id === editStaffId)!}
                onSave={(updated) => {
                  saveStaffData(
                    staff.map((x) => (x.id === updated.id ? updated : x))
                  );
                  toast.success("Zapisano pracownika");
                  setEditStaffId(null);
                }}
              />
            ) : null}
          </div>
        )}

        {section === "schedules" && <SchedulesManager />}

        {section === "sharing" && <CalendarSharingPanel />}

        {section === "rooms" && (
          <RoomsSection
            rooms={rooms}
            onSave={(next) => {
              saveRoomsData(next);
              toast.success("Zapisano gabinety");
            }}
          />
        )}

        {section === "visitTypes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-brand-heading">
              Typy wizyt
            </h2>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead>Nazwa</TableHead>
                      <TableHead>Czas</TableHead>
                      <TableHead>Tryb</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitTypes.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>{t.durationMin} min</TableCell>
                        <TableCell>{t.mode}</TableCell>
                        <TableCell>
                          <Switch
                            checked={t.active}
                            onCheckedChange={(v) => {
                              saveVisitTypesData(
                                visitTypes.map((x) =>
                                  x.id === t.id ? { ...x, active: v } : x
                                )
                              );
                              toast.success("Zaktualizowano typ wizyty");
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-3xl font-bold text-brand-heading">{value}</p>
      </CardContent>
    </Card>
  );
}

function StaffEditForm({
  member,
  onSave,
}: {
  member: StaffMember;
  onSave: (m: StaffMember) => void;
}) {
  const [form, setForm] = useState(member);
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-brand-heading">
          Edycja: {member.firstName} {member.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["firstName", "Imię"],
            ["lastName", "Nazwisko"],
            ["title", "Tytuł"],
            ["specialty", "Specjalizacja"],
            ["pwz", "PWZ"],
            ["email", "E-mail"],
            ["phone", "Telefon"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <Input
              className="h-9"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Oddziały</Label>
          <div className="flex flex-wrap gap-3">
            {CLINIC_BRANCHES.map((b) => {
              const on = form.branchIds.includes(b.id);
              return (
                <label
                  key={b.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      setForm({
                        ...form,
                        branchIds: on
                          ? form.branchIds.filter((x) => x !== b.id)
                          : [...form.branchIds, b.id],
                      })
                    }
                  />
                  {b.shortName}
                </label>
              );
            })}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Button
            className="h-9 bg-brand text-white hover:bg-brand-deep"
            onClick={() => onSave(form)}
          >
            Zapisz pracownika
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RoomsSection({
  rooms,
  onSave,
}: {
  rooms: Room[];
  onSave: (r: Room[]) => void;
}) {
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("bialystok");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-brand-heading">Gabinety</h2>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Nazwa gabinetu</Label>
            <Input
              className="h-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Gabinet 5"
            />
          </div>
          <div className="space-y-1 sm:w-48">
            <Label className="text-xs">Oddział</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLINIC_BRANCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep"
            onClick={() => {
              if (!name.trim()) {
                toast.error("Podaj nazwę");
                return;
              }
              onSave([
                ...rooms,
                {
                  id: `room-${crypto.randomUUID().slice(0, 6)}`,
                  name: name.trim(),
                  branchId,
                  floor: "parter",
                  notes: "",
                  active: true,
                },
              ]);
              setName("");
            }}
          >
            <Plus className="size-4" />
            Dodaj
          </Button>
        </CardContent>
      </Card>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>Nazwa</TableHead>
                <TableHead>Oddział</TableHead>
                <TableHead>Piętro</TableHead>
                <TableHead>Aktywny</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    {CLINIC_BRANCHES.find((b) => b.id === r.branchId)
                      ?.shortName ?? r.branchId}
                  </TableCell>
                  <TableCell>{r.floor}</TableCell>
                  <TableCell>
                    <Switch
                      checked={r.active}
                      onCheckedChange={(v) =>
                        onSave(
                          rooms.map((x) =>
                            x.id === r.id ? { ...x, active: v } : x
                          )
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  parseISO,
  startOfDay,
  addDays,
  isBefore,
  isSameDay,
} from "date-fns";
import { pl } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  List,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { doctors, formatDoctorName } from "@/lib/booking/doctors";
import { services, formatPricePln } from "@/lib/booking/services";
import {
  BOOKING_HORIZON_DAYS,
  doctorAvailabilityLabel,
  getSlotsForDay,
  isSlotInPast,
} from "@/lib/booking/slots";
import { saveBookingDraft } from "@/lib/booking/draft";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Patient = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type Props = {
  patient: Patient;
};

const STEPS = [
  "Lekarz",
  "Usługa",
  "Termin",
  "Potwierdzenie",
] as const;

export function BookingWizard({ patient }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [calendarView, setCalendarView] = useState<"month" | "list">("month");

  const doctor = doctors.find((d) => d.id === doctorId) ?? null;
  const service = services.find((s) => s.id === serviceId) ?? null;

  const today = startOfDay(new Date());
  const maxDate = addDays(today, BOOKING_HORIZON_DAYS - 1);

  const dateIso = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null;

  const slots = useMemo(() => {
    if (!doctorId || !dateIso) return [];
    return getSlotsForDay(doctorId, dateIso).map((s) => ({
      ...s,
      available:
        s.available && !isSlotInPast(dateIso, s.time),
    }));
  }, [doctorId, dateIso]);

  const availableSlots = slots.filter((s) => s.available);

  /** Lista najbliższych dni z wolnymi slotami (widok listy). */
  const upcomingDays = useMemo(() => {
    if (!doctorId) return [];
    const days: { date: Date; iso: string; freeCount: number }[] = [];
    for (let i = 0; i < BOOKING_HORIZON_DAYS; i++) {
      const d = addDays(today, i);
      const iso = format(d, "yyyy-MM-dd");
      const free = getSlotsForDay(doctorId, iso).filter(
        (s) => s.available && !isSlotInPast(iso, s.time)
      ).length;
      if (free > 0) days.push({ date: d, iso, freeCount: free });
    }
    return days.slice(0, 14);
  }, [doctorId, today]);

  function dayHasAvailability(date: Date): boolean {
    if (!doctorId) return false;
    if (isBefore(date, today)) return false;
    const iso = format(date, "yyyy-MM-dd");
    return getSlotsForDay(doctorId, iso).some(
      (s) => s.available && !isSlotInPast(iso, s.time)
    );
  }

  function goNext() {
    if (step === 0 && !doctorId) {
      toast.error("Wybierz lekarza.");
      return;
    }
    if (step === 1 && !serviceId) {
      toast.error("Wybierz usługę.");
      return;
    }
    if (step === 2 && (!dateIso || !selectedTime)) {
      toast.error("Wybierz datę i godzinę.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function handlePay() {
    if (!doctor || !service || !dateIso || !selectedTime) return;

    saveBookingDraft({
      doctorId: doctor.id,
      doctorName: formatDoctorName(doctor),
      serviceId: service.id,
      serviceName: service.name,
      pricePln: service.pricePln,
      date: dateIso,
      time: selectedTime,
      note: note.trim(),
      patientFirstName: patient.firstName,
      patientLastName: patient.lastName,
      patientEmail: patient.email,
      patientPhone: patient.phone,
    });

    router.push("/portal/umow-wizyte/platnosc");
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li key={label}>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                i === step
                  ? "bg-brand text-white"
                  : i < step
                    ? "bg-secondary text-brand-deep"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
                {i + 1}
              </span>
              {label}
            </span>
          </li>
        ))}
      </ol>

      {/* Step 0: Doctor */}
      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {doctors.map((d) => {
            const selected = doctorId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDoctorId(d.id);
                  setSelectedDate(undefined);
                  setSelectedTime(null);
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all hover:shadow-md",
                  selected
                    ? "border-brand bg-secondary/60 ring-2 ring-brand/30"
                    : "border-gray-100 bg-white"
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-brand">
                    <UserRound className="size-5" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px]",
                      d.availabilityFactor < 0.3 &&
                        "bg-amber-50 text-amber-800"
                    )}
                  >
                    {doctorAvailabilityLabel(d.id)}
                  </Badge>
                </div>
                <p className="font-semibold text-brand-heading">
                  {formatDoctorName(d)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {d.specialty}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                  {d.bio}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 1: Service */}
      {step === 1 && (
        <div className="grid gap-3">
          {services.map((s) => {
            const selected = serviceId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={cn(
                  "flex flex-col gap-1 rounded-xl border p-4 text-left transition-all sm:flex-row sm:items-center sm:justify-between",
                  selected
                    ? "border-brand bg-secondary/60 ring-2 ring-brand/30"
                    : "border-gray-100 bg-white hover:shadow-sm"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-brand">
                    <Stethoscope className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-heading">{s.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ok. {s.durationMin} min
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-lg font-bold text-brand sm:mt-0 sm:pl-4">
                  {formatPricePln(s.pricePln)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: Calendar + time */}
      {step === 2 && doctor && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-brand-heading">
                Wybierz dzień
              </CardTitle>
              <CardDescription>
                {formatDoctorName(doctor)} · najbliższe {BOOKING_HORIZON_DAYS}{" "}
                dni (Pn–So)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={calendarView}
                onValueChange={(v) =>
                  setCalendarView(v as "month" | "list")
                }
              >
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="month" className="gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Miesiąc
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-1.5">
                    <List className="size-3.5" />
                    Lista slotów
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="month">
                  <Calendar
                    mode="single"
                    locale={pl}
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setSelectedTime(null);
                    }}
                    disabled={(date) =>
                      isBefore(date, today) ||
                      isBefore(maxDate, date) ||
                      !dayHasAvailability(date)
                    }
                    modifiers={{
                      hasSlots: (date) => dayHasAvailability(date),
                    }}
                    modifiersClassNames={{
                      hasSlots: "font-semibold text-brand",
                    }}
                    className="mx-auto rounded-lg border"
                  />
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Dni bez dostępnych godzin są nieaktywne.
                  </p>
                </TabsContent>

                <TabsContent value="list" className="space-y-2">
                  {upcomingDays.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Brak wolnych terminów w najbliższym okresie.
                    </p>
                  ) : (
                    upcomingDays.map((day) => (
                      <button
                        key={day.iso}
                        type="button"
                        onClick={() => {
                          setSelectedDate(day.date);
                          setSelectedTime(null);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          selectedDate && isSameDay(selectedDate, day.date)
                            ? "border-brand bg-secondary"
                            : "border-gray-100 hover:bg-muted/50"
                        )}
                      >
                        <span className="font-medium text-brand-heading">
                          {format(day.date, "EEEE, d MMMM", { locale: pl })}
                        </span>
                        <Badge variant="secondary">
                          {day.freeCount} wolnych
                        </Badge>
                      </button>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-brand-heading">
                <Clock className="size-4" />
                Godzina
              </CardTitle>
              <CardDescription>
                {selectedDate
                  ? format(selectedDate, "d MMMM yyyy", { locale: pl })
                  : "Najpierw wybierz dzień"}
                {" · "}
                8:00–18:00 co 30 min
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-sm text-muted-foreground">
                  Wybierz datę w kalendarzu lub na liście.
                </p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Brak wolnych godzin w tym dniu. Wybierz inny termin.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={cn(
                        "rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                        !slot.available &&
                          "cursor-not-allowed border-transparent bg-muted/40 text-muted-foreground/50 line-through",
                        slot.available &&
                          selectedTime !== slot.time &&
                          "border-gray-200 bg-white text-brand hover:border-brand",
                        slot.available &&
                          selectedTime === slot.time &&
                          "border-brand bg-brand text-white"
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && doctor && service && dateIso && selectedTime && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-brand-heading">
                Podsumowanie wizyty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Lekarz" value={formatDoctorName(doctor)} />
              <Row label="Usługa" value={service.name} />
              <Row
                label="Termin"
                value={`${format(parseISO(dateIso), "d MMMM yyyy", { locale: pl })} · ${selectedTime}`}
              />
              <Row label="Czas trwania" value={`ok. ${service.durationMin} min`} />
              <div className="border-t pt-3">
                <Row
                  label="Do zapłaty"
                  value={formatPricePln(service.pricePln)}
                  emphasize
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-brand-heading">
                Dane pacjenta
              </CardTitle>
              <CardDescription>
                Pobrane z konta (sesja). Możesz dodać notatkę do rejestracji.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row
                label="Imię i nazwisko"
                value={`${patient.firstName} ${patient.lastName}`}
              />
              <Row label="E-mail" value={patient.email} />
              <Row label="Telefon" value={patient.phone} />
              <div className="space-y-2 pt-2">
                <Label htmlFor="note">Notatka (opcjonalnie)</Label>
                <Textarea
                  id="note"
                  placeholder="Np. ból kolana prawego od 2 tygodni…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-24"
                  maxLength={1000}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Wstecz
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={goNext}
            className="gap-2 bg-brand text-white hover:bg-brand-deep"
          >
            Dalej
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handlePay}
            className="gap-2 bg-brand text-white hover:bg-brand-deep"
          >
            Umów i zapłać
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right font-medium text-foreground",
          emphasize && "text-lg font-bold text-brand"
        )}
      >
        {value}
      </span>
    </div>
  );
}

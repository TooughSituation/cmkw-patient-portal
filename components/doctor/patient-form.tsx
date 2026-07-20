"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  patientFormSchema,
  type PatientFormValues,
} from "@/lib/validations/patient";
import { parsePesel } from "@/lib/pesel";
import {
  PATIENT_GROUP_OPTIONS,
  PATIENT_SEX_LABELS,
  PATIENT_STATUS_LABELS,
  type DoctorPatient,
  type PatientGroup,
} from "@/lib/doctor/types";
import { useDoctorPatients } from "@/hooks/use-doctor-patients";
import { cn } from "@/lib/utils";

const defaultValues: PatientFormValues = {
  firstName: "",
  lastName: "",
  pesel: "",
  birthDate: "",
  sex: "K",
  phone: "",
  email: "",
  street: "",
  buildingNo: "",
  apartmentNo: "",
  postalCode: "",
  city: "",
  cardNumber: "",
  groups: [],
  notes: "",
  rodConsent: true,
  status: "active",
};

function toFormValues(p: DoctorPatient): PatientFormValues {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    pesel: p.pesel,
    birthDate: p.birthDate,
    sex: p.sex,
    phone: p.phone,
    email: p.email,
    street: p.street,
    buildingNo: p.buildingNo,
    apartmentNo: p.apartmentNo,
    postalCode: p.postalCode,
    city: p.city,
    cardNumber: p.cardNumber,
    groups: p.groups,
    notes: p.notes,
    rodConsent: p.rodConsent,
    status: p.status,
  };
}

export function PatientForm({
  mode,
  patientId,
  initial,
}: {
  mode: "create" | "edit";
  patientId?: string;
  initial?: DoctorPatient | null;
}) {
  const router = useRouter();
  const { create, update, patients } = useDoctorPatients();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: initial ? toFormValues(initial) : defaultValues,
  });

  useEffect(() => {
    if (initial) form.reset(toFormValues(initial));
  }, [initial, form]);

  const peselValue = form.watch("pesel");

  useEffect(() => {
    if (peselValue?.length === 11) {
      const parsed = parsePesel(peselValue);
      if (parsed) {
        form.setValue("birthDate", parsed.birthDate, { shouldValidate: true });
        form.setValue("sex", parsed.sex, { shouldValidate: true });
      }
    }
  }, [peselValue, form]);

  function onSubmit(values: PatientFormValues) {
    const pesel = values.pesel.replace(/\s/g, "");
    const duplicate = patients.find(
      (p) => p.pesel === pesel && p.id !== patientId
    );
    if (duplicate) {
      toast.error("Pacjent z tym numerem PESEL już istnieje.", {
        description: `${duplicate.lastName} ${duplicate.firstName} (${duplicate.cardNumber})`,
      });
      form.setError("pesel", { message: "PESEL już w bazie" });
      return;
    }

    if (mode === "create") {
      const record = create(values);
      toast.success("Pacjent dodany.", {
        description: `${record.firstName} ${record.lastName}`,
      });
      router.push(`/doctor/pacjenci/${record.id}`);
      return;
    }

    if (!patientId) return;
    const updated = update(patientId, values);
    if (!updated) {
      toast.error("Nie znaleziono pacjenta.");
      return;
    }
    toast.success("Zapisano zmiany.");
    router.push(`/doctor/pacjenci/${patientId}`);
  }

  const groups = form.watch("groups") as PatientGroup[];

  function toggleGroup(g: PatientGroup) {
    const next = groups.includes(g)
      ? groups.filter((x) => x !== g)
      : [...groups, g];
    form.setValue("groups", next, { shouldDirty: true });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-5"
        noValidate
      >
        <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base text-brand-heading">
              Dane osobowe
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwisko *</FormLabel>
                  <FormControl>
                    <Input className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imię *</FormLabel>
                  <FormControl>
                    <Input className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pesel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PESEL *</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 font-mono"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="11 cyfr"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.replace(/\D/g, "").slice(0, 11)
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Automatycznie uzupełnia datę ur. i płeć.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data urodzenia</FormLabel>
                  <FormControl>
                    <Input type="date" className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Płeć</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="K">{PATIENT_SEX_LABELS.K}</SelectItem>
                      <SelectItem value="M">{PATIENT_SEX_LABELS.M}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nr karty wewn.</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 font-mono"
                      placeholder="auto (CMKW-…)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base text-brand-heading">
              Kontakt i adres
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon *</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="500 600 700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="h-10"
                      placeholder="opcjonalnie"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Ulica</FormLabel>
                  <FormControl>
                    <Input className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buildingNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nr domu</FormLabel>
                  <FormControl>
                    <Input className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apartmentNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nr mieszkania</FormLabel>
                  <FormControl>
                    <Input className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kod pocztowy</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="15-000"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miasto</FormLabel>
                  <FormControl>
                    <Input className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base text-brand-heading">
              Grupy, status i notatki
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <p className="mb-2 text-sm font-medium">Grupy pacjenta</p>
              <div className="flex flex-wrap gap-2">
                {PATIENT_GROUP_OPTIONS.map((g) => {
                  const active = groups.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGroup(g)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        active
                          ? "border-brand bg-brand text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:bg-secondary"
                      )}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        Object.keys(PATIENT_STATUS_LABELS) as Array<
                          keyof typeof PATIENT_STATUS_LABELS
                        >
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {PATIENT_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notatki</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Uwagi medyczne, preferencje, alergie…"
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rodConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="font-medium leading-snug">
                      Zgoda RODO na przetwarzanie danych osobowych
                    </FormLabel>
                    <FormDescription>
                      Wymagana do prowadzenia dokumentacji medycznej w EDM.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2 pb-8">
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={() =>
              router.push(
                mode === "edit" && patientId
                  ? `/doctor/pacjenci/${patientId}`
                  : "/doctor/pacjenci"
              )
            }
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-10 min-w-[120px] gap-2 bg-brand text-white hover:bg-brand-deep"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Zapisz
          </Button>
        </div>
      </form>
    </Form>
  );
}

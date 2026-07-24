"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileText,
  History,
  Loader2,
  Phone,
  Pill,
  Printer,
  Save,
  Stethoscope,
  Trash2,
  XCircle,
  Play,
  ClipboardList,
  NotebookPen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VisitStatusBadge } from "@/components/doctor/visit-status-badge";
import { PatientGroups } from "@/components/doctor/patient-groups";
import { PatientNameLink } from "@/components/doctor/patient-name-link";
import { IcdPicker } from "@/components/doctor/icd-picker";
import { DrugPicker } from "@/components/doctor/drug-picker";
import { DocumentsPanel } from "@/components/doctor/documents-panel";
import { EmptyState } from "@/components/doctor/empty-state";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import { getDepartmentById } from "@/lib/doctor/departments";
import { getBranchById } from "@/lib/doctor/branches";
import {
  VISIT_TYPE_LABELS,
  maskPesel,
  type DoctorVisit,
  type VisitDiagnosis,
  type VisitPrescription,
  type VisitReferral,
  type VisitStatus,
} from "@/lib/doctor/types";
import { cn } from "@/lib/utils";

/** Sekcja karty wizyty — domyślnie otwarta, da się zwinąć (Lux Med–style single page) */
function VisitSection({
  id,
  title,
  icon,
  defaultOpen = true,
  badge,
  children,
  className,
}: {
  id: string;
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card
      id={id}
      className={cn("border-slate-200 bg-white shadow-sm ring-slate-200/80", className)}
      data-section={id}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left md:px-5"
        aria-expanded={open}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-brand">
          {icon}
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <CardTitle className="text-base font-semibold text-brand-heading">
            {title}
          </CardTitle>
          {badge}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <CardContent className="space-y-4 border-t border-slate-100 px-4 pb-4 pt-3 md:px-5">
          {children}
        </CardContent>
      ) : null}
    </Card>
  );
}

function VisitActionBar({
  saving,
  dirty,
  onSave,
  onInProgress,
  onComplete,
  onConfirm,
  onPrint,
  onCancel,
  sticky,
}: {
  saving: boolean;
  dirty: boolean;
  onSave: () => void;
  onInProgress: () => void;
  onComplete: () => void;
  onConfirm: () => void;
  onPrint: () => void;
  onCancel: () => void;
  sticky?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm",
        sticky &&
          "sticky bottom-0 z-20 border-brand/15 bg-white/95 shadow-md backdrop-blur supports-backdrop-filter:bg-white/90"
      )}
    >
      <Button
        className="h-10 gap-1.5 bg-brand px-4 text-white hover:bg-brand-deep"
        disabled={saving}
        onClick={onSave}
      >
        <Save className="size-4" />
        Zapisz
        {dirty ? (
          <span className="ml-0.5 size-1.5 rounded-full bg-amber-300" aria-hidden />
        ) : null}
      </Button>
      <Button
        variant="outline"
        className="h-10 gap-1.5"
        onClick={onInProgress}
      >
        <Play className="size-4" />
        W trakcie
      </Button>
      <Button
        variant="outline"
        className="h-10 gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
        onClick={onComplete}
      >
        <CheckCircle2 className="size-4" />
        Zakończ wizytę
      </Button>
      <Button variant="outline" className="h-10 gap-1.5" onClick={onConfirm}>
        Potwierdź
      </Button>
      <Button variant="outline" className="h-10 gap-1.5" onClick={onPrint}>
        <Printer className="size-4" />
        Drukuj
      </Button>
      <Button
        variant="outline"
        className="h-10 gap-1.5 text-destructive hover:bg-red-50"
        onClick={onCancel}
      >
        <XCircle className="size-4" />
        Anuluj
      </Button>
    </div>
  );
}

export function VisitCard({ visitId }: { visitId: string }) {
  const router = useRouter();
  const { getById, updateVisit, updateStatus, visits, loading } =
    useDoctorVisits();
  const visit = getById(visitId);

  const [medicalNote, setMedicalNote] = useState("");
  const [note, setNote] = useState("");
  const [diagnoses, setDiagnoses] = useState<VisitDiagnosis[]>([]);
  const [prescriptions, setPrescriptions] = useState<VisitPrescription[]>([]);
  const [referrals, setReferrals] = useState<VisitReferral[]>([]);
  const [refTitle, setRefTitle] = useState("");
  const [refType, setRefType] = useState("Obrazowanie");
  const [refNotes, setRefNotes] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visit) return;
    setMedicalNote(visit.medicalNote ?? "");
    setNote(visit.note ?? "");
    setDiagnoses(visit.diagnoses ?? []);
    setPrescriptions(visit.prescriptions ?? []);
    setReferrals(visit.referrals ?? []);
    setDirty(false);
  }, [visit]);

  // Autosave (debounce 1.2s)
  useEffect(() => {
    if (!visit || !dirty) return;
    const t = setTimeout(() => {
      updateVisit(visit.id, {
        medicalNote,
        note,
        diagnoses,
        prescriptions,
        referrals,
      });
      setDirty(false);
      toast.message("Autosave", { description: "Notatka zapisana" });
    }, 1200);
    return () => clearTimeout(t);
  }, [
    medicalNote,
    note,
    diagnoses,
    prescriptions,
    referrals,
    dirty,
    visit,
    updateVisit,
  ]);

  const history = useMemo(() => {
    if (!visit) return [];
    return visits
      .filter((v) => v.patientId === visit.patientId && v.id !== visit.id)
      .sort((a, b) =>
        `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)
      )
      .slice(0, 8);
  }, [visits, visit]);

  const markDirty = useCallback(() => setDirty(true), []);

  function saveNow(extra?: Partial<DoctorVisit>) {
    if (!visit) return null;
    setSaving(true);
    const updated = updateVisit(visit.id, {
      medicalNote,
      note,
      diagnoses,
      prescriptions,
      referrals,
      ...extra,
    });
    setDirty(false);
    setSaving(false);
    return updated;
  }

  function setStatus(status: VisitStatus, msg: string) {
    if (!visit) return;
    updateStatus(visit.id, status);
    updateVisit(visit.id, {
      medicalNote,
      note,
      diagnoses,
      prescriptions,
      referrals,
      status,
      needsTeleconfirm:
        status === "teleconfirmed" || status === "cancelled"
          ? false
          : visit.needsTeleconfirm,
    });
    setDirty(false);
    toast.success(msg);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Ładowanie karty wizyty…</span>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="p-6">
        <EmptyState
          title="Brak dostępu do wizyty"
          description="Wizyta nie istnieje albo należy do innego lekarza poza Twoim zakresem widoczności."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/doctor/wizyty">Wróć do listy</Link>
          </Button>
        </div>
      </div>
    );
  }

  const dept = getDepartmentById(visit.departmentId);
  const branch = getBranchById(visit.branchId);

  const actions = {
    saving,
    dirty,
    onSave: () => {
      saveNow();
      toast.success("Wizyta zapisana");
    },
    onInProgress: () => setStatus("in_progress", "Wizyta w trakcie"),
    onComplete: () => setStatus("completed", "Wizyta zakończona"),
    onConfirm: () => setStatus("confirmed", "Wizyta potwierdzona"),
    onPrint: () => {
      toast.success("Drukowanie (podgląd przeglądarki)");
      window.print();
    },
    onCancel: () => setStatus("cancelled", "Wizyta odwołana"),
  };

  return (
    <div
      className="mx-auto max-w-[1400px] space-y-3 p-3 pb-8 md:p-4 lg:p-5"
      data-tour="doctor-visit-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 gap-1 px-2">
          <Link href="/doctor/wizyty">
            <ArrowLeft className="size-3.5" />
            Lista wizyt
          </Link>
        </Button>
        {dirty ? (
          <p className="text-xs font-medium text-amber-700">
            Niezapisane zmiany — autosave za chwilę…
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Jedna karta wizyty · CMKW EDM
          </p>
        )}
      </div>

      {/* Nagłówek pacjenta + akcje (góra) */}
      <Card className="border-slate-200 bg-white shadow-sm ring-1 ring-brand/10">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-brand-heading">
                {format(parseISO(visit.date), "d MMMM yyyy", { locale: pl })}
                <span className="ml-2 font-mono text-lg text-slate-700">
                  {visit.time}
                </span>
              </h1>
              <VisitStatusBadge status={visit.status} />
              {visit.needsTeleconfirm &&
              (visit.status === "scheduled" ||
                visit.status === "confirmed") ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800">
                  <Phone className="size-3" />
                  Do potwierdzenia
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {VISIT_TYPE_LABELS[visit.type]} · {visit.doctorName}
              {branch ? ` · ${branch.shortName}` : ""}
              {dept ? ` · ${dept.shortName}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <PatientNameLink
                patientId={visit.patientId}
                firstName={visit.patientFirstName}
                lastName={visit.patientLastName}
                className="text-base"
              />
              <span className="font-mono text-sm text-slate-500">
                PESEL {maskPesel(visit.patientPesel)}
              </span>
              <PatientGroups groups={visit.patientGroups} />
            </div>
          </div>
        </CardContent>
      </Card>

      <VisitActionBar {...actions} />

      {/* Szybki skok do sekcji */}
      <nav
        className="flex flex-wrap gap-1.5"
        aria-label="Sekcje karty wizyty"
      >
        {[
          ["#sec-wywiad", "Wywiad"],
          ["#sec-icd", "ICD-10"],
          ["#sec-leki", "Leki"],
          ["#sec-skierowania", "Skierowania"],
          ["#sec-dokumenty", "Dokumenty"],
          ["#sec-historia", "Historia"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand/30 hover:bg-secondary hover:text-brand"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Jeden widok: 2 kolumny na dużym ekranie */}
      <div className="grid gap-3 lg:grid-cols-5">
        {/* Kolumna główna — dokumentacja kliniczna */}
        <div className="space-y-3 lg:col-span-3">
          <VisitSection
            id="sec-wywiad"
            title="Wywiad / notatka lekarska"
            icon={<NotebookPen className="size-4" />}
          >
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Notatka skrótowa (lista wizyt)
              </Label>
              <Input
                className="h-11 text-[15px]"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  markDirty();
                }}
                placeholder="Krótki opis widoczny na liście wizyt"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Wywiad, badanie, plan leczenia
              </Label>
              <Textarea
                value={medicalNote}
                onChange={(e) => {
                  setMedicalNote(e.target.value);
                  markDirty();
                }}
                rows={16}
                className="min-h-[320px] resize-y text-[15px] leading-relaxed md:min-h-[380px] md:text-base"
                placeholder={
                  "Wywiad:\n\nBadanie przedmiotowe:\n\nPlan leczenia / zalecenia:"
                }
              />
            </div>
          </VisitSection>

          <VisitSection
            id="sec-icd"
            title="Rozpoznanie (ICD-10)"
            icon={<Stethoscope className="size-4" />}
            badge={
              diagnoses.length > 0 ? (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                  {diagnoses.length}
                </span>
              ) : null
            }
          >
            <IcdPicker
              existingCodes={diagnoses.map((d) => d.code)}
              onAdd={(d) => {
                setDiagnoses((prev) => [...prev, d]);
                markDirty();
                toast.success(`Dodano ${d.code}`);
              }}
            />
            {diagnoses.length === 0 ? (
              <EmptyState
                title="Brak rozpoznań"
                description="Wyszukaj kod lub opis i dodaj ICD-10."
              />
            ) : (
              <ul className="space-y-2">
                {diagnoses.map((d, i) => (
                  <li
                    key={`${d.code}-${i}`}
                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-base font-semibold text-brand">
                          {d.code}
                        </span>
                        <span className="ml-2 text-sm font-medium text-slate-800">
                          {d.namePl}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setDiagnoses((prev) =>
                            prev.filter((_, j) => j !== i)
                          );
                          markDirty();
                        }}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      className="mt-2 h-10 bg-white"
                      value={d.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDiagnoses((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, description: val } : x
                          )
                        );
                        markDirty();
                      }}
                      placeholder="Opis / komentarz do rozpoznania"
                    />
                  </li>
                ))}
              </ul>
            )}
          </VisitSection>

          <VisitSection
            id="sec-leki"
            title="Zalecenia / leki"
            icon={<Pill className="size-4" />}
            badge={
              prescriptions.length > 0 ? (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                  {prescriptions.length}
                </span>
              ) : null
            }
          >
            <DrugPicker
              onAdd={(p) => {
                setPrescriptions((prev) => [...prev, p]);
                markDirty();
                toast.success(`Dodano ${p.drugName}`);
              }}
            />
            {prescriptions.length === 0 ? (
              <EmptyState
                title="Brak leków na wizycie"
                description="Wyszukaj lek i uzupełnij dawkowanie."
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead>Lek</TableHead>
                      <TableHead>Dawkowanie</TableHead>
                      <TableHead>Okres</TableHead>
                      <TableHead>Uwagi</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{p.drugName}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.inn}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{p.dosage}</TableCell>
                        <TableCell className="text-sm">{p.duration}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.notes || "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setPrescriptions((prev) =>
                                prev.filter((x) => x.id !== p.id)
                              );
                              markDirty();
                            }}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </VisitSection>
        </div>

        {/* Kolumna boczna */}
        <div className="space-y-3 lg:col-span-2">
          <VisitSection
            id="sec-skierowania"
            title="Skierowania / badania"
            icon={<ClipboardList className="size-4" />}
            badge={
              referrals.length > 0 ? (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                  {referrals.length}
                </span>
              ) : null
            }
          >
            <div className="grid gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Tytuł</Label>
                <Input
                  className="h-10"
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                  placeholder="np. MRI kolana P"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Typ</Label>
                  <Input
                    className="h-10"
                    value={refType}
                    onChange={(e) => setRefType(e.target.value)}
                    placeholder="Obrazowanie / Lab"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Uwagi</Label>
                  <Input
                    className="h-10"
                    value={refNotes}
                    onChange={(e) => setRefNotes(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                className="h-10 bg-brand text-white hover:bg-brand-deep"
                onClick={() => {
                  if (!refTitle.trim()) {
                    toast.error("Podaj tytuł skierowania");
                    return;
                  }
                  setReferrals((prev) => [
                    ...prev,
                    {
                      id: `ref-${crypto.randomUUID().slice(0, 8)}`,
                      title: refTitle.trim(),
                      type: refType.trim() || "Inne",
                      notes: refNotes.trim(),
                    },
                  ]);
                  setRefTitle("");
                  setRefNotes("");
                  markDirty();
                  toast.success("Dodano skierowanie");
                }}
              >
                Dodaj skierowanie
              </Button>
            </div>
            {referrals.length === 0 ? (
              <EmptyState
                title="Brak skierowań"
                description="Dodaj pozycje ręcznie powyżej."
              />
            ) : (
              <ul className="divide-y rounded-lg border border-slate-200">
                {referrals.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-start justify-between gap-2 px-3 py-2.5"
                  >
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.type}
                        {r.notes ? ` · ${r.notes}` : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setReferrals((prev) =>
                          prev.filter((x) => x.id !== r.id)
                        );
                        markDirty();
                      }}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </VisitSection>

          <VisitSection
            id="sec-dokumenty"
            title="Dokumenty wizyty"
            icon={<FileText className="size-4" />}
          >
            <DocumentsPanel
              patientId={visit.patientId}
              visitId={visit.id}
              scope="visit"
            />
          </VisitSection>

          <VisitSection
            id="sec-historia"
            title="Poprzednie wizyty"
            icon={<History className="size-4" />}
            defaultOpen={history.length > 0}
          >
            {history.length === 0 ? (
              <EmptyState title="Brak innych wizyt" />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead>Data</TableHead>
                      <TableHead>Lekarz</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <Link
                            href={`/doctor/wizyty/${v.id}`}
                            className="font-medium text-brand hover:underline"
                          >
                            {format(parseISO(v.date), "d MMM yyyy", {
                              locale: pl,
                            })}{" "}
                            {v.time}
                          </Link>
                          {v.note ? (
                            <p className="mt-0.5 max-w-[160px] truncate text-xs text-muted-foreground">
                              {v.note}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm">{v.doctorName}</TableCell>
                        <TableCell>
                          <VisitStatusBadge status={v.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </VisitSection>
        </div>
      </div>

      {/* Akcje dół (sticky) */}
      <VisitActionBar {...actions} sticky />

      <div className="flex justify-end pt-1">
        <Button variant="outline" onClick={() => router.push("/doctor")}>
          Wróć do kalendarza
        </Button>
      </div>
    </div>
  );
}

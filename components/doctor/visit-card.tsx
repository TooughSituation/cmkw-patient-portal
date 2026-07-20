"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Phone,
  Printer,
  Save,
  Trash2,
  XCircle,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  // Autosave medical note (debounce 1.2s)
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

  return (
    <div className="p-3 md:p-4 lg:p-5">
      <div className="mb-3">
        <Button asChild variant="ghost" size="sm" className="h-8 gap-1 px-2">
          <Link href="/doctor/wizyty">
            <ArrowLeft className="size-3.5" />
            Lista wizyt
          </Link>
        </Button>
      </div>

      {/* Header */}
      <Card className="mb-4 border-slate-200 bg-white shadow-sm ring-slate-200">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-5">
          <div>
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

          <div className="flex flex-wrap gap-2">
            <Button
              className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep"
              disabled={saving}
              onClick={() => {
                saveNow();
                toast.success("Wizyta zapisana");
              }}
            >
              <Save className="size-4" />
              Zapisz
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-1.5"
              onClick={() =>
                setStatus("in_progress", "Wizyta w trakcie")
              }
            >
              <Play className="size-4" />
              W trakcie
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-1.5 border-emerald-300 text-emerald-800"
              onClick={() => setStatus("completed", "Wizyta zakończona")}
            >
              <CheckCircle2 className="size-4" />
              Zakończ
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-1.5"
              onClick={() =>
                setStatus("confirmed", "Wizyta potwierdzona")
              }
            >
              Potwierdź
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-1.5"
              onClick={() => {
                toast.success("Drukowanie (podgląd przeglądarki)");
                window.print();
              }}
            >
              <Printer className="size-4" />
              Drukuj
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-1.5 text-destructive"
              onClick={() => setStatus("cancelled", "Wizyta odwołana")}
            >
              <XCircle className="size-4" />
              Anuluj
            </Button>
          </div>
        </CardContent>
      </Card>

      {dirty ? (
        <p className="mb-2 text-xs text-amber-700">
          Niezapisane zmiany — autosave za chwilę…
        </p>
      ) : null}

      <Tabs defaultValue="wywiad" className="min-w-0">
        <TabsList className="mb-3 h-auto w-full flex-wrap justify-start gap-1 bg-white p-1 shadow-sm ring-1 ring-slate-200">
          <TabsTrigger value="wywiad">Wywiad / Notatka</TabsTrigger>
          <TabsTrigger value="rozpoznanie">Rozpoznanie</TabsTrigger>
          <TabsTrigger value="leki">Zalecenia / Leki</TabsTrigger>
          <TabsTrigger value="badania">Badania / Skierowania</TabsTrigger>
          <TabsTrigger value="dokumenty">Dokumenty</TabsTrigger>
          <TabsTrigger value="historia">Historia</TabsTrigger>
        </TabsList>

        <TabsContent value="wywiad">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-brand-heading">
                Wywiad / notatka lekarska
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Notatka skrótowa (lista)</Label>
                <Input
                  className="h-10"
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    markDirty();
                  }}
                  placeholder="Krótki opis widoczny na liście wizyt"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notatka pełna</Label>
                <Textarea
                  value={medicalNote}
                  onChange={(e) => {
                    setMedicalNote(e.target.value);
                    markDirty();
                  }}
                  rows={14}
                  className="min-h-[280px] resize-y text-[15px] leading-relaxed"
                  placeholder="Wywiad, badanie przedmiotowe, plan leczenia…"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rozpoznanie">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-brand-heading">
                Rozpoznanie (ICD-10)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  description="Wyszukaj i dodaj kod ICD-10."
                />
              ) : (
                <ul className="space-y-2">
                  {diagnoses.map((d, i) => (
                    <li
                      key={`${d.code}-${i}`}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-semibold text-brand">
                            {d.code}
                          </span>
                          <span className="ml-2 text-sm font-medium">
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
                        className="mt-2 h-9"
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leki">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-brand-heading">
                Zalecenia / leki
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DrugPicker
                onAdd={(p) => {
                  setPrescriptions((prev) => [...prev, p]);
                  markDirty();
                  toast.success(`Dodano ${p.drugName}`);
                }}
              />
              {prescriptions.length === 0 ? (
                <EmptyState title="Brak leków na wizycie" />
              ) : (
                <div className="overflow-x-auto rounded-lg border">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badania">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-brand-heading">
                Badania / skierowania
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Tytuł</Label>
                  <Input
                    className="h-9"
                    value={refTitle}
                    onChange={(e) => setRefTitle(e.target.value)}
                    placeholder="np. MRI kolana P"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Typ</Label>
                  <Input
                    className="h-9"
                    value={refType}
                    onChange={(e) => setRefType(e.target.value)}
                    placeholder="Obrazowanie / Lab / …"
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <Label className="text-xs">Uwagi</Label>
                  <Input
                    className="h-9"
                    value={refNotes}
                    onChange={(e) => setRefNotes(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button
                    type="button"
                    className="h-9 bg-brand text-white hover:bg-brand-deep"
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
                    Dodaj pozycję
                  </Button>
                </div>
              </div>
              {referrals.length === 0 ? (
                <EmptyState
                  title="Brak skierowań"
                  description="Placeholder listy — dodaj pozycje ręcznie."
                />
              ) : (
                <ul className="divide-y rounded-lg border">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dokumenty">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-brand-heading">
                Dokumenty wizyty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentsPanel
                patientId={visit.patientId}
                visitId={visit.id}
                scope="visit"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historia">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-brand-heading">
                Poprzednie wizyty pacjenta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <EmptyState title="Brak innych wizyt" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead>Data</TableHead>
                      <TableHead>Lekarz</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notatka</TableHead>
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
                        </TableCell>
                        <TableCell className="text-sm">{v.doctorName}</TableCell>
                        <TableCell>
                          <VisitStatusBadge status={v.status} />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {v.note || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/doctor")}
        >
          Wróć do kalendarza
        </Button>
      </div>
    </div>
  );
}

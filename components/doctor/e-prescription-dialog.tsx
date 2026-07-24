"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookmarkPlus,
  Import,
  LayoutTemplate,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { loadDrugsFromLocalStorage } from "@/lib/doctor/drugs-client";
import type { Drug } from "@/lib/doctor/drug-types";
import type {
  EPrescription,
  EPrescriptionItem,
  EPrescriptionKind,
  EPrescriptionTemplate,
} from "@/lib/doctor/ehealth-types";
import { E_PRESCRIPTION_KIND_LABELS } from "@/lib/doctor/ehealth-types";
import type { VisitPrescription } from "@/lib/doctor/types";
import { cn } from "@/lib/utils";

type DraftItem = Omit<EPrescriptionItem, "id"> & { key: string };

function emptyItem(): DraftItem {
  return {
    key: crypto.randomUUID(),
    drugId: "",
    drugName: "",
    inn: "",
    form: "",
    strength: "",
    dosage: "",
    quantity: "1 op.",
    duration: "30 dni",
    frequency: "wg zaleceń",
    notes: "",
  };
}

export function EPrescriptionDialog({
  open,
  onOpenChange,
  patientName,
  patientPesel,
  doctorName,
  doctorPwz,
  onSave,
  initial,
  visitPrescriptions = [],
  templates = [],
  onSaveTemplate,
  onDeleteTemplate,
  readOnly = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patientName: string;
  patientPesel: string;
  doctorName: string;
  doctorPwz?: string;
  onSave: (data: {
    kind: EPrescriptionKind;
    items: Omit<EPrescriptionItem, "id">[];
    generalNotes: string;
    templateName?: string;
  }) => void;
  initial?: EPrescription | null;
  /** Leki z sekcji „Zalecenia / leki” karty wizyty */
  visitPrescriptions?: VisitPrescription[];
  templates?: EPrescriptionTemplate[];
  onSaveTemplate?: (input: {
    name: string;
    description?: string;
    kind: EPrescriptionKind;
    items: Omit<EPrescriptionItem, "id">[];
    generalNotes?: string;
    id?: string;
  }) => void;
  onDeleteTemplate?: (id: string) => void;
  readOnly?: boolean;
}) {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [kind, setKind] = useState<EPrescriptionKind>("30_days");
  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [q, setQ] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [appliedTemplate, setAppliedTemplate] = useState<string | undefined>();
  const [tplName, setTplName] = useState("");

  useEffect(() => {
    if (open) setDrugs(loadDrugsFromLocalStorage());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setKind(initial.kind);
      setGeneralNotes(initial.generalNotes);
      setItems(
        initial.items.map((it) => ({
          key: it.id,
          drugId: it.drugId,
          drugName: it.drugName,
          inn: it.inn,
          form: it.form,
          strength: it.strength,
          dosage: it.dosage,
          quantity: it.quantity,
          duration: it.duration,
          frequency: it.frequency,
          notes: it.notes,
        }))
      );
      setAppliedTemplate(undefined);
    } else {
      setKind("30_days");
      setGeneralNotes("");
      setItems([emptyItem()]);
      setAppliedTemplate(undefined);
    }
    setQ("");
    setActiveKey(null);
    setTplName("");
  }, [open, initial]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 1) return [];
    return drugs
      .filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.inn.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query)
      )
      .slice(0, 10);
  }, [drugs, q]);

  function pickDrug(drug: Drug) {
    const targetKey = activeKey ?? items[0]?.key;
    if (!targetKey) return;
    setItems((prev) =>
      prev.map((it) =>
        it.key === targetKey
          ? {
              ...it,
              drugId: drug.id,
              drugName: drug.name,
              inn: drug.inn,
              form: drug.form,
              strength: drug.strength,
              dosage: drug.dosage.slice(0, 120) || it.dosage,
              quantity: `1 op. (${drug.packageSize})`,
              duration: kind === "annual" ? "do 365 dni (roczna)" : "30 dni",
            }
          : it
      )
    );
    setQ("");
    setActiveKey(null);
  }

  function applyTemplate(t: EPrescriptionTemplate) {
    setKind(t.kind);
    setGeneralNotes(t.generalNotes);
    setItems(
      t.items.map((it) => ({
        ...it,
        key: crypto.randomUUID(),
      }))
    );
    setAppliedTemplate(t.name);
    toast.success(`Szablon: ${t.name}`, {
      description: `${t.items.length} pozycji wstawionych`,
    });
  }

  function importFromVisit() {
    if (visitPrescriptions.length === 0) {
      toast.error("Brak leków w zaleceniach tej wizyty");
      return;
    }
    const imported: DraftItem[] = visitPrescriptions.map((p) => ({
      key: crypto.randomUUID(),
      drugId: p.drugId,
      drugName: p.drugName,
      inn: p.inn,
      form: "",
      strength: "",
      dosage: p.dosage,
      quantity: "1 op.",
      duration: p.duration || "30 dni",
      frequency: "wg zaleceń",
      notes: p.notes,
    }));
    setItems((prev) => {
      const hasOnlyEmpty =
        prev.length === 1 && !prev[0].drugName && !prev[0].dosage;
      return hasOnlyEmpty ? imported : [...prev, ...imported];
    });
    toast.success("Zaimportowano leki z wizyty", {
      description: `${imported.length} pozycji`,
    });
  }

  function handleSubmit() {
    if (readOnly) return;
    const valid = items.filter((it) => it.drugName.trim());
    if (valid.length === 0) {
      toast.error("Dodaj co najmniej jeden lek");
      return;
    }
    for (const it of valid) {
      if (!it.dosage.trim()) {
        toast.error(`Uzupełnij dawkowanie: ${it.drugName}`);
        return;
      }
    }
    onSave({
      kind,
      generalNotes,
      templateName: appliedTemplate,
      items: valid.map((it) => {
        const { key, ...rest } = it;
        void key;
        return rest;
      }),
    });
  }

  function handleSaveAsTemplate() {
    if (!onSaveTemplate) return;
    const name = tplName.trim();
    if (!name) {
      toast.error("Podaj nazwę szablonu");
      return;
    }
    const valid = items.filter((it) => it.drugName.trim());
    if (valid.length === 0) {
      toast.error("Szablon musi mieć leki");
      return;
    }
    onSaveTemplate({
      name,
      kind,
      generalNotes,
      items: valid.map((it) => {
        const { key, ...rest } = it;
        void key;
        return rest;
      }),
    });
    setTplName("");
    toast.success("Szablon zapisany");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 px-5 py-4 text-left">
          <DialogTitle className="text-brand-heading">
            {readOnly
              ? "Podgląd formularza"
              : initial
                ? "Edycja e-recepty"
                : "Wystaw e-receptę"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Mock P1 / CeZ · <strong>{patientName}</strong>
            {patientPesel ? (
              <span className="font-mono">
                {" "}
                · ******{patientPesel.slice(-4)}
              </span>
            ) : null}
            <br />
            {doctorName}
            {doctorPwz ? ` · PWZ ${doctorPwz}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Szablony */}
          {!readOnly && templates.length > 0 ? (
            <div className="space-y-2 rounded-xl border border-brand/15 bg-secondary/40 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
                <LayoutTemplate className="size-3.5" />
                Szablony recept
              </div>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((t) => (
                  <div key={t.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="rounded-full border border-brand/20 bg-white px-3 py-1.5 text-left text-xs font-medium text-brand-deep shadow-sm transition hover:border-brand hover:bg-white hover:shadow"
                      title={t.description}
                    >
                      {t.name}
                      {t.source === "user" ? (
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          (mój)
                        </span>
                      ) : null}
                    </button>
                    {t.source === "user" && onDeleteTemplate ? (
                      <button
                        type="button"
                        className="absolute -top-1.5 -right-1.5 hidden size-5 items-center justify-center rounded-full bg-white text-destructive shadow ring-1 ring-slate-200 group-hover:flex"
                        title="Usuń szablon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTemplate(t.id);
                          toast.message("Szablon usunięty");
                        }}
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Import + rodzaj */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Rodzaj recepty</Label>
              <div className="flex flex-wrap gap-2">
                {(["30_days", "annual"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={readOnly}
                    onClick={() => setKind(k)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                      kind === k
                        ? "border-brand bg-secondary text-brand-deep"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {E_PRESCRIPTION_KIND_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
            {!readOnly ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-1.5 border-brand/25 text-brand-deep"
                onClick={importFromVisit}
                disabled={visitPrescriptions.length === 0}
              >
                <Import className="size-4" />
                Leki z zalecenia wizyty
                {visitPrescriptions.length > 0 ? (
                  <Badge variant="secondary" className="ml-0.5 h-5 px-1.5">
                    {visitPrescriptions.length}
                  </Badge>
                ) : null}
              </Button>
            ) : null}
          </div>

          {/* Pozycje */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                Pozycje leków ({items.length})
              </Label>
              {!readOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => setItems((prev) => [...prev, emptyItem()])}
                >
                  <Plus className="size-3.5" />
                  Dodaj pozycję
                </Button>
              ) : null}
            </div>

            {items.map((it, idx) => (
              <div
                key={it.key}
                className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition hover:border-brand/20"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-brand">
                    Pozycja {idx + 1}
                    {it.drugName ? (
                      <span className="ml-2 font-normal text-slate-700">
                        {it.drugName}
                      </span>
                    ) : null}
                  </span>
                  {!readOnly && items.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setItems((prev) =>
                          prev.filter((x) => x.key !== it.key)
                        )
                      }
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  ) : null}
                </div>

                {!readOnly ? (
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      className="h-11 bg-white pl-8 text-[15px]"
                      placeholder="Szukaj leku (nazwa / INN / kategoria)…"
                      value={activeKey === it.key ? q : it.drugName || ""}
                      onFocus={() => {
                        setActiveKey(it.key);
                        setQ("");
                      }}
                      onChange={(e) => {
                        setActiveKey(it.key);
                        setQ(e.target.value);
                      }}
                    />
                    {activeKey === it.key && results.length > 0 ? (
                      <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
                        {results.map((d) => (
                          <li key={d.id}>
                            <button
                              type="button"
                              className="flex w-full flex-col px-3 py-2.5 text-left text-sm hover:bg-secondary"
                              onClick={() => pickDrug(d)}
                            >
                              <span className="font-medium">{d.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {d.inn} · {d.strength} · {d.form} · {d.category}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm font-medium">{it.drugName}</p>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["dosage", "Dawkowanie *", "np. 1 tabl. 2×/d"],
                      ["frequency", "Częstotliwość", "np. co 12 h"],
                      ["quantity", "Ilość", "1 op."],
                      ["duration", "Okres", "30 dni"],
                    ] as const
                  ).map(([field, label, ph]) => (
                    <div key={field} className="space-y-1">
                      <Label className="text-[11px]">{label}</Label>
                      <Input
                        className="h-10 bg-white"
                        value={it[field]}
                        disabled={readOnly}
                        placeholder={ph}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.key === it.key
                                ? { ...x, [field]: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                    </div>
                  ))}
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[11px]">Uwagi do pozycji</Label>
                    <Input
                      className="h-10 bg-white"
                      value={it.notes}
                      disabled={readOnly}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.key === it.key
                              ? { ...x, notes: e.target.value }
                              : x
                          )
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Uwagi ogólne</Label>
            <Textarea
              value={generalNotes}
              disabled={readOnly}
              onChange={(e) => setGeneralNotes(e.target.value)}
              rows={3}
              className="resize-y bg-white text-[15px]"
              placeholder="Zalecenia, uwagi dla apteki / pacjenta…"
            />
          </div>

          {/* Zapisz jako szablon */}
          {!readOnly && onSaveTemplate ? (
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1">
                <Label className="text-[11px]">Zapisz bieżące jako szablon</Label>
                <Input
                  className="h-10"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder="np. Mój zestaw pourazowy"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-1.5"
                onClick={handleSaveAsTemplate}
              >
                <BookmarkPlus className="size-4" />
                Zapisz szablon
              </Button>
            </div>
          ) : null}

          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-900"
          >
            Mock — bez wysyłki do P1 / CeZ
          </Badge>
        </div>

        <DialogFooter className="border-t border-slate-200 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {readOnly ? "Zamknij" : "Anuluj"}
          </Button>
          {!readOnly ? (
            <Button
              type="button"
              className="bg-brand text-white hover:bg-brand-deep"
              onClick={handleSubmit}
            >
              {initial ? "Zapisz zmiany" : "Wystaw e-receptę"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

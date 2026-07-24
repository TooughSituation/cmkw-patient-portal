"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadDrugsFromLocalStorage } from "@/lib/doctor/drugs-client";
import type { Drug } from "@/lib/doctor/drug-types";
import type {
  EPrescription,
  EPrescriptionItem,
  EPrescriptionKind,
} from "@/lib/doctor/ehealth-types";
import { E_PRESCRIPTION_KIND_LABELS } from "@/lib/doctor/ehealth-types";
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
  doctorId,
  doctorPwz,
  visitId,
  patientId,
  onSave,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patientName: string;
  patientPesel: string;
  doctorName: string;
  doctorId: string;
  doctorPwz?: string;
  visitId: string;
  patientId: string;
  onSave: (data: {
    kind: EPrescriptionKind;
    items: Omit<EPrescriptionItem, "id">[];
    generalNotes: string;
  }) => void;
  /** Edycja istniejącej (tylko issued) */
  initial?: EPrescription | null;
}) {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [kind, setKind] = useState<EPrescriptionKind>("30_days");
  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [q, setQ] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

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
    } else {
      setKind("30_days");
      setGeneralNotes("");
      setItems([emptyItem()]);
    }
    setQ("");
    setActiveKey(null);
  }, [open, initial]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 1) return [];
    return drugs
      .filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.inn.toLowerCase().includes(query)
      )
      .slice(0, 8);
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

  function handleSubmit() {
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
      items: valid.map((it) => {
        const { key, ...rest } = it;
        void key;
        return rest;
      }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 px-5 py-4 text-left">
          <DialogTitle className="text-brand-heading">
            {initial ? "Edycja e-recepty" : "Wystaw e-receptę"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Mock P1 / CeZ — numer i kod dostępu generowane lokalnie. Pacjent:{" "}
            <strong>{patientName}</strong>
            {patientPesel ? (
              <span className="font-mono"> · PESEL ******{patientPesel.slice(-4)}</span>
            ) : null}
            <br />
            Lekarz: {doctorName}
            {doctorPwz ? ` · PWZ ${doctorPwz}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Rodzaj recepty</Label>
            <div className="flex flex-wrap gap-2">
              {(["30_days", "annual"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                Pozycje leków ({items.length})
              </Label>
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
            </div>

            {items.map((it, idx) => (
              <div
                key={it.key}
                className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
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
                  {items.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setItems((prev) => prev.filter((x) => x.key !== it.key))
                      }
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  ) : null}
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-10 bg-white pl-8"
                    placeholder="Szukaj leku (nazwa / INN)…"
                    value={activeKey === it.key ? q : it.drugName || ""}
                    onFocus={() => {
                      setActiveKey(it.key);
                      setQ("");
                    }}
                    onChange={(e) => {
                      setActiveKey(it.key);
                      setQ(e.target.value);
                      if (!e.target.value) {
                        setItems((prev) =>
                          prev.map((x) =>
                            x.key === it.key
                              ? { ...emptyItem(), key: it.key }
                              : x
                          )
                        );
                      }
                    }}
                  />
                  {activeKey === it.key && results.length > 0 ? (
                    <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      {results.map((d) => (
                        <li key={d.id}>
                          <button
                            type="button"
                            className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-secondary"
                            onClick={() => pickDrug(d)}
                          >
                            <span className="font-medium">{d.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {d.inn} · {d.strength} · {d.form}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Dawkowanie *</Label>
                    <Input
                      className="h-10 bg-white"
                      value={it.dosage}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.key === it.key
                              ? { ...x, dosage: e.target.value }
                              : x
                          )
                        )
                      }
                      placeholder="np. 1 tabl. 2×/d"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Częstotliwość</Label>
                    <Input
                      className="h-10 bg-white"
                      value={it.frequency}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.key === it.key
                              ? { ...x, frequency: e.target.value }
                              : x
                          )
                        )
                      }
                      placeholder="np. co 12 h"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Ilość</Label>
                    <Input
                      className="h-10 bg-white"
                      value={it.quantity}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.key === it.key
                              ? { ...x, quantity: e.target.value }
                              : x
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Okres stosowania</Label>
                    <Input
                      className="h-10 bg-white"
                      value={it.duration}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.key === it.key
                              ? { ...x, duration: e.target.value }
                              : x
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[11px]">Uwagi do pozycji</Label>
                    <Input
                      className="h-10 bg-white"
                      value={it.notes}
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
            <Label className="text-xs font-medium">Uwagi ogólne do recepty</Label>
            <Textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              rows={3}
              className="resize-y bg-white text-[15px]"
              placeholder="Zalecenia, uwagi dla apteki / pacjenta…"
            />
          </div>

          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-900"
          >
            Mock — bez wysyłki do P1 / CeZ
          </Badge>
        </div>

        <DialogFooter className="border-t border-slate-200 px-5 py-3 sm:justify-between">
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            Wizyta {visitId} · pacjent {patientId} · lekarz {doctorId}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => onOpenChange(false)}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              className="flex-1 bg-brand text-white hover:bg-brand-deep sm:flex-none"
              onClick={handleSubmit}
            >
              {initial ? "Zapisz zmiany" : "Wystaw e-receptę"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Uproszczony select rodzaju — eksportowany przy edycji z list */
export function KindSelect({
  value,
  onChange,
}: {
  value: EPrescriptionKind;
  onChange: (v: EPrescriptionKind) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as EPrescriptionKind)}>
      <SelectTrigger className="h-10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="30_days">
          {E_PRESCRIPTION_KIND_LABELS["30_days"]}
        </SelectItem>
        <SelectItem value="annual">
          {E_PRESCRIPTION_KIND_LABELS.annual}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

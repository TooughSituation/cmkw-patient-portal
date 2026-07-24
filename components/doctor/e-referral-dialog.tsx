"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
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
import type { EReferral, EReferralUrgency } from "@/lib/doctor/ehealth-types";
import {
  E_REFERRAL_CATEGORIES,
  E_REFERRAL_EXAM_TYPES,
  E_REFERRAL_URGENCY_LABELS,
  TARGET_FACILITIES,
} from "@/lib/doctor/ehealth-types";
import { cn } from "@/lib/utils";

export function EReferralDialog({
  open,
  onOpenChange,
  patientName,
  patientPesel,
  doctorName,
  doctorPwz,
  defaultIcd,
  onSave,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patientName: string;
  patientPesel: string;
  doctorName: string;
  doctorPwz?: string;
  defaultIcd?: string;
  onSave: (data: {
    examCategory: string;
    examType: string;
    justification: string;
    urgency: EReferralUrgency;
    targetFacility: string;
    icdCode: string;
  }) => void;
  initial?: EReferral | null;
}) {
  const [examCategory, setExamCategory] = useState("Obrazowanie");
  const [examType, setExamType] = useState("");
  const [justification, setJustification] = useState("");
  const [urgency, setUrgency] = useState<EReferralUrgency>("normal");
  const [targetFacility, setTargetFacility] = useState(
    "Do wyboru przez pacjenta"
  );
  const [icdCode, setIcdCode] = useState("");
  const [q, setQ] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setExamCategory(initial.examCategory);
      setExamType(initial.examType);
      setJustification(initial.justification);
      setUrgency(initial.urgency);
      setTargetFacility(initial.targetFacility || "Do wyboru przez pacjenta");
      setIcdCode(initial.icdCode);
    } else {
      setExamCategory("Obrazowanie");
      setExamType("");
      setJustification("");
      setUrgency("normal");
      setTargetFacility("Do wyboru przez pacjenta");
      setIcdCode(defaultIcd ?? "");
    }
    setQ("");
    setShowSuggest(false);
  }, [open, initial, defaultIcd]);

  const suggestions = useMemo(() => {
    const query = (q || examType).trim().toLowerCase();
    if (query.length < 1) {
      return E_REFERRAL_EXAM_TYPES.filter(
        (e) => e.category === examCategory
      ).slice(0, 10);
    }
    return E_REFERRAL_EXAM_TYPES.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [q, examType, examCategory]);

  function handleSubmit() {
    if (!examType.trim()) {
      toast.error("Podaj rodzaj badania / konsultacji");
      return;
    }
    if (justification.trim().length < 10) {
      toast.error("Uzupełnij uzasadnienie (min. 10 znaków)");
      return;
    }
    onSave({
      examCategory,
      examType: examType.trim(),
      justification: justification.trim(),
      urgency,
      targetFacility,
      icdCode: icdCode.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-200 px-5 py-4 text-left">
          <DialogTitle className="text-brand-heading">
            {initial ? "Edycja e-skierowania" : "Wystaw e-skierowanie"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Mock P1 — numer generowany lokalnie. Pacjent:{" "}
            <strong>{patientName}</strong>
            {patientPesel ? (
              <span className="font-mono">
                {" "}
                · PESEL ******{patientPesel.slice(-4)}
              </span>
            ) : null}
            <br />
            Lekarz: {doctorName}
            {doctorPwz ? ` · PWZ ${doctorPwz}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kategoria</Label>
              <Select value={examCategory} onValueChange={setExamCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {E_REFERRAL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tryb</Label>
              <div className="flex gap-2">
                {(["normal", "urgent"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUrgency(u)}
                    className={cn(
                      "h-11 flex-1 rounded-lg border text-sm font-medium transition",
                      urgency === u
                        ? u === "urgent"
                          ? "border-red-300 bg-red-50 text-red-800"
                          : "border-brand bg-secondary text-brand-deep"
                        : "border-slate-200 bg-white text-slate-600"
                    )}
                  >
                    {E_REFERRAL_URGENCY_LABELS[u]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Rodzaj badania / konsultacji *
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-11 pl-8 text-[15px]"
                value={examType}
                onChange={(e) => {
                  setExamType(e.target.value);
                  setQ(e.target.value);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
                placeholder="np. MRI kolana, konsultacja reumatologiczna…"
              />
              {showSuggest && suggestions.length > 0 ? (
                <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((s) => (
                    <li key={`${s.category}-${s.name}`}>
                      <button
                        type="button"
                        className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-secondary"
                        onClick={() => {
                          setExamType(s.name);
                          setExamCategory(s.category);
                          setShowSuggest(false);
                          setQ("");
                        }}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.category}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Uzasadnienie *</Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={5}
              className="min-h-[120px] resize-y text-[15px] leading-relaxed"
              placeholder="Opis kliniczny uzasadniający skierowanie…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Ośrodek docelowy (opcjonalnie)
              </Label>
              <Select value={targetFacility} onValueChange={setTargetFacility}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_FACILITIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kod ICD (opcjonalnie)</Label>
              <Input
                className="h-11 font-mono"
                value={icdCode}
                onChange={(e) => setIcdCode(e.target.value.toUpperCase())}
                placeholder="np. M17.1"
              />
            </div>
          </div>

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
            Anuluj
          </Button>
          <Button
            type="button"
            className="bg-brand text-white hover:bg-brand-deep"
            onClick={handleSubmit}
          >
            {initial ? "Zapisz zmiany" : "Wystaw e-skierowanie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

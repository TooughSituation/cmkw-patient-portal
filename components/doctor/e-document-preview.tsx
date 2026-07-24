"use client";

import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  AlertTriangle,
  FileDown,
  History,
  Loader2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  EAuditEntry,
  EPrescription,
  EReferral,
} from "@/lib/doctor/ehealth-types";
import {
  E_AUDIT_ACTION_LABELS,
  E_DOCUMENT_STATUS_LABELS,
  E_PRESCRIPTION_KIND_LABELS,
  E_REFERRAL_URGENCY_LABELS,
} from "@/lib/doctor/ehealth-types";
import {
  toP1PrescriptionPayload,
  toP1ReferralPayload,
} from "@/lib/doctor/ehealth-client";
import {
  downloadPrescriptionPdf,
  downloadReferralPdf,
} from "@/components/doctor/e-document-pdf";
import { maskPesel } from "@/lib/doctor/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function StatusBadge({ status }: { status: "issued" | "cancelled" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        status === "issued" &&
          "border-emerald-200 bg-emerald-50 text-emerald-800",
        status === "cancelled" && "border-slate-300 bg-slate-100 text-slate-600 line-through decoration-transparent"
      )}
    >
      {E_DOCUMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

function AuditTimeline({ log }: { log: EAuditEntry[] }) {
  if (!log?.length) {
    return (
      <p className="text-xs text-muted-foreground">Brak wpisów audytu.</p>
    );
  }
  const sorted = [...log].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <ul className="space-y-2 border-l-2 border-brand/20 pl-3">
      {sorted.map((e) => (
        <li key={e.id} className="relative text-xs">
          <span className="absolute -left-[17px] top-1 size-2 rounded-full bg-brand" />
          <p className="font-medium text-slate-800">
            {E_AUDIT_ACTION_LABELS[e.action] ?? e.action}
            <span className="ml-1.5 font-normal text-muted-foreground">
              {format(parseISO(e.at), "d MMM yyyy HH:mm", { locale: pl })}
            </span>
          </p>
          <p className="text-slate-600">{e.summary}</p>
          <p className="text-[10px] text-muted-foreground">
            {e.actorName}
            {e.actorRole ? ` · ${e.actorRole}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function EPrescriptionPreview({
  rx,
  open,
  onOpenChange,
  onCancel,
  onSms,
  onEdit,
  allowEdit = true,
  allowCancel = true,
  allowSms = true,
}: {
  rx: EPrescription | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCancel?: (id: string, reason: string) => void;
  onSms?: (id: string) => void;
  onEdit?: (rx: EPrescription) => void;
  allowEdit?: boolean;
  allowCancel?: boolean;
  allowSms?: boolean;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!rx) return null;

  async function exportPdf() {
    if (!rx) return;
    setPdfLoading(true);
    try {
      await downloadPrescriptionPdf(rx);
      toast.success("PDF e-recepty pobrany", {
        description: `${rx.number}.pdf`,
      });
    } catch {
      toast.error("Nie udało się wygenerować PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  function sendSms() {
    if (!rx || rx.status === "cancelled") return;
    onSms?.(rx.id);
    toast.success("SMS do pacjenta wysłany (mock)", {
      description: `Kod dostępu ${rx.accessCode} · nr ${rx.number}`,
    });
  }

  function copyP1() {
    if (!rx) return;
    const payload = JSON.stringify(toP1PrescriptionPayload(rx), null, 2);
    void navigator.clipboard.writeText(payload).then(
      () => toast.success("Payload P1 skopiowany (mock)"),
      () => toast.message("Payload P1", { description: payload.slice(0, 120) })
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2 text-brand-heading">
              e-Recepta
              <StatusBadge status={rx.status} />
            </DialogTitle>
          </DialogHeader>

          <div
            className="space-y-4 rounded-xl border-2 border-brand/20 bg-white p-4 shadow-sm print:border-black"
            data-print="e-prescription"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                  CMKW · e-Recepta (mock P1)
                </p>
                <p className="mt-1 font-mono text-xl font-bold tracking-wide text-brand-heading">
                  {rx.number}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Kod dostępu:{" "}
                  <span className="font-mono text-base font-semibold text-slate-800">
                    {rx.accessCode}
                  </span>
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{E_PRESCRIPTION_KIND_LABELS[rx.kind]}</p>
                <p>
                  {format(parseISO(rx.issuedAt), "d MMM yyyy HH:mm", {
                    locale: pl,
                  })}
                </p>
              </div>
            </div>

            <dl className="grid gap-1 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Pacjent</dt>
                <dd className="font-medium">{rx.patientName}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">PESEL</dt>
                <dd className="font-mono">
                  {rx.patientPesel ? maskPesel(rx.patientPesel) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Lekarz</dt>
                <dd className="text-right font-medium">{rx.doctorName}</dd>
              </div>
              {rx.doctorPwz ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">PWZ</dt>
                  <dd className="font-mono">{rx.doctorPwz}</dd>
                </div>
              ) : null}
            </dl>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pozycje
              </p>
              <ol className="space-y-2">
                {rx.items.map((it, i) => (
                  <li
                    key={it.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm"
                  >
                    <p className="font-semibold text-brand-heading">
                      {i + 1}. {it.drugName}{" "}
                      <span className="font-normal text-slate-600">
                        {it.strength}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {it.inn} · {it.form}
                    </p>
                    <p className="mt-1">
                      <span className="text-muted-foreground">Dawka:</span>{" "}
                      {it.dosage}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Ilość:</span>{" "}
                      {it.quantity} ·{" "}
                      <span className="text-muted-foreground">Okres:</span>{" "}
                      {it.duration}
                    </p>
                    {it.frequency ? (
                      <p>
                        <span className="text-muted-foreground">Częst.:</span>{" "}
                        {it.frequency}
                      </p>
                    ) : null}
                    {it.notes ? (
                      <p className="text-xs text-slate-600">Uwagi: {it.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>

            {rx.generalNotes ? (
              <p className="text-sm">
                <span className="text-muted-foreground">Uwagi ogólne:</span>{" "}
                {rx.generalNotes}
              </p>
            ) : null}

            {rx.status === "cancelled" ? (
              <div className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                <p className="font-medium">Anulowana</p>
                {rx.cancelReason ? <p>{rx.cancelReason}</p> : null}
              </div>
            ) : null}

            {rx.smsSentAt ? (
              <p className="text-xs text-emerald-700">
                SMS wysłany (mock):{" "}
                {format(parseISO(rx.smsSentAt), "d MMM yyyy HH:mm", {
                  locale: pl,
                })}
              </p>
            ) : null}

            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <History className="size-3.5" />
                Audyt
              </p>
              <AuditTimeline log={rx.auditLog ?? []} />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <div className="flex w-full flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 flex-1 gap-1.5"
                disabled={pdfLoading}
                onClick={() => void exportPdf()}
              >
                {pdfLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Pobierz PDF
              </Button>
              {rx.status === "issued" && allowSms && onSms ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 gap-1.5"
                  onClick={sendSms}
                >
                  <MessageSquare className="size-4" />
                  SMS do pacjenta
                </Button>
              ) : null}
            </div>
            <div className="flex w-full flex-wrap gap-2">
              {rx.status === "issued" && allowEdit && onEdit ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(rx);
                  }}
                >
                  Edytuj
                </Button>
              ) : null}
              {rx.status === "issued" && allowCancel && onCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 gap-1.5 text-destructive"
                  onClick={() => {
                    setReason("");
                    setCancelOpen(true);
                  }}
                >
                  <XCircle className="size-4" />
                  Anuluj e-receptę
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                className="h-10 text-xs text-muted-foreground"
                onClick={copyP1}
              >
                Kopiuj payload P1
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4" />
              Anulowanie e-recepty
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Powód anulowania</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="np. błąd dawkowania, zmiana terapii…"
              className="h-10"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Wróć
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                onCancel?.(rx.id, reason);
                setCancelOpen(false);
                onOpenChange(false);
                toast.success("e-Recepta anulowana (mock)");
              }}
            >
              Potwierdź anulowanie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EReferralPreview({
  refDoc,
  open,
  onOpenChange,
  onCancel,
  onEdit,
  allowEdit = true,
  allowCancel = true,
}: {
  refDoc: EReferral | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCancel?: (id: string, reason: string) => void;
  onEdit?: (r: EReferral) => void;
  allowEdit?: boolean;
  allowCancel?: boolean;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!refDoc) return null;

  async function exportPdf() {
    if (!refDoc) return;
    setPdfLoading(true);
    try {
      await downloadReferralPdf(refDoc);
      toast.success("PDF e-skierowania pobrany", {
        description: `${refDoc.number}.pdf`,
      });
    } catch {
      toast.error("Nie udało się wygenerować PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  function copyP1() {
    const payload = JSON.stringify(toP1ReferralPayload(refDoc!), null, 2);
    void navigator.clipboard.writeText(payload).then(
      () => toast.success("Payload P1 skopiowany (mock)"),
      () => toast.message("Payload P1", { description: payload.slice(0, 120) })
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2 text-brand-heading">
              e-Skierowanie
              <StatusBadge status={refDoc.status} />
              {refDoc.urgency === "urgent" ? (
                <Badge className="border-red-200 bg-red-50 text-red-800" variant="outline">
                  Pilne
                </Badge>
              ) : null}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 rounded-xl border-2 border-brand/20 bg-white p-4 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                CMKW · e-Skierowanie (mock P1)
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-brand-heading">
                {refDoc.number}
              </p>
              <p className="text-sm text-muted-foreground">
                Kod:{" "}
                <span className="font-mono font-semibold text-slate-800">
                  {refDoc.accessCode}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(parseISO(refDoc.issuedAt), "d MMMM yyyy HH:mm", {
                  locale: pl,
                })}
              </p>
            </div>

            <dl className="grid gap-1.5 text-sm">
              <Row label="Pacjent" value={refDoc.patientName} />
              <Row
                label="PESEL"
                value={
                  refDoc.patientPesel
                    ? maskPesel(refDoc.patientPesel)
                    : "—"
                }
                mono
              />
              <Row label="Lekarz" value={refDoc.doctorName} />
              <Row label="Kategoria" value={refDoc.examCategory} />
              <Row label="Badanie" value={refDoc.examType} strong />
              <Row
                label="Tryb"
                value={E_REFERRAL_URGENCY_LABELS[refDoc.urgency]}
              />
              {refDoc.targetFacility ? (
                <Row label="Ośrodek" value={refDoc.targetFacility} />
              ) : null}
              {refDoc.icdCode ? (
                <Row label="ICD" value={refDoc.icdCode} mono />
              ) : null}
            </dl>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Uzasadnienie
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {refDoc.justification}
              </p>
            </div>

            {refDoc.status === "cancelled" ? (
              <div className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm">
                <p className="font-medium">Anulowane</p>
                {refDoc.cancelReason ? <p>{refDoc.cancelReason}</p> : null}
              </div>
            ) : null}

            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <History className="size-3.5" />
                Audyt
              </p>
              <AuditTimeline log={refDoc.auditLog ?? []} />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <div className="flex w-full flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 flex-1 gap-1.5"
                disabled={pdfLoading}
                onClick={() => void exportPdf()}
              >
                {pdfLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Pobierz PDF
              </Button>
              {refDoc.status === "issued" && allowEdit && onEdit ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(refDoc);
                  }}
                >
                  Edytuj
                </Button>
              ) : null}
              {refDoc.status === "issued" && allowCancel && onCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 gap-1.5 text-destructive"
                  onClick={() => {
                    setReason("");
                    setCancelOpen(true);
                  }}
                >
                  <XCircle className="size-4" />
                  Anuluj
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-9 text-xs text-muted-foreground"
              onClick={copyP1}
            >
              Kopiuj payload P1
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Anulowanie e-skierowania
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Powód</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-10"
              placeholder="Powód anulowania…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Wróć
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                onCancel?.(refDoc.id, reason);
                setCancelOpen(false);
                onOpenChange(false);
                toast.success("e-Skierowanie anulowane (mock)");
              }}
            >
              Potwierdź
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({
  label,
  value,
  mono,
  strong,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-right",
          mono && "font-mono",
          strong && "font-semibold text-brand-heading"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

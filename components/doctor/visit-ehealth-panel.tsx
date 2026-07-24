"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ClipboardPlus,
  Eye,
  FilePlus2,
  Pill,
  Send,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/doctor/empty-state";
import { DocumentsPanel } from "@/components/doctor/documents-panel";
import { EPrescriptionDialog } from "@/components/doctor/e-prescription-dialog";
import { EReferralDialog } from "@/components/doctor/e-referral-dialog";
import {
  EPrescriptionPreview,
  EReferralPreview,
  StatusBadge,
} from "@/components/doctor/e-document-preview";
import { useEHealth } from "@/hooks/use-ehealth";
import type { DoctorVisit } from "@/lib/doctor/types";
import type {
  EPrescription,
  EReferral,
} from "@/lib/doctor/ehealth-types";
import {
  E_PRESCRIPTION_KIND_LABELS,
  E_REFERRAL_URGENCY_LABELS,
} from "@/lib/doctor/ehealth-types";
import { cn } from "@/lib/utils";

const DOCTOR_PWZ: Record<string, string> = {
  kiryluk: "1234567",
  wenta: "2345678",
  frankowski: "3456789",
  zawadzki: "4567890",
  torba: "5678901",
  sammoudi: "6789012",
};

export function VisitEHealthPanel({
  visit,
  canIssue,
}: {
  visit: DoctorVisit;
  /** true gdy status in_progress lub completed */
  canIssue: boolean;
}) {
  const {
    loading,
    prescriptionsForVisit,
    referralsForVisit,
    issuePrescription,
    editPrescription,
    annulPrescription,
    markSmsSent,
    issueReferral,
    editReferral,
    annulReferral,
    templates,
    createOrUpdateTemplate,
    removeTemplate,
    canIssue: roleCanIssue,
    canSms,
  } = useEHealth();

  const allowIssue = canIssue && roleCanIssue;
  const isReceptionReadOnly = !roleCanIssue;

  const rxList = prescriptionsForVisit(visit.id);
  const refList = referralsForVisit(visit.id);

  const [rxFormOpen, setRxFormOpen] = useState(false);
  const [refFormOpen, setRefFormOpen] = useState(false);
  const [editRx, setEditRx] = useState<EPrescription | null>(null);
  const [editRef, setEditRef] = useState<EReferral | null>(null);
  const [previewRx, setPreviewRx] = useState<EPrescription | null>(null);
  const [previewRef, setPreviewRef] = useState<EReferral | null>(null);

  const patientName = `${visit.patientFirstName} ${visit.patientLastName}`;
  const doctorPwz = DOCTOR_PWZ[visit.doctorId] ?? "";
  const defaultIcd = visit.diagnoses[0]?.code ?? "";

  function openNewRx() {
    if (!roleCanIssue) {
      toast.error("Recepcja ma dostęp tylko do odczytu e-recept", {
        description: "Możesz ponownie wysłać SMS z podglądu dokumentu.",
      });
      return;
    }
    if (!canIssue) {
      toast.error(
        "e-Receptę wystawisz przy statusie „W trakcie” lub „Zakończona”"
      );
      return;
    }
    setEditRx(null);
    setRxFormOpen(true);
  }

  function openNewRef() {
    if (!roleCanIssue) {
      toast.error("Recepcja ma dostęp tylko do odczytu e-skierowań");
      return;
    }
    if (!canIssue) {
      toast.error(
        "e-Skierowanie wystawisz przy statusie „W trakcie” lub „Zakończona”"
      );
      return;
    }
    setEditRef(null);
    setRefFormOpen(true);
  }

  return (
    <div className="space-y-5" data-tour="visit-ehealth">
      {isReceptionReadOnly ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Tryb recepcji — tylko odczyt</p>
            <p className="text-xs text-amber-800/90">
              Możesz przeglądać e-recepty i e-skierowania oraz ponownie wysłać
              SMS (mock) do pacjenta. Wystawianie i edycja — tylko lekarz.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className={cn(
            "h-11 gap-1.5 transition-all",
            allowIssue
              ? "bg-brand text-white shadow-sm hover:bg-brand-deep hover:shadow"
              : "bg-slate-200 text-slate-500"
          )}
          disabled={!allowIssue}
          onClick={openNewRx}
        >
          <Pill className="size-4" />
          Wystaw e-receptę
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 gap-1.5 transition-all",
            allowIssue && "border-brand/30 text-brand-deep hover:bg-secondary"
          )}
          disabled={!allowIssue}
          onClick={openNewRef}
        >
          <ClipboardPlus className="size-4" />
          Wystaw e-skierowanie
        </Button>
        {!canIssue && roleCanIssue ? (
          <p className="w-full text-xs text-amber-700">
            Ustaw status wizyty na <strong>W trakcie</strong> lub{" "}
            <strong>Zakończona</strong>, aby wystawiać dokumenty e-zdrowia.
          </p>
        ) : (
          <p className="w-full text-[11px] text-muted-foreground">
            Mock P1/CeZ — PDF, szablony, audyt. Zero realnej integracji.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-heading">
          <Pill className="size-4 text-brand" />
          e-Recepty
          {rxList.length > 0 ? (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {rxList.length}
            </Badge>
          ) : null}
        </h3>
        {loading ? (
          <p className="animate-pulse text-sm text-muted-foreground">
            Ładowanie e-recept…
          </p>
        ) : rxList.length === 0 ? (
          <EmptyState
            title="Brak e-recept na wizycie"
            description={
              allowIssue
                ? "Użyj szablonu lub zaimportuj leki z zaleceń wizyty."
                : "Brak wystawionych e-recept."
            }
          />
        ) : (
          <ul className="divide-y rounded-xl border border-slate-200 bg-white shadow-sm">
            {rxList.map((rx) => (
              <li
                key={rx.id}
                className={cn(
                  "flex flex-col gap-2 px-3 py-3 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between",
                  rx.status === "cancelled" && "opacity-70"
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-brand">
                      {rx.number}
                    </span>
                    <StatusBadge status={rx.status} />
                    <span className="text-[11px] text-muted-foreground">
                      {E_PRESCRIPTION_KIND_LABELS[rx.kind]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-700">
                    {rx.items.map((i) => i.drugName).join(", ")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {format(parseISO(rx.issuedAt), "d MMM yyyy HH:mm", {
                      locale: pl,
                    })}{" "}
                    · kod {rx.accessCode}
                    {rx.smsSentAt ? " · SMS ✓" : ""}
                    {rx.auditLog?.length
                      ? ` · audyt ${rx.auditLog.length}`
                      : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => setPreviewRx(rx)}
                >
                  <Eye className="size-3.5" />
                  Podgląd
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-heading">
          <Send className="size-4 text-brand" />
          e-Skierowania
          {refList.length > 0 ? (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {refList.length}
            </Badge>
          ) : null}
        </h3>
        {loading ? null : refList.length === 0 ? (
          <EmptyState
            title="Brak e-skierowań na wizycie"
            description={
              allowIssue
                ? "Wystaw e-skierowanie przyciskiem powyżej."
                : "Brak wystawionych e-skierowań."
            }
          />
        ) : (
          <ul className="divide-y rounded-xl border border-slate-200 bg-white shadow-sm">
            {refList.map((r) => (
              <li
                key={r.id}
                className={cn(
                  "flex flex-col gap-2 px-3 py-3 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between",
                  r.status === "cancelled" && "opacity-70"
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-brand">
                      {r.number}
                    </span>
                    <StatusBadge status={r.status} />
                    {r.urgency === "urgent" ? (
                      <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-[10px] text-red-800"
                      >
                        {E_REFERRAL_URGENCY_LABELS.urgent}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium text-slate-800">
                    {r.examType}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.examCategory} ·{" "}
                    {format(parseISO(r.issuedAt), "d MMM yyyy HH:mm", {
                      locale: pl,
                    })}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 gap-1"
                  onClick={() => setPreviewRef(r)}
                >
                  <Eye className="size-3.5" />
                  Podgląd
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-heading">
          <FilePlus2 className="size-4 text-brand" />
          Załączniki / inne dokumenty
        </h3>
        <DocumentsPanel
          patientId={visit.patientId}
          visitId={visit.id}
          scope="visit"
        />
      </div>

      <EPrescriptionDialog
        open={rxFormOpen}
        onOpenChange={setRxFormOpen}
        patientName={patientName}
        patientPesel={visit.patientPesel}
        doctorName={visit.doctorName}
        doctorPwz={doctorPwz}
        initial={editRx}
        visitPrescriptions={visit.prescriptions ?? []}
        templates={templates}
        onSaveTemplate={
          roleCanIssue
            ? (input) => {
                createOrUpdateTemplate(input);
              }
            : undefined
        }
        onDeleteTemplate={
          roleCanIssue ? (id) => removeTemplate(id) : undefined
        }
        onSave={(data) => {
          if (editRx) {
            editPrescription(editRx.id, {
              kind: data.kind,
              items: data.items.map((it) => ({
                ...it,
                id: `epi-${crypto.randomUUID().slice(0, 8)}`,
              })),
              generalNotes: data.generalNotes,
            });
            toast.success("e-Recepta zaktualizowana");
          } else {
            const created = issuePrescription({
              visitId: visit.id,
              patientId: visit.patientId,
              patientName,
              patientPesel: visit.patientPesel,
              doctorId: visit.doctorId,
              doctorName: visit.doctorName,
              doctorPwz,
              kind: data.kind,
              items: data.items,
              generalNotes: data.generalNotes,
              templateName: data.templateName,
            });
            toast.success("e-Recepta wystawiona", {
              description: `Nr ${created.number} · kod ${created.accessCode}`,
            });
            setPreviewRx(created);
          }
          setRxFormOpen(false);
          setEditRx(null);
        }}
      />

      <EReferralDialog
        open={refFormOpen}
        onOpenChange={setRefFormOpen}
        patientName={patientName}
        patientPesel={visit.patientPesel}
        doctorName={visit.doctorName}
        doctorPwz={doctorPwz}
        defaultIcd={defaultIcd}
        initial={editRef}
        onSave={(data) => {
          if (editRef) {
            editReferral(editRef.id, data);
            toast.success("e-Skierowanie zaktualizowane");
          } else {
            const created = issueReferral({
              visitId: visit.id,
              patientId: visit.patientId,
              patientName,
              patientPesel: visit.patientPesel,
              doctorId: visit.doctorId,
              doctorName: visit.doctorName,
              doctorPwz,
              ...data,
            });
            toast.success("e-Skierowanie wystawione", {
              description: `Nr ${created.number} · kod ${created.accessCode}`,
            });
            setPreviewRef(created);
          }
          setRefFormOpen(false);
          setEditRef(null);
        }}
      />

      <EPrescriptionPreview
        rx={previewRx}
        open={!!previewRx}
        onOpenChange={(v) => {
          if (!v) setPreviewRx(null);
        }}
        onCancel={
          roleCanIssue
            ? (id, reason) => annulPrescription(id, reason)
            : undefined
        }
        onSms={canSms ? (id) => markSmsSent(id) : undefined}
        onEdit={
          roleCanIssue
            ? (rx) => {
                setEditRx(rx);
                setRxFormOpen(true);
              }
            : undefined
        }
        allowEdit={roleCanIssue}
        allowCancel={roleCanIssue}
        allowSms={canSms}
      />

      <EReferralPreview
        refDoc={previewRef}
        open={!!previewRef}
        onOpenChange={(v) => {
          if (!v) setPreviewRef(null);
        }}
        onCancel={
          roleCanIssue
            ? (id, reason) => annulReferral(id, reason)
            : undefined
        }
        onEdit={
          roleCanIssue
            ? (r) => {
                setEditRef(r);
                setRefFormOpen(true);
              }
            : undefined
        }
        allowEdit={roleCanIssue}
        allowCancel={roleCanIssue}
      />
    </div>
  );
}

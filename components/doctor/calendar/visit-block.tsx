"use client";

import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { STATUS_COLORS } from "@/lib/doctor/calendar-constants";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { maskPesel, type DoctorVisit, type VisitStatus } from "@/lib/doctor/types";
import { cn } from "@/lib/utils";

export function VisitBlock({
  visit,
  style,
  compact,
  onStatusChange,
  onDuplicate,
}: {
  visit: DoctorVisit;
  style?: CSSProperties;
  compact?: boolean;
  onStatusChange?: (id: string, status: VisitStatus) => void;
  onDuplicate?: (visit: DoctorVisit) => void;
}) {
  const router = useRouter();
  const { canEditVisit } = useDoctorData();
  const statusLocked =
    visit.status === "completed" || visit.status === "cancelled";
  const readOnly = !canEditVisit(visit);
  const locked = statusLocked || readOnly;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: visit.id,
      data: { visit },
      disabled: locked,
    });

  const colors = STATUS_COLORS[visit.status] ?? STATUS_COLORS.scheduled!;

  const dragStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 50 : undefined,
    borderLeftColor: colors.bar,
  };

  function openCard() {
    router.push(`/doctor/wizyty/${visit.id}`);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={dragStyle}
          {...listeners}
          {...attributes}
          onDoubleClick={(e) => {
            e.preventDefault();
            openCard();
          }}
          className={cn(
            "group absolute left-0.5 right-0.5 overflow-hidden rounded-md border border-l-4 px-1.5 py-0.5 text-left shadow-sm transition",
            colors.bg,
            colors.border,
            locked
              ? "cursor-default opacity-80"
              : "cursor-grab active:cursor-grabbing hover:shadow-md",
            isDragging && "ring-2 ring-brand/40"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-0">
                <div
                  className={cn(
                    "font-mono font-semibold text-slate-800",
                    compact ? "text-[10px]" : "text-xs"
                  )}
                >
                  {visit.time}
                  {!compact && (
                    <span className="ml-1 font-sans font-medium text-slate-700">
                      {visit.patientLastName} {visit.patientFirstName[0]}.
                    </span>
                  )}
                </div>
                {compact ? (
                  <div className="truncate text-[9px] font-medium text-slate-700">
                    {visit.patientLastName}
                  </div>
                ) : (
                  <div className="truncate text-[10px] text-slate-500">
                    {visit.doctorName.split(" ").slice(-1)[0]} ·{" "}
                    {colors.label}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs text-xs">
              <p className="font-semibold">
                {visit.patientFirstName} {visit.patientLastName}
              </p>
              <p className="text-muted-foreground">
                PESEL {maskPesel(visit.patientPesel)}
              </p>
              <p>
                {visit.date} {visit.time} · {colors.label}
              </p>
              <p className="text-muted-foreground">{visit.doctorName}</p>
              {visit.note ? (
                <p className="mt-1 border-t pt-1">{visit.note}</p>
              ) : null}
              {readOnly ? (
                <p className="mt-1 text-amber-600">
                  Podgląd udostępniony — bez edycji
                </p>
              ) : statusLocked ? (
                <p className="mt-1 text-amber-600">
                  Nieprzenoszalna (zakończona/odwołana)
                </p>
              ) : (
                <p className="mt-1 opacity-70">Przeciągnij · 2× klik = karta</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={openCard}>Otwórz kartę</ContextMenuItem>
        {!readOnly ? (
          <ContextMenuItem asChild>
            <Link href={`/doctor/wizyty/${visit.id}`}>Edytuj wizytę</Link>
          </ContextMenuItem>
        ) : null}
        {!readOnly ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                onStatusChange?.(visit.id, "confirmed");
                toast.success("Potwierdzono");
              }}
            >
              Status: Potwierdzona
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                onStatusChange?.(visit.id, "teleconfirmed");
                toast.success("Telepotwierdzona");
              }}
            >
              Status: Telepotwierdzona
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                onStatusChange?.(visit.id, "in_progress");
                toast.success("W trakcie");
              }}
            >
              Status: W trakcie
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                onStatusChange?.(visit.id, "completed");
                toast.success("Zakończona");
              }}
            >
              Status: Zakończona
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                onDuplicate?.(visit);
              }}
            >
              Duplikuj
            </ContextMenuItem>
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                onStatusChange?.(visit.id, "cancelled");
                toast.message("Wizyta odwołana");
              }}
            >
              Anuluj wizytę
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}

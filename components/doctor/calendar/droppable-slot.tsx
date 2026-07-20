"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { slotDropId } from "@/lib/doctor/calendar-constants";

export function DroppableSlot({
  date,
  time,
  doctorId,
  height,
  children,
  isAllowed,
  showLabel,
}: {
  date: string;
  time: string;
  doctorId?: string;
  height: number;
  children?: ReactNode;
  /** null = neutral, true = green, false = red */
  isAllowed?: boolean | null;
  showLabel?: boolean;
}) {
  const id = slotDropId(date, time, doctorId);
  const { setNodeRef, isOver } = useDroppable({ id, data: { date, time, doctorId } });

  return (
    <div
      ref={setNodeRef}
      style={{ height }}
      className={cn(
        "relative border-b border-slate-100 transition-colors",
        showLabel && "border-slate-100/80",
        isOver && isAllowed === true && "bg-emerald-100/80 ring-1 ring-inset ring-emerald-400",
        isOver && isAllowed === false && "bg-red-100/70 ring-1 ring-inset ring-red-400",
        isOver && isAllowed == null && "bg-secondary/60",
        !isOver && isAllowed === true && "bg-emerald-50/40",
        !isOver && isAllowed === false && "bg-red-50/30"
      )}
    >
      {showLabel ? (
        <span className="absolute top-0 left-1 z-[1] text-[9px] font-mono text-slate-400">
          {time}
        </span>
      ) : null}
      {children}
    </div>
  );
}

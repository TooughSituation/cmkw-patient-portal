"use client";

import { format, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";
import {
  buildTimeSlots,
  DAY_END_MIN,
  DAY_START_MIN,
  SLOT_STEP_MIN,
  timeToMinutes,
} from "@/lib/doctor/calendar-constants";
import type { DoctorVisit } from "@/lib/doctor/types";
import type { VisitStatus } from "@/lib/doctor/types";
import { DroppableSlot } from "@/components/doctor/calendar/droppable-slot";
import { VisitBlock } from "@/components/doctor/calendar/visit-block";
import { cn } from "@/lib/utils";

const PX_PER_MIN = 0.9;
const TOTAL_MIN = DAY_END_MIN - DAY_START_MIN;
const TOTAL_H = TOTAL_MIN * PX_PER_MIN;

export function WeekTimeline({
  days,
  visitsByDate,
  selected,
  onSelectDay,
  dragVisitId,
  allowedDropKeys,
  onStatusChange,
  onDuplicate,
}: {
  days: Date[];
  visitsByDate: (date: string) => DoctorVisit[];
  selected: Date;
  onSelectDay: (d: Date) => void;
  dragVisitId?: string | null;
  /** set of `date|time` allowed for current drag */
  allowedDropKeys?: Set<string> | null;
  onStatusChange?: (id: string, status: VisitStatus) => void;
  onDuplicate?: (visit: DoctorVisit) => void;
}) {
  const slots = buildTimeSlots();

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <div
        className="grid min-w-[900px]"
        style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}
      >
        <div className="sticky left-0 z-10 border-b border-r border-slate-100 bg-slate-50" />
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "border-b border-r border-slate-100 px-1 py-2 text-center transition hover:bg-secondary/50",
                isSameDay(day, selected) && "bg-secondary"
              )}
            >
              <div className="text-[10px] font-medium uppercase text-muted-foreground">
                {format(day, "EEE", { locale: pl })}
              </div>
              <div className="text-sm font-semibold text-brand-heading">
                {format(day, "d MMM", { locale: pl })}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {visitsByDate(key).length} wiz.
              </div>
            </button>
          );
        })}

        {/* body */}
        <div
          className="relative sticky left-0 z-10 border-r border-slate-100 bg-slate-50"
          style={{ height: TOTAL_H }}
        >
          {slots
            .filter((_, i) => i % 2 === 0)
            .map((t) => (
              <div
                key={t}
                className="absolute w-full pr-1 text-right text-[9px] font-mono text-slate-400"
                style={{
                  top: (timeToMinutes(t) - DAY_START_MIN) * PX_PER_MIN,
                }}
              >
                {t}
              </div>
            ))}
        </div>

        {days.map((day) => {
          const date = format(day, "yyyy-MM-dd");
          const dayVisits = visitsByDate(date);
          return (
            <div
              key={date}
              className="relative border-r border-slate-100"
              style={{ height: TOTAL_H }}
            >
              {slots.map((time) => {
                let isAllowed: boolean | null = null;
                if (dragVisitId && allowedDropKeys) {
                  isAllowed = allowedDropKeys.has(`${date}|${time}`);
                }
                return (
                  <DroppableSlot
                    key={time}
                    date={date}
                    time={time}
                    height={SLOT_STEP_MIN * PX_PER_MIN}
                    isAllowed={isAllowed}
                  />
                );
              })}
              {dayVisits.map((v) => {
                const start = timeToMinutes(v.time);
                if (start < DAY_START_MIN || start >= DAY_END_MIN) return null;
                const top = (start - DAY_START_MIN) * PX_PER_MIN + 1;
                const height = Math.max(SLOT_STEP_MIN * PX_PER_MIN - 2, 24);
                return (
                  <VisitBlock
                    key={v.id}
                    visit={v}
                    compact
                    style={{ top, height }}
                    onStatusChange={onStatusChange}
                    onDuplicate={onDuplicate}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

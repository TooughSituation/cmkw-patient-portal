"use client";

import { useMemo } from "react";
import {
  buildTimeSlots,
  DAY_END_MIN,
  DAY_START_MIN,
  SLOT_STEP_MIN,
  timeToMinutes,
} from "@/lib/doctor/calendar-constants";
import type { DoctorVisit } from "@/lib/doctor/types";
import { DroppableSlot } from "@/components/doctor/calendar/droppable-slot";
import { VisitBlock } from "@/components/doctor/calendar/visit-block";
import type { VisitStatus } from "@/lib/doctor/types";

const PX_PER_MIN = 1.2;
const TOTAL_MIN = DAY_END_MIN - DAY_START_MIN;
const TOTAL_H = TOTAL_MIN * PX_PER_MIN;

export function DayTimeline({
  date,
  visits,
  allowedTimes,
  dragVisitId,
  onStatusChange,
  onDuplicate,
}: {
  date: string;
  visits: DoctorVisit[];
  /** times currently allowed for active drag */
  allowedTimes?: Set<string> | null;
  dragVisitId?: string | null;
  onStatusChange?: (id: string, status: VisitStatus) => void;
  onDuplicate?: (visit: DoctorVisit) => void;
}) {
  const slots = useMemo(() => buildTimeSlots(), []);

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex">
        {/* time gutter */}
        <div
          className="w-14 shrink-0 border-r border-slate-100 bg-slate-50/80"
          style={{ height: TOTAL_H }}
        >
          {slots
            .filter((_, i) => i % 2 === 0)
            .map((t) => {
              const top =
                (timeToMinutes(t) - DAY_START_MIN) * PX_PER_MIN;
              return (
                <div
                  key={t}
                  className="absolute w-14 pr-1 text-right text-[10px] font-mono text-slate-400"
                  style={{ top }}
                >
                  {t}
                </div>
              );
            })}
        </div>

        <div className="relative min-w-0 flex-1" style={{ height: TOTAL_H }}>
          {slots.map((time) => {
            let isAllowed: boolean | null = null;
            if (dragVisitId && allowedTimes) {
              isAllowed = allowedTimes.has(time);
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

          {visits.map((v) => {
            const start = timeToMinutes(v.time);
            if (start < DAY_START_MIN || start >= DAY_END_MIN) return null;
            const top = (start - DAY_START_MIN) * PX_PER_MIN;
            const height = Math.max(SLOT_STEP_MIN * PX_PER_MIN - 2, 28);
            return (
              <VisitBlock
                key={v.id}
                visit={v}
                style={{ top: top + 1, height }}
                onStatusChange={onStatusChange}
                onDuplicate={onDuplicate}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Share2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import type { DoctorCalendarAccessMap } from "@/lib/doctor/calendar-access";
import { cn } from "@/lib/utils";

export function CalendarSharingPanel() {
  const {
    staff,
    calendarAccess,
    saveCalendarAccessData,
    resetCalendarAccessData,
    canManageSharing,
  } = useDoctorData();

  const doctors = useMemo(
    () =>
      staff.filter((s) => s.role === "doctor" && s.active && s.doctorId),
    [staff]
  );

  const [draft, setDraft] = useState<DoctorCalendarAccessMap | null>(null);
  const map = draft ?? calendarAccess;

  function toggle(viewerId: string, targetId: string, checked: boolean) {
    setDraft((prev) => {
      const base: DoctorCalendarAccessMap = {
        ...(prev ?? calendarAccess),
      };
      const current = new Set(base[viewerId] ?? []);
      if (checked) current.add(targetId);
      else current.delete(targetId);
      base[viewerId] = Array.from(current);
      return { ...base };
    });
  }

  function handleSave() {
    if (!canManageSharing) {
      toast.error("Brak uprawnień do zarządzania udostępnianiem.");
      return;
    }
    saveCalendarAccessData(map);
    setDraft(null);
    toast.success("Zapisano udostępnianie kalendarzy");
  }

  function handleReset() {
    resetCalendarAccessData();
    setDraft(null);
    toast.message("Przywrócono seed udostępnień (Wenta → Kiryluk)");
  }

  if (!canManageSharing) {
    return (
      <Card className="border-amber-100 bg-amber-50/50">
        <CardContent className="py-8 text-center text-sm text-amber-900">
          Tylko konto placówki lub administrator może zarządzać
          udostępnianiem kalendarzy.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-heading">
            <Share2 className="size-5 text-brand" />
            Udostępnianie kalendarzy
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Domyślnie każdy lekarz widzi wyłącznie swój kalendarz. Zaznacz,
            których kolegów może przeglądać dany lekarz. Edycja cudzych wizyt
            pozostaje zablokowana (tylko podgląd).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Seed demo
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-brand text-white hover:bg-brand-deep"
            onClick={handleSave}
            disabled={draft === null}
          >
            <Save className="mr-1.5 size-3.5" />
            Zapisz
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-brand-heading">
            Matryca uprawnień podglądu
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">
                  Lekarz (przeglądający)
                </TableHead>
                {doctors.map((d) => (
                  <TableHead
                    key={d.doctorId}
                    className="min-w-[100px] text-center text-xs"
                  >
                    {d.lastName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((viewer) => {
                const viewerId = viewer.doctorId!;
                return (
                  <TableRow key={viewerId}>
                    <TableCell className="font-medium">
                      {viewer.title} {viewer.firstName} {viewer.lastName}
                      <div className="text-[10px] text-muted-foreground">
                        {viewerId}
                      </div>
                    </TableCell>
                    {doctors.map((target) => {
                      const targetId = target.doctorId!;
                      const isSelf = viewerId === targetId;
                      const checked =
                        isSelf ||
                        (map[viewerId] ?? []).includes(targetId);
                      return (
                        <TableCell key={targetId} className="text-center">
                          {isSelf ? (
                            <span
                              className={cn(
                                "inline-flex size-5 items-center justify-center rounded bg-secondary text-[10px] font-bold text-brand"
                              )}
                              title="Własny kalendarz — zawsze"
                            >
                              ✓
                            </span>
                          ) : (
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) =>
                                toggle(viewerId, targetId, v === true)
                              }
                              aria-label={`${viewer.lastName} → ${target.lastName}`}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="mt-3 text-xs text-muted-foreground">
            Demo seed: <strong>Wenta</strong> widzi kalendarz{" "}
            <strong>Kiryluka</strong>. Po zmianach kliknij Zapisz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

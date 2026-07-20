"use client";

import { Building2, Eye, UserRound } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { roleLabel } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/**
 * - Facility/reception: badge + przełącznik „Wszyscy / lekarz”
 * - Klinicysta: tylko badge roli
 * - Klinicysta z udostępnieniami: osobny select „Mój kalendarz / Udostępnione…”
 */
export function ViewAsDoctorSwitcher({ className }: { className?: string }) {
  const {
    sessionRole,
    seesAllDoctors,
    isClinician,
    viewAsDoctorId,
    setViewAsDoctorId,
    allStaffDoctors,
    sharedStaffDoctors,
    sharedPreviewDoctorId,
    setSharedPreviewDoctorId,
  } = useDoctorData();

  if (!sessionRole) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Badge
        variant="outline"
        className={cn(
          "border-brand/30 bg-secondary font-semibold text-brand-deep",
          sessionRole === "facility" && "border-brand bg-brand text-white"
        )}
      >
        {sessionRole === "facility" ? (
          <Building2 className="mr-1 size-3" />
        ) : (
          <UserRound className="mr-1 size-3" />
        )}
        {sessionRole === "facility"
          ? "Widok placówki"
          : roleLabel(sessionRole)}
      </Badge>

      {seesAllDoctors ? (
        <Select
          value={viewAsDoctorId ?? "all"}
          onValueChange={(v) => setViewAsDoctorId(v === "all" ? null : v)}
        >
          <SelectTrigger className="h-8 w-[200px] border-slate-200 bg-white text-xs shadow-sm">
            <SelectValue placeholder="Wszyscy lekarze" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszyscy lekarze</SelectItem>
            {allStaffDoctors.map((d) => (
              <SelectItem
                key={d.doctorId ?? d.id}
                value={d.doctorId ?? d.id}
              >
                {d.title} {d.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {isClinician && sharedStaffDoctors.length > 0 ? (
        <Select
          value={sharedPreviewDoctorId ?? "own"}
          onValueChange={(v) =>
            setSharedPreviewDoctorId(v === "own" ? null : v)
          }
        >
          <SelectTrigger className="h-8 w-[220px] border-violet-200 bg-violet-50 text-xs text-violet-900 shadow-sm">
            <Eye className="mr-1 size-3 shrink-0 opacity-70" />
            <SelectValue placeholder="Kalendarz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="own">Mój kalendarz</SelectItem>
            {sharedStaffDoctors.map((d) => (
              <SelectItem
                key={d.doctorId ?? d.id}
                value={d.doctorId ?? d.id}
              >
                Udostępnione: {d.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {isClinician && sharedPreviewDoctorId ? (
        <Badge
          variant="outline"
          className="border-violet-200 bg-violet-50 text-[10px] font-medium text-violet-800"
        >
          Podgląd (bez edycji)
        </Badge>
      ) : null}
    </div>
  );
}

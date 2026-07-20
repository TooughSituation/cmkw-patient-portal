"use client";

import { Building2, UserRound } from "lucide-react";
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

/** Badge roli + dla placówki: filtr „jako lekarz” */
export function ViewAsDoctorSwitcher({ className }: { className?: string }) {
  const {
    sessionRole,
    seesAllDoctors,
    viewAsDoctorId,
    setViewAsDoctorId,
    staff,
  } = useDoctorData();

  const doctors = staff.filter((s) => s.role === "doctor" && s.active);

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
        {roleLabel(sessionRole)}
      </Badge>

      {seesAllDoctors ? (
        <Select
          value={viewAsDoctorId ?? "all"}
          onValueChange={(v) =>
            setViewAsDoctorId(v === "all" ? null : v)
          }
        >
          <SelectTrigger className="h-8 w-[200px] border-slate-200 bg-white text-xs">
            <SelectValue placeholder="Widok placówki" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cała placówka</SelectItem>
            {doctors.map((d) => (
              <SelectItem
                key={d.doctorId ?? d.id}
                value={d.doctorId ?? d.id}
              >
                {d.lastName} {d.firstName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}

"use client";

import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Pasek awatarów lekarzy — TYLKO widok placówki (facility / reception).
 * Indywidualny lekarz: całkowicie ukryty.
 */
export function DoctorSidebar({ className }: { className?: string }) {
  const {
    seesAllDoctors,
    allStaffDoctors,
    viewAsDoctorId,
    setViewAsDoctorId,
  } = useDoctorData();

  if (!seesAllDoctors) {
    return null;
  }

  const quickStaff = allStaffDoctors.slice(0, 10).map((d) => {
    const initials =
      `${d.firstName?.[0] ?? ""}${d.lastName?.[0] ?? ""}`.toUpperCase() ||
      "LK";
    return {
      id: d.doctorId ?? d.id,
      name: `${d.firstName} ${d.lastName}`,
      initials,
      title: d.title,
    };
  });

  return (
    <aside
      className={cn(
        "hidden w-14 shrink-0 flex-col items-center gap-2 border-l border-slate-200 bg-white py-3 xl:flex",
        className
      )}
      aria-label="Przełącznik lekarzy — widok placówki"
    >
      <button
        type="button"
        title="Wszyscy lekarze"
        onClick={() => {
          setViewAsDoctorId(null);
          toast.success("Widok: wszyscy lekarze");
        }}
        className={cn(
          "flex size-9 items-center justify-center rounded-full border transition",
          !viewAsDoctorId
            ? "border-brand bg-brand text-white shadow-sm"
            : "border-slate-200 bg-slate-50 text-brand hover:ring-2 hover:ring-brand/40"
        )}
      >
        <Building2 className="size-4" />
      </button>

      <div className="my-0.5 h-px w-8 bg-slate-200" />

      {quickStaff.map((s) => {
        const active = viewAsDoctorId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            title={`${s.title} ${s.name}`}
            onClick={() => {
              setViewAsDoctorId(s.id);
              toast.success(`Widok: ${s.title} ${s.name}`);
            }}
            className={cn(
              "rounded-full ring-offset-2 ring-offset-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              active
                ? "ring-2 ring-brand"
                : "hover:ring-2 hover:ring-brand/40"
            )}
          >
            <Avatar
              className={cn(
                "size-9 border",
                active ? "border-brand" : "border-slate-200"
              )}
            >
              <AvatarFallback
                className={cn(
                  "text-[11px] font-semibold",
                  active
                    ? "bg-brand text-white"
                    : "bg-secondary text-brand-deep"
                )}
              >
                {s.initials}
              </AvatarFallback>
            </Avatar>
          </button>
        );
      })}
    </aside>
  );
}

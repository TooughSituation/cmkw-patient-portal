"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DoctorSidebar({ className }: { className?: string }) {
  const { visibleStaffDoctors, setViewAsDoctorId, seesAllDoctors } =
    useDoctorData();

  const quickStaff = visibleStaffDoctors.slice(0, 8).map((d) => {
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
      aria-label="Szybki dostęp — personel"
    >
      {quickStaff.map((s) => (
        <button
          key={s.id}
          type="button"
          title={`${s.title} ${s.name}`}
          onClick={() => {
            if (seesAllDoctors) {
              setViewAsDoctorId(s.id);
              toast.success(`Widok: ${s.title} ${s.name}`);
            } else {
              toast.info(`${s.title} ${s.name}`, {
                description: "Kalendarz w Twoim zakresie widoczności",
              });
            }
          }}
          className="rounded-full ring-offset-2 ring-offset-white transition hover:ring-2 hover:ring-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Avatar className="size-9 border border-slate-200">
            <AvatarFallback className="bg-secondary text-[11px] font-semibold text-brand-deep">
              {s.initials}
            </AvatarFallback>
          </Avatar>
        </button>
      ))}
    </aside>
  );
}

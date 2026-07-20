"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { doctors } from "@/lib/booking/doctors";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const quickStaff = doctors.slice(0, 6).map((d) => {
  const parts = d.name.split(" ");
  const initials = parts
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return { id: d.id, name: d.name, initials, title: d.title };
});

export function DoctorSidebar({ className }: { className?: string }) {
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
          onClick={() =>
            toast.info(`${s.title} ${s.name}`, {
              description: "Filtr lekarza — wkrótce",
            })
          }
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

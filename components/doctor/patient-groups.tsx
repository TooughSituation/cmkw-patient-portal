import type { PatientGroup } from "@/lib/doctor/types";
import { cn } from "@/lib/utils";

const groupStyles: Record<PatientGroup, string> = {
  VIP: "bg-amber-100 text-amber-900",
  NFZ: "bg-blue-100 text-blue-900",
  Prywatny: "bg-violet-100 text-violet-900",
  Sport: "bg-orange-100 text-orange-900",
  Pooperacyjny: "bg-teal-100 text-teal-900",
  Nowy: "bg-emerald-100 text-emerald-900",
};

export function PatientGroups({
  groups,
  className,
}: {
  groups: PatientGroup[];
  className?: string;
}) {
  if (!groups.length) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {groups.map((g) => (
        <span
          key={g}
          className={cn(
            "inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight",
            groupStyles[g]
          )}
        >
          {g}
        </span>
      ))}
    </div>
  );
}

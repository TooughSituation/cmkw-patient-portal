"use client";

import { Building2, ChevronDown, Check } from "lucide-react";
import {
  ALL_BRANCHES_ID,
  CLINIC_BRANCHES,
  branchLabel,
} from "@/lib/doctor/branches";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";

const OPTIONS = [
  {
    id: ALL_BRANCHES_ID,
    shortName: "Wszystkie oddziały",
    name: "Widok zbiorczy wszystkich lokalizacji",
  },
  ...CLINIC_BRANCHES.map((b) => ({
    id: b.id,
    shortName: b.shortName,
    name: `${b.name} · ${b.address}, ${b.city}`,
  })),
];

export function DepartmentSwitcher({ className }: { className?: string }) {
  const { branchFilter, setBranchFilter } = useDoctorData();
  const current =
    OPTIONS.find((o) => o.id === branchFilter) ?? OPTIONS[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 max-w-[240px] gap-2 border-brand/20 bg-secondary/60 px-3 text-sm font-medium text-brand-heading shadow-sm hover:bg-secondary hover:text-brand",
            className
          )}
        >
          <Building2 className="size-4 shrink-0 text-brand" />
          <span className="hidden truncate sm:inline">{current.shortName}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>Oddział placówki</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((d) => (
          <DropdownMenuItem
            key={d.id}
            onClick={() => setBranchFilter(d.id)}
            className="flex items-start justify-between gap-2 py-2"
          >
            <span>
              <span className="block font-medium">{d.shortName}</span>
              <span className="text-xs text-muted-foreground">{d.name}</span>
            </span>
            {d.id === branchFilter ? (
              <Check className="mt-0.5 size-4 shrink-0 text-brand" />
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
          Aktywny filtr: {branchLabel(branchFilter)} — kalendarz, wizyty,
          pacjenci, terminy
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

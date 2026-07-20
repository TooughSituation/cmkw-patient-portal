"use client";

import { Building2, ChevronDown, Check } from "lucide-react";
import { departments } from "@/lib/doctor/departments";
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

export function DepartmentSwitcher({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const current =
    departments.find((d) => d.id === value) ?? departments[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 gap-2 border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 hover:bg-secondary hover:text-brand-heading",
            className
          )}
        >
          <Building2 className="size-4 text-brand" />
          <span className="hidden max-w-[160px] truncate sm:inline">
            {current.shortName}
          </span>
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Oddział / poradnia</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {departments.map((d) => (
          <DropdownMenuItem
            key={d.id}
            onClick={() => onChange(d.id)}
            className="flex items-center justify-between gap-2"
          >
            <span>
              <span className="block font-medium">{d.shortName}</span>
              <span className="text-xs text-muted-foreground">{d.name}</span>
            </span>
            {d.id === current.id ? (
              <Check className="size-4 text-brand" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import Link from "next/link";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  CheckCircle2,
  XCircle,
  Pill,
  BookMarked,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DoctorVisit, VisitStatus } from "@/lib/doctor/types";
import { toast } from "sonner";

export function VisitRowActions({
  visit,
  onStatusChange,
}: {
  visit: DoctorVisit;
  onStatusChange?: (id: string, status: VisitStatus) => void;
}) {
  const href = `/doctor/wizyty/${visit.id}`;

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        asChild
        variant="ghost"
        size="icon-sm"
        className="text-slate-500 hover:text-brand"
        aria-label="Podgląd karty"
      >
        <Link href={href}>
          <Eye className="size-3.5" />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon-sm"
        className="text-slate-500 hover:text-brand"
        aria-label="Edytuj kartę"
      >
        <Link href={href}>
          <Pencil className="size-3.5" />
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-slate-500"
            aria-label="Więcej akcji"
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={href}>Otwórz kartę wizyty</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              onStatusChange?.(visit.id, "confirmed");
              toast.success("Wizyta potwierdzona");
            }}
          >
            <CheckCircle2 className="size-4 text-sky-600" />
            Potwierdź
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onStatusChange?.(visit.id, "teleconfirmed");
              toast.success("Telepotwierdzona");
            }}
          >
            <Phone className="size-4 text-violet-600" />
            Telepotwierdź
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onStatusChange?.(visit.id, "in_progress");
              toast.success("Wizyta w trakcie");
            }}
          >
            <CheckCircle2 className="size-4 text-amber-600" />
            W trakcie
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onStatusChange?.(visit.id, "completed");
              toast.success("Wizyta zakończona");
            }}
          >
            <CheckCircle2 className="size-4 text-emerald-600" />
            Zakończ
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/doctor/leki">
              <Pill className="size-4" />
              Baza leków
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/doctor/icd10">
              <BookMarked className="size-4" />
              ICD-10
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              onStatusChange?.(visit.id, "cancelled");
              toast.message("Wizyta odwołana");
            }}
          >
            <XCircle className="size-4" />
            Odwołaj
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

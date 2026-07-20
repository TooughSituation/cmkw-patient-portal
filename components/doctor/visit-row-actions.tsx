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
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-slate-500 hover:text-[#0849b0]"
        onClick={() =>
          toast.info("Podgląd wizyty", {
            description: `${visit.patientFirstName} ${visit.patientLastName} · ${visit.date} ${visit.time}`,
          })
        }
        aria-label="Podgląd"
      >
        <Eye className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-slate-500 hover:text-[#0849b0]"
        onClick={() =>
          toast.info("Edycja wizyty — wkrótce (Etap 2)", {
            description: visit.id,
          })
        }
        aria-label="Edytuj"
      >
        <Pencil className="size-3.5" />
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
              Dodaj lek
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/doctor/icd10">
              <BookMarked className="size-4" />
              Dodaj kod ICD
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

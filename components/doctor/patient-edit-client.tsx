"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { PatientForm } from "@/components/doctor/patient-form";
import { EmptyState } from "@/components/doctor/empty-state";
import { Button } from "@/components/ui/button";
import { useDoctorPatients } from "@/hooks/use-doctor-patients";

export function PatientEditClient({ patientId }: { patientId: string }) {
  const { getById, loading } = useDoctorPatients();
  const patient = getById(patientId);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Ładowanie…</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <EmptyState title="Nie znaleziono pacjenta" />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/doctor/pacjenci">Wróć do listy</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-5">
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">
          <Link href="/doctor/pacjenci" className="text-brand hover:underline">
            Pacjenci
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            href={`/doctor/pacjenci/${patient.id}`}
            className="text-brand hover:underline"
          >
            {patient.lastName} {patient.firstName}
          </Link>
          <span className="mx-1.5">/</span>
          Edycja
        </p>
        <h1 className="mt-1 text-lg font-semibold text-brand-heading md:text-xl">
          Edytuj pacjenta
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pełny PESEL widoczny tylko w formularzu edycji.
        </p>
      </div>
      <PatientForm mode="edit" patientId={patient.id} initial={patient} />
    </div>
  );
}

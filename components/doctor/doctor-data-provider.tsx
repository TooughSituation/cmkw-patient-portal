"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createPatientRecord,
  loadPatientsFromLocalStorage,
  resetPatientsLocalStorage,
  savePatientsToLocalStorage,
  updatePatientRecord,
  type PatientInput,
} from "@/lib/doctor/patients-client";
import {
  loadVisitsFromLocalStorage,
  resetVisitsLocalStorage,
  saveVisitsToLocalStorage,
} from "@/lib/doctor/visits-client";
import type { DoctorPatient, DoctorVisit, VisitStatus } from "@/lib/doctor/types";

type DoctorDataContextValue = {
  patients: DoctorPatient[];
  patientsLoading: boolean;
  getPatientById: (id: string) => DoctorPatient | null;
  createPatient: (input: PatientInput) => DoctorPatient;
  updatePatient: (id: string, input: PatientInput) => DoctorPatient | null;
  removePatient: (id: string) => void;
  resetPatients: () => void;
  visits: DoctorVisit[];
  visitsLoading: boolean;
  updateVisitStatus: (id: string, status: VisitStatus) => DoctorVisit | null;
  addVisit: (visit: DoctorVisit) => DoctorVisit;
  resetVisits: () => void;
  visitsByDate: (date: string) => DoctorVisit[];
  datesWithVisits: Set<string>;
};

const DoctorDataContext = createContext<DoctorDataContextValue | null>(null);

export function DoctorDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(true);

  useEffect(() => {
    setPatients(loadPatientsFromLocalStorage());
    setVisits(loadVisitsFromLocalStorage());
    setPatientsLoading(false);
    setVisitsLoading(false);
  }, []);

  const persistPatients = useCallback((next: DoctorPatient[]) => {
    setPatients(next);
    savePatientsToLocalStorage(next);
  }, []);

  const persistVisits = useCallback((next: DoctorVisit[]) => {
    setVisits(next);
    saveVisitsToLocalStorage(next);
  }, []);

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id) ?? null,
    [patients]
  );

  const createPatient = useCallback(
    (input: PatientInput) => {
      const record = createPatientRecord(input, patients);
      persistPatients([record, ...patients]);
      return record;
    },
    [patients, persistPatients]
  );

  const updatePatient = useCallback(
    (id: string, input: PatientInput) => {
      const updated = updatePatientRecord(id, input, patients);
      if (!updated) return null;
      persistPatients(patients.map((p) => (p.id === id ? updated : p)));
      // sync denormalized visit fields
      persistVisits(
        visits.map((v) =>
          v.patientId === id
            ? {
                ...v,
                patientFirstName: updated.firstName,
                patientLastName: updated.lastName,
                patientPesel: updated.pesel,
                patientGroups: [...updated.groups],
                updatedAt: new Date().toISOString(),
              }
            : v
        )
      );
      return updated;
    },
    [patients, visits, persistPatients, persistVisits]
  );

  const removePatient = useCallback(
    (id: string) => {
      persistPatients(patients.filter((p) => p.id !== id));
    },
    [patients, persistPatients]
  );

  const resetPatients = useCallback(() => {
    setPatients(resetPatientsLocalStorage());
  }, []);

  const updateVisitStatus = useCallback(
    (id: string, status: VisitStatus) => {
      const next = visits.map((v) =>
        v.id === id
          ? { ...v, status, updatedAt: new Date().toISOString() }
          : v
      );
      persistVisits(next);
      return next.find((v) => v.id === id) ?? null;
    },
    [visits, persistVisits]
  );

  const addVisit = useCallback(
    (visit: DoctorVisit) => {
      persistVisits([visit, ...visits]);
      return visit;
    },
    [visits, persistVisits]
  );

  const resetVisits = useCallback(() => {
    setVisits(resetVisitsLocalStorage());
  }, []);

  const visitsByDate = useCallback(
    (date: string) =>
      visits
        .filter((v) => v.date === date)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [visits]
  );

  const datesWithVisits = useMemo(() => {
    return new Set(visits.map((v) => v.date));
  }, [visits]);

  const value = useMemo<DoctorDataContextValue>(
    () => ({
      patients,
      patientsLoading,
      getPatientById,
      createPatient,
      updatePatient,
      removePatient,
      resetPatients,
      visits,
      visitsLoading,
      updateVisitStatus,
      addVisit,
      resetVisits,
      visitsByDate,
      datesWithVisits,
    }),
    [
      patients,
      patientsLoading,
      getPatientById,
      createPatient,
      updatePatient,
      removePatient,
      resetPatients,
      visits,
      visitsLoading,
      updateVisitStatus,
      addVisit,
      resetVisits,
      visitsByDate,
      datesWithVisits,
    ]
  );

  return (
    <DoctorDataContext.Provider value={value}>
      {children}
    </DoctorDataContext.Provider>
  );
}

export function useDoctorData() {
  const ctx = useContext(DoctorDataContext);
  if (!ctx) {
    throw new Error("useDoctorData must be used within DoctorDataProvider");
  }
  return ctx;
}

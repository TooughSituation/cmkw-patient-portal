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
import {
  loadDocumentsFromLocalStorage,
  resetDocumentsLocalStorage,
  saveDocumentsToLocalStorage,
} from "@/lib/doctor/documents-client";
import type {
  DoctorDocument,
  DoctorPatient,
  DoctorVisit,
  VisitStatus,
} from "@/lib/doctor/types";

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
  getVisitById: (id: string) => DoctorVisit | null;
  updateVisitStatus: (id: string, status: VisitStatus) => DoctorVisit | null;
  updateVisit: (
    id: string,
    patch: Partial<DoctorVisit>
  ) => DoctorVisit | null;
  addVisit: (visit: DoctorVisit) => DoctorVisit;
  resetVisits: () => void;
  visitsByDate: (date: string) => DoctorVisit[];
  datesWithVisits: Set<string>;
  documents: DoctorDocument[];
  documentsLoading: boolean;
  addDocument: (doc: DoctorDocument) => DoctorDocument;
  removeDocument: (id: string) => void;
  documentsForPatient: (patientId: string) => DoctorDocument[];
  documentsForVisit: (visitId: string) => DoctorDocument[];
  resetDocuments: () => void;
};

const DoctorDataContext = createContext<DoctorDataContextValue | null>(null);

export function DoctorDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [documents, setDocuments] = useState<DoctorDocument[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  useEffect(() => {
    setPatients(loadPatientsFromLocalStorage());
    setVisits(loadVisitsFromLocalStorage());
    setDocuments(loadDocumentsFromLocalStorage());
    setPatientsLoading(false);
    setVisitsLoading(false);
    setDocumentsLoading(false);
  }, []);

  const persistPatients = useCallback((next: DoctorPatient[]) => {
    setPatients(next);
    savePatientsToLocalStorage(next);
  }, []);

  const persistVisits = useCallback((next: DoctorVisit[]) => {
    setVisits(next);
    saveVisitsToLocalStorage(next);
  }, []);

  const persistDocuments = useCallback((next: DoctorDocument[]) => {
    setDocuments(next);
    saveDocumentsToLocalStorage(next);
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

  const getVisitById = useCallback(
    (id: string) => visits.find((v) => v.id === id) ?? null,
    [visits]
  );

  const updateVisitStatus = useCallback(
    (id: string, status: VisitStatus) => {
      const next = visits.map((v) =>
        v.id === id
          ? {
              ...v,
              status,
              needsTeleconfirm:
                status === "teleconfirmed" ? false : v.needsTeleconfirm,
              updatedAt: new Date().toISOString(),
            }
          : v
      );
      persistVisits(next);
      return next.find((v) => v.id === id) ?? null;
    },
    [visits, persistVisits]
  );

  const updateVisit = useCallback(
    (id: string, patch: Partial<DoctorVisit>) => {
      const next = visits.map((v) =>
        v.id === id
          ? {
              ...v,
              ...patch,
              id: v.id,
              updatedAt: new Date().toISOString(),
            }
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

  const addDocument = useCallback(
    (doc: DoctorDocument) => {
      const next = [doc, ...documents];
      persistDocuments(next);
      if (doc.visitId) {
        persistVisits(
          visits.map((v) =>
            v.id === doc.visitId
              ? {
                  ...v,
                  documentIds: Array.from(
                    new Set([...(v.documentIds ?? []), doc.id])
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : v
          )
        );
      }
      return doc;
    },
    [documents, visits, persistDocuments, persistVisits]
  );

  const removeDocument = useCallback(
    (id: string) => {
      persistDocuments(documents.filter((d) => d.id !== id));
      persistVisits(
        visits.map((v) => ({
          ...v,
          documentIds: (v.documentIds ?? []).filter((x) => x !== id),
        }))
      );
    },
    [documents, visits, persistDocuments, persistVisits]
  );

  const documentsForPatient = useCallback(
    (patientId: string) =>
      documents
        .filter((d) => d.patientId === patientId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [documents]
  );

  const documentsForVisit = useCallback(
    (visitId: string) =>
      documents
        .filter((d) => d.visitId === visitId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [documents]
  );

  const resetDocuments = useCallback(() => {
    setDocuments(resetDocumentsLocalStorage());
  }, []);

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
      getVisitById,
      updateVisitStatus,
      updateVisit,
      addVisit,
      resetVisits,
      visitsByDate,
      datesWithVisits,
      documents,
      documentsLoading,
      addDocument,
      removeDocument,
      documentsForPatient,
      documentsForVisit,
      resetDocuments,
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
      getVisitById,
      updateVisitStatus,
      updateVisit,
      addVisit,
      resetVisits,
      visitsByDate,
      datesWithVisits,
      documents,
      documentsLoading,
      addDocument,
      removeDocument,
      documentsForPatient,
      documentsForVisit,
      resetDocuments,
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

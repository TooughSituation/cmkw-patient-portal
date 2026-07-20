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
import {
  loadFacility,
  loadRooms,
  loadSettings,
  loadStaff,
  loadVisitTypes,
  saveFacility,
  saveRooms,
  saveSettings,
  saveStaff,
  saveVisitTypes,
} from "@/lib/doctor/admin-client";
import {
  loadSchedulesFromLocalStorage,
  saveSchedulesToLocalStorage,
  resetSchedulesLocalStorage,
} from "@/lib/doctor/schedules-client";
import {
  ALL_BRANCHES_ID,
  BRANCH_STORAGE_KEY,
  isValidBranchFilter,
} from "@/lib/doctor/branches";
import type {
  AppSettings,
  FacilityData,
  Room,
  StaffMember,
  VisitTypeConfig,
} from "@/lib/doctor/admin-types";
import type { DoctorSchedule } from "@/lib/doctor/schedule-types";
import {
  findSchedule,
  isWithinSchedule,
  isVisitOccupying,
} from "@/lib/doctor/schedule-utils";
import type {
  DoctorDocument,
  DoctorPatient,
  DoctorVisit,
  VisitStatus,
} from "@/lib/doctor/types";

type DoctorDataContextValue = {
  /** Global branch filter: all | bialystok | hajnowka */
  branchFilter: string;
  setBranchFilter: (id: string) => void;
  patients: DoctorPatient[];
  patientsLoading: boolean;
  filteredPatients: DoctorPatient[];
  getPatientById: (id: string) => DoctorPatient | null;
  createPatient: (input: PatientInput) => DoctorPatient;
  updatePatient: (id: string, input: PatientInput) => DoctorPatient | null;
  removePatient: (id: string) => void;
  resetPatients: () => void;
  visits: DoctorVisit[];
  visitsLoading: boolean;
  filteredVisits: DoctorVisit[];
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
  // Admin
  facility: FacilityData | null;
  settings: AppSettings | null;
  staff: StaffMember[];
  rooms: Room[];
  visitTypes: VisitTypeConfig[];
  adminLoading: boolean;
  saveFacilityData: (data: FacilityData) => void;
  saveSettingsData: (data: AppSettings) => void;
  saveStaffData: (data: StaffMember[]) => void;
  saveRoomsData: (data: Room[]) => void;
  saveVisitTypesData: (data: VisitTypeConfig[]) => void;
  schedules: DoctorSchedule[];
  saveSchedulesData: (data: DoctorSchedule[]) => void;
  resetSchedules: () => void;
  validateVisitSlot: (input: {
    doctorId: string;
    branchId: string;
    date: string;
    time: string;
    excludeVisitId?: string;
  }) => { ok: boolean; reason?: string };
};

const DoctorDataContext = createContext<DoctorDataContextValue | null>(null);

export function DoctorDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [branchFilter, setBranchFilterState] = useState(ALL_BRANCHES_ID);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [documents, setDocuments] = useState<DoctorDocument[]>([]);
  const [facility, setFacility] = useState<FacilityData | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [visitTypes, setVisitTypes] = useState<VisitTypeConfig[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BRANCH_STORAGE_KEY);
      if (saved && isValidBranchFilter(saved)) setBranchFilterState(saved);
    } catch {
      // ignore
    }
    setPatients(loadPatientsFromLocalStorage());
    setVisits(loadVisitsFromLocalStorage());
    setDocuments(loadDocumentsFromLocalStorage());
    setFacility(loadFacility());
    setSettings(loadSettings());
    setStaff(loadStaff());
    setRooms(loadRooms());
    setVisitTypes(loadVisitTypes());
    setSchedules(loadSchedulesFromLocalStorage());
    setPatientsLoading(false);
    setVisitsLoading(false);
    setDocumentsLoading(false);
    setAdminLoading(false);
  }, []);

  const setBranchFilter = useCallback((id: string) => {
    if (!isValidBranchFilter(id)) return;
    setBranchFilterState(id);
    try {
      localStorage.setItem(BRANCH_STORAGE_KEY, id);
    } catch {
      // ignore
    }
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

  const filteredVisits = useMemo(() => {
    if (branchFilter === ALL_BRANCHES_ID) return visits;
    return visits.filter((v) => v.branchId === branchFilter);
  }, [visits, branchFilter]);

  const filteredPatients = useMemo(() => {
    if (branchFilter === ALL_BRANCHES_ID) return patients;
    const ids = new Set(
      visits
        .filter((v) => v.branchId === branchFilter)
        .map((v) => v.patientId)
    );
    return patients.filter(
      (p) => p.primaryBranchId === branchFilter || ids.has(p.id)
    );
  }, [patients, visits, branchFilter]);

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id) ?? null,
    [patients]
  );

  const createPatient = useCallback(
    (input: PatientInput) => {
      const withBranch: PatientInput = {
        ...input,
        primaryBranchId:
          input.primaryBranchId ??
          (branchFilter !== ALL_BRANCHES_ID ? branchFilter : "bialystok"),
      };
      const record = createPatientRecord(withBranch, patients);
      persistPatients([record, ...patients]);
      return record;
    },
    [patients, persistPatients, branchFilter]
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

  const validateVisitSlot = useCallback(
    (input: {
      doctorId: string;
      branchId: string;
      date: string;
      time: string;
      excludeVisitId?: string;
    }) => {
      const sch = findSchedule(schedules, input.doctorId, input.branchId);
      const within = isWithinSchedule(sch, input.date, input.time);
      if (!within.ok) return within;
      const occupied = isVisitOccupying(
        input.excludeVisitId
          ? visits.filter((v) => v.id !== input.excludeVisitId)
          : visits,
        input.doctorId,
        input.branchId,
        input.date,
        input.time
      );
      if (occupied) {
        return { ok: false, reason: "Termin jest już zajęty." };
      }
      return { ok: true };
    },
    [schedules, visits]
  );

  const addVisit = useCallback(
    (visit: DoctorVisit) => {
      const withBranch: DoctorVisit = {
        ...visit,
        branchId:
          visit.branchId ||
          (branchFilter !== ALL_BRANCHES_ID ? branchFilter : "bialystok"),
      };
      const check = validateVisitSlot({
        doctorId: withBranch.doctorId,
        branchId: withBranch.branchId,
        date: withBranch.date,
        time: withBranch.time,
      });
      if (!check.ok) {
        throw new Error(check.reason ?? "Termin poza grafikiem");
      }
      persistVisits([withBranch, ...visits]);
      return withBranch;
    },
    [visits, persistVisits, branchFilter, validateVisitSlot]
  );

  const resetVisits = useCallback(() => {
    setVisits(resetVisitsLocalStorage());
  }, []);

  const visitsByDate = useCallback(
    (date: string) =>
      filteredVisits
        .filter((v) => v.date === date)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [filteredVisits]
  );

  const datesWithVisits = useMemo(() => {
    return new Set(filteredVisits.map((v) => v.date));
  }, [filteredVisits]);

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

  const saveFacilityData = useCallback((data: FacilityData) => {
    setFacility(data);
    saveFacility(data);
  }, []);

  const saveSettingsData = useCallback((data: AppSettings) => {
    setSettings(data);
    saveSettings(data);
  }, []);

  const saveStaffData = useCallback((data: StaffMember[]) => {
    setStaff(data);
    saveStaff(data);
  }, []);

  const saveRoomsData = useCallback((data: Room[]) => {
    setRooms(data);
    saveRooms(data);
  }, []);

  const saveVisitTypesData = useCallback((data: VisitTypeConfig[]) => {
    setVisitTypes(data);
    saveVisitTypes(data);
  }, []);

  const saveSchedulesData = useCallback((data: DoctorSchedule[]) => {
    setSchedules(data);
    saveSchedulesToLocalStorage(data);
  }, []);

  const resetSchedules = useCallback(() => {
    setSchedules(resetSchedulesLocalStorage());
  }, []);

  const value = useMemo<DoctorDataContextValue>(
    () => ({
      branchFilter,
      setBranchFilter,
      patients,
      patientsLoading,
      filteredPatients,
      getPatientById,
      createPatient,
      updatePatient,
      removePatient,
      resetPatients,
      visits,
      visitsLoading,
      filteredVisits,
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
      facility,
      settings,
      staff,
      rooms,
      visitTypes,
      adminLoading,
      saveFacilityData,
      saveSettingsData,
      saveStaffData,
      saveRoomsData,
      saveVisitTypesData,
      schedules,
      saveSchedulesData,
      resetSchedules,
      validateVisitSlot,
    }),
    [
      branchFilter,
      setBranchFilter,
      patients,
      patientsLoading,
      filteredPatients,
      getPatientById,
      createPatient,
      updatePatient,
      removePatient,
      resetPatients,
      visits,
      visitsLoading,
      filteredVisits,
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
      facility,
      settings,
      staff,
      rooms,
      visitTypes,
      adminLoading,
      saveFacilityData,
      saveSettingsData,
      saveStaffData,
      saveRoomsData,
      saveVisitTypesData,
      schedules,
      saveSchedulesData,
      resetSchedules,
      validateVisitSlot,
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

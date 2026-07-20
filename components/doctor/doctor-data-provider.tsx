"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
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
  loadCalendarAccess,
  saveCalendarAccess,
  resetCalendarAccess,
} from "@/lib/doctor/calendar-access-client";
import {
  SHARED_PREVIEW_KEY,
  VIEW_AS_DOCTOR_KEY,
  canEditDoctorData,
  getSharedDoctorIds,
  resolveVisibleDoctorIds,
  type DoctorCalendarAccessMap,
} from "@/lib/doctor/calendar-access";
import {
  ALL_BRANCHES_ID,
  BRANCH_STORAGE_KEY,
  isValidBranchFilter,
} from "@/lib/doctor/branches";
import {
  canAccessFacilityAdmin,
  canManageCalendarSharing,
  canSeeAllDoctors,
  isIndividualClinician,
  type UserRole,
} from "@/lib/auth/roles";
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
  /** Rola zalogowanego użytkownika EDM */
  sessionRole: UserRole | undefined;
  /** doctorId ze staff (dla lekarzy) */
  ownDoctorId: string | undefined;
  /** facility / reception — multi-lekarz */
  seesAllDoctors: boolean;
  /** doctor lub admin z doctorId — izolacja do własnego kalendarza */
  isClinician: boolean;
  canAccessAdmin: boolean;
  canManageSharing: boolean;
  /** doctorId filtrujące dane w tej chwili lub "all" */
  visibleDoctorIds: string[] | "all";
  /** Udostępnione doctorId (uprawnienia z admina) */
  sharedDoctorIds: string[];
  /** Staff z udostępnionych kalendarzy (do selecta podglądu) */
  sharedStaffDoctors: StaffMember[];
  calendarAccess: DoctorCalendarAccessMap;
  saveCalendarAccessData: (map: DoctorCalendarAccessMap) => void;
  resetCalendarAccessData: () => void;
  /** Facility: filtr „jako lekarz” (null = wszyscy) */
  viewAsDoctorId: string | null;
  setViewAsDoctorId: (id: string | null) => void;
  /**
   * Klinicysta: podgląd udostępnionego kalendarza (null = własny).
   * Nigdy nie miesza wielu lekarzy w jednym widoku.
   */
  sharedPreviewDoctorId: string | null;
  setSharedPreviewDoctorId: (id: string | null) => void;
  canEditVisit: (visit: DoctorVisit) => boolean;
  canViewDoctor: (doctorId: string) => boolean;
  /**
   * Lista lekarzy w UI multi-wyboru:
   * - facility: wszyscy aktywni (ew. po viewAs)
   * - klinicysta: tylko własny profil staff
   */
  visibleStaffDoctors: StaffMember[];
  /** Wszyscy aktywni lekarze (tylko do UI facility / admin sharing) */
  allStaffDoctors: StaffMember[];
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
  /** Grafiki widocznych lekarzy */
  filteredSchedules: DoctorSchedule[];
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
  const { data: session, status: sessionStatus } = useSession();
  const sessionRole = session?.user?.role as UserRole | undefined;
  const ownDoctorId = session?.user?.doctorId;

  const [branchFilter, setBranchFilterState] = useState(ALL_BRANCHES_ID);
  const [viewAsDoctorId, setViewAsDoctorIdState] = useState<string | null>(
    null
  );
  const [sharedPreviewDoctorId, setSharedPreviewDoctorIdState] = useState<
    string | null
  >(null);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [documents, setDocuments] = useState<DoctorDocument[]>([]);
  const [facility, setFacility] = useState<FacilityData | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [visitTypes, setVisitTypes] = useState<VisitTypeConfig[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [calendarAccess, setCalendarAccess] =
    useState<DoctorCalendarAccessMap>({});
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BRANCH_STORAGE_KEY);
      if (saved && isValidBranchFilter(saved)) setBranchFilterState(saved);
      const viewAs = localStorage.getItem(VIEW_AS_DOCTOR_KEY);
      if (viewAs) setViewAsDoctorIdState(viewAs);
      const preview = localStorage.getItem(SHARED_PREVIEW_KEY);
      if (preview) setSharedPreviewDoctorIdState(preview);
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
    setCalendarAccess(loadCalendarAccess());
    setPatientsLoading(false);
    setVisitsLoading(false);
    setDocumentsLoading(false);
    setAdminLoading(false);
  }, []);

  const seesAllDoctors = canSeeAllDoctors(sessionRole, ownDoctorId);
  const isClinician = isIndividualClinician(sessionRole, ownDoctorId);
  const canAccessAdmin = canAccessFacilityAdmin(sessionRole);
  const canManageSharing = canManageCalendarSharing(sessionRole);

  const sharedDoctorIds = useMemo(
    () => getSharedDoctorIds(calendarAccess, ownDoctorId),
    [calendarAccess, ownDoctorId]
  );

  // Wyczyść nieaktualny podgląd udostępnienia
  useEffect(() => {
    if (!sharedPreviewDoctorId) return;
    if (!sharedDoctorIds.includes(sharedPreviewDoctorId)) {
      setSharedPreviewDoctorIdState(null);
      try {
        localStorage.removeItem(SHARED_PREVIEW_KEY);
      } catch {
        // ignore
      }
    }
  }, [sharedDoctorIds, sharedPreviewDoctorId]);

  const visibleDoctorIds = useMemo(
    () =>
      resolveVisibleDoctorIds({
        canSeeAll: seesAllDoctors,
        ownDoctorId,
        sharedIds: sharedDoctorIds,
        viewAsDoctorId: seesAllDoctors ? viewAsDoctorId : null,
        sharedPreviewDoctorId: isClinician ? sharedPreviewDoctorId : null,
      }),
    [
      seesAllDoctors,
      ownDoctorId,
      sharedDoctorIds,
      viewAsDoctorId,
      isClinician,
      sharedPreviewDoctorId,
    ]
  );

  const setBranchFilter = useCallback((id: string) => {
    if (!isValidBranchFilter(id)) return;
    setBranchFilterState(id);
    try {
      localStorage.setItem(BRANCH_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const setViewAsDoctorId = useCallback((id: string | null) => {
    setViewAsDoctorIdState(id);
    try {
      if (id) localStorage.setItem(VIEW_AS_DOCTOR_KEY, id);
      else localStorage.removeItem(VIEW_AS_DOCTOR_KEY);
    } catch {
      // ignore
    }
  }, []);

  const setSharedPreviewDoctorId = useCallback((id: string | null) => {
    setSharedPreviewDoctorIdState(id);
    try {
      if (id) localStorage.setItem(SHARED_PREVIEW_KEY, id);
      else localStorage.removeItem(SHARED_PREVIEW_KEY);
    } catch {
      // ignore
    }
  }, []);

  const canViewDoctor = useCallback(
    (doctorId: string) => {
      if (seesAllDoctors) return true;
      if (ownDoctorId && doctorId === ownDoctorId) return true;
      return sharedDoctorIds.includes(doctorId);
    },
    [seesAllDoctors, ownDoctorId, sharedDoctorIds]
  );

  const canEditVisit = useCallback(
    (visit: DoctorVisit) =>
      canEditDoctorData(
        { canSeeAll: seesAllDoctors, ownDoctorId },
        visit.doctorId
      ),
    [seesAllDoctors, ownDoctorId]
  );

  const allStaffDoctors = useMemo(
    () => staff.filter((s) => s.role === "doctor" && s.active),
    [staff]
  );

  const sharedStaffDoctors = useMemo(() => {
    if (!sharedDoctorIds.length) return [];
    const set = new Set(sharedDoctorIds);
    return allStaffDoctors.filter((d) => set.has(d.doctorId ?? d.id));
  }, [allStaffDoctors, sharedDoctorIds]);

  /** UI list — klinicysta: tylko siebie; facility: wszyscy */
  const visibleStaffDoctors = useMemo(() => {
    if (seesAllDoctors) {
      if (viewAsDoctorId) {
        return allStaffDoctors.filter(
          (d) => (d.doctorId ?? d.id) === viewAsDoctorId
        );
      }
      return allStaffDoctors;
    }
    if (!ownDoctorId) return [];
    return allStaffDoctors.filter((d) => (d.doctorId ?? d.id) === ownDoctorId);
  }, [seesAllDoctors, viewAsDoctorId, allStaffDoctors, ownDoctorId]);

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
    let list = visits;
    if (branchFilter !== ALL_BRANCHES_ID) {
      list = list.filter((v) => v.branchId === branchFilter);
    }
    if (visibleDoctorIds !== "all") {
      const set = new Set(visibleDoctorIds);
      list = list.filter((v) => set.has(v.doctorId));
    }
    return list;
  }, [visits, branchFilter, visibleDoctorIds]);

  const filteredPatients = useMemo(() => {
    const visitPatientIds = new Set(filteredVisits.map((v) => v.patientId));

    if (seesAllDoctors && !viewAsDoctorId) {
      if (branchFilter === ALL_BRANCHES_ID) return patients;
      return patients.filter(
        (p) =>
          p.primaryBranchId === branchFilter || visitPatientIds.has(p.id)
      );
    }

    // Lekarz (lub facility „jako lekarz”): tylko pacjenci powiązani z widocznymi wizytami
    return patients.filter((p) => visitPatientIds.has(p.id));
  }, [
    patients,
    filteredVisits,
    seesAllDoctors,
    viewAsDoctorId,
    branchFilter,
  ]);

  const filteredSchedules = useMemo(() => {
    if (visibleDoctorIds === "all") return schedules;
    const set = new Set(visibleDoctorIds);
    return schedules.filter(
      (s) => set.has(s.doctorId) || set.has(s.staffId)
    );
  }, [schedules, visibleDoctorIds]);

  const getPatientById = useCallback(
    (id: string) => {
      const p = patients.find((x) => x.id === id) ?? null;
      if (!p) return null;
      if (seesAllDoctors && !viewAsDoctorId) return p;
      if (filteredPatients.some((x) => x.id === id)) return p;
      return null;
    },
    [patients, filteredPatients, seesAllDoctors, viewAsDoctorId]
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
    (id: string) => {
      const v = visits.find((x) => x.id === id) ?? null;
      if (!v) return null;
      if (!canViewDoctor(v.doctorId)) return null;
      return v;
    },
    [visits, canViewDoctor]
  );

  const updateVisitStatus = useCallback(
    (id: string, status: VisitStatus) => {
      const current = visits.find((v) => v.id === id);
      if (!current) return null;
      if (
        !canEditDoctorData(
          { canSeeAll: seesAllDoctors, ownDoctorId },
          current.doctorId
        )
      ) {
        return null;
      }
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
    [visits, persistVisits, seesAllDoctors, ownDoctorId]
  );

  const updateVisit = useCallback(
    (id: string, patch: Partial<DoctorVisit>) => {
      const current = visits.find((v) => v.id === id);
      if (!current) return null;
      if (
        !canEditDoctorData(
          { canSeeAll: seesAllDoctors, ownDoctorId },
          current.doctorId
        )
      ) {
        return null;
      }
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
    [visits, persistVisits, seesAllDoctors, ownDoctorId]
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
      if (
        !canEditDoctorData(
          { canSeeAll: seesAllDoctors, ownDoctorId },
          visit.doctorId
        )
      ) {
        throw new Error(
          "Brak uprawnień do dodawania wizyt dla tego lekarza."
        );
      }
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
    [
      visits,
      persistVisits,
      branchFilter,
      validateVisitSlot,
      seesAllDoctors,
      ownDoctorId,
    ]
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

  const saveCalendarAccessData = useCallback(
    (map: DoctorCalendarAccessMap) => {
      setCalendarAccess(map);
      saveCalendarAccess(map);
    },
    []
  );

  const resetCalendarAccessData = useCallback(() => {
    setCalendarAccess(resetCalendarAccess());
  }, []);

  const value = useMemo<DoctorDataContextValue>(
    () => ({
      branchFilter,
      setBranchFilter,
      sessionRole,
      ownDoctorId,
      seesAllDoctors,
      isClinician,
      canAccessAdmin,
      canManageSharing,
      visibleDoctorIds,
      sharedDoctorIds,
      sharedStaffDoctors,
      calendarAccess,
      saveCalendarAccessData,
      resetCalendarAccessData,
      viewAsDoctorId,
      setViewAsDoctorId,
      sharedPreviewDoctorId,
      setSharedPreviewDoctorId,
      canEditVisit,
      canViewDoctor,
      visibleStaffDoctors,
      allStaffDoctors,
      patients,
      patientsLoading,
      filteredPatients,
      getPatientById,
      createPatient,
      updatePatient,
      removePatient,
      resetPatients,
      visits,
      visitsLoading:
        visitsLoading || sessionStatus === "loading",
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
      filteredSchedules,
      saveSchedulesData,
      resetSchedules,
      validateVisitSlot,
    }),
    [
      branchFilter,
      setBranchFilter,
      sessionRole,
      ownDoctorId,
      seesAllDoctors,
      isClinician,
      canAccessAdmin,
      canManageSharing,
      visibleDoctorIds,
      sharedDoctorIds,
      sharedStaffDoctors,
      calendarAccess,
      saveCalendarAccessData,
      resetCalendarAccessData,
      viewAsDoctorId,
      setViewAsDoctorId,
      sharedPreviewDoctorId,
      setSharedPreviewDoctorId,
      canEditVisit,
      canViewDoctor,
      visibleStaffDoctors,
      allStaffDoctors,
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
      sessionStatus,
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
      filteredSchedules,
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

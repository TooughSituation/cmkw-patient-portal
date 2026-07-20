import {
  SEED_FACILITY,
  SEED_ROOMS,
  SEED_SETTINGS,
  SEED_STAFF,
  SEED_VISIT_TYPES,
} from "@/lib/doctor/seed-admin";
import type {
  AppSettings,
  FacilityData,
  Room,
  StaffMember,
  VisitTypeConfig,
} from "@/lib/doctor/admin-types";

const KEYS = {
  facility: "cmkw-doctor-facility-v1",
  settings: "cmkw-doctor-settings-v1",
  staff: "cmkw-doctor-staff-v1",
  rooms: "cmkw-doctor-rooms-v1",
  visitTypes: "cmkw-doctor-visit-types-v1",
} as const;

function loadJson<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return structuredClone(seed);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return structuredClone(seed);
    }
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(seed);
  }
}

function saveJson<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadFacility(): FacilityData {
  return loadJson(KEYS.facility, SEED_FACILITY);
}
export function saveFacility(data: FacilityData): void {
  saveJson(KEYS.facility, data);
}

export function loadSettings(): AppSettings {
  return loadJson(KEYS.settings, SEED_SETTINGS);
}
export function saveSettings(data: AppSettings): void {
  saveJson(KEYS.settings, data);
}

export function loadStaff(): StaffMember[] {
  return loadJson(KEYS.staff, SEED_STAFF);
}
export function saveStaff(data: StaffMember[]): void {
  saveJson(KEYS.staff, data);
}

export function loadRooms(): Room[] {
  return loadJson(KEYS.rooms, SEED_ROOMS);
}
export function saveRooms(data: Room[]): void {
  saveJson(KEYS.rooms, data);
}

export function loadVisitTypes(): VisitTypeConfig[] {
  return loadJson(KEYS.visitTypes, SEED_VISIT_TYPES);
}
export function saveVisitTypes(data: VisitTypeConfig[]): void {
  saveJson(KEYS.visitTypes, data);
}

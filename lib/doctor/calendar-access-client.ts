"use client";

import {
  CALENDAR_ACCESS_STORAGE_KEY,
  SEED_CALENDAR_ACCESS,
  normalizeAccessMap,
  type DoctorCalendarAccessMap,
} from "@/lib/doctor/calendar-access";

export function loadCalendarAccess(): DoctorCalendarAccessMap {
  if (typeof window === "undefined") {
    return { ...SEED_CALENDAR_ACCESS };
  }
  try {
    const raw = localStorage.getItem(CALENDAR_ACCESS_STORAGE_KEY);
    if (!raw) {
      const seed = { ...SEED_CALENDAR_ACCESS };
      localStorage.setItem(
        CALENDAR_ACCESS_STORAGE_KEY,
        JSON.stringify(seed)
      );
      return seed;
    }
    return normalizeAccessMap(JSON.parse(raw));
  } catch {
    return { ...SEED_CALENDAR_ACCESS };
  }
}

export function saveCalendarAccess(map: DoctorCalendarAccessMap): void {
  const normalized = normalizeAccessMap(map);
  try {
    localStorage.setItem(
      CALENDAR_ACCESS_STORAGE_KEY,
      JSON.stringify(normalized)
    );
  } catch {
    // ignore
  }
}

export function resetCalendarAccess(): DoctorCalendarAccessMap {
  const seed = { ...SEED_CALENDAR_ACCESS };
  saveCalendarAccess(seed);
  return seed;
}

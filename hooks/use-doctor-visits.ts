"use client";

import { useDoctorData } from "@/components/doctor/doctor-data-provider";

/** Thin adapter — shared state via DoctorDataProvider. */
export function useDoctorVisits() {
  const {
    filteredVisits,
    visitsLoading,
    getVisitById,
    updateVisitStatus,
    updateVisit,
    addVisit,
    resetVisits,
    visitsByDate,
    datesWithVisits,
    visits,
  } = useDoctorData();

  return {
    /** Filtrowane wg oddziału */
    visits: filteredVisits,
    allVisits: visits,
    loading: visitsLoading,
    getById: getVisitById,
    updateStatus: updateVisitStatus,
    updateVisit,
    addVisit,
    reset: resetVisits,
    byDate: visitsByDate,
    datesWithVisits,
  };
}

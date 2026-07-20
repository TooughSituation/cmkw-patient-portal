"use client";

import { useDoctorData } from "@/components/doctor/doctor-data-provider";

/** Thin adapter — shared state via DoctorDataProvider. */
export function useDoctorVisits() {
  const {
    visits,
    visitsLoading,
    updateVisitStatus,
    addVisit,
    resetVisits,
    visitsByDate,
    datesWithVisits,
  } = useDoctorData();

  return {
    visits,
    loading: visitsLoading,
    updateStatus: updateVisitStatus,
    addVisit,
    reset: resetVisits,
    byDate: visitsByDate,
    datesWithVisits,
  };
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadVisitsFromLocalStorage,
  saveVisitsToLocalStorage,
  resetVisitsLocalStorage,
} from "@/lib/doctor/visits-client";
import type { DoctorVisit, VisitStatus } from "@/lib/doctor/types";

export function useDoctorVisits() {
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVisits(loadVisitsFromLocalStorage());
    setLoading(false);
  }, []);

  const persist = useCallback((next: DoctorVisit[]) => {
    setVisits(next);
    saveVisitsToLocalStorage(next);
  }, []);

  const updateStatus = useCallback(
    (id: string, status: VisitStatus) => {
      const next = visits.map((v) =>
        v.id === id
          ? { ...v, status, updatedAt: new Date().toISOString() }
          : v
      );
      persist(next);
      return next.find((v) => v.id === id) ?? null;
    },
    [visits, persist]
  );

  const reset = useCallback(() => {
    const seed = resetVisitsLocalStorage();
    setVisits(seed);
  }, []);

  const byDate = useCallback(
    (date: string) =>
      visits
        .filter((v) => v.date === date)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [visits]
  );

  const datesWithVisits = useMemo(() => {
    const set = new Set(visits.map((v) => v.date));
    return set;
  }, [visits]);

  return {
    visits,
    loading,
    updateStatus,
    reset,
    byDate,
    datesWithVisits,
    setVisits: persist,
  };
}

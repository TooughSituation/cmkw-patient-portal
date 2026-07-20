"use client";

import { useDoctorData } from "@/components/doctor/doctor-data-provider";

/** Thin adapter — shared state via DoctorDataProvider. */
export function useDoctorPatients() {
  const {
    patients,
    patientsLoading,
    getPatientById,
    createPatient,
    updatePatient,
    removePatient,
    resetPatients,
  } = useDoctorData();

  return {
    patients,
    loading: patientsLoading,
    getById: getPatientById,
    create: createPatient,
    update: updatePatient,
    remove: removePatient,
    reset: resetPatients,
  };
}

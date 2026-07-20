"use client";

import { useDoctorData } from "@/components/doctor/doctor-data-provider";

export function useDoctorDocuments() {
  const {
    documents,
    documentsLoading,
    addDocument,
    removeDocument,
    documentsForPatient,
    documentsForVisit,
    resetDocuments,
  } = useDoctorData();

  return {
    documents,
    loading: documentsLoading,
    add: addDocument,
    remove: removeDocument,
    forPatient: documentsForPatient,
    forVisit: documentsForVisit,
    reset: resetDocuments,
  };
}

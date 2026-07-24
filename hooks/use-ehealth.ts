"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelEPrescription,
  cancelEReferral,
  createEPrescription,
  createEReferral,
  EHEALTH_EVENT,
  EHEALTH_STORAGE_KEY,
  loadEHealthStore,
  saveEHealthStore,
  updateEPrescription,
  updateEReferral,
  type CreatePrescriptionInput,
  type CreateReferralInput,
} from "@/lib/doctor/ehealth-client";
import type {
  EHealthStore,
  EPrescription,
  EReferral,
} from "@/lib/doctor/ehealth-types";

export function useEHealth() {
  const [store, setStore] = useState<EHealthStore>({
    prescriptions: [],
    referrals: [],
  });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setStore(loadEHealthStore());
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    function onStorage(e: StorageEvent) {
      if (e.key === EHEALTH_STORAGE_KEY) reload();
    }
    function onCustom() {
      reload();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(EHEALTH_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EHEALTH_EVENT, onCustom);
    };
  }, [reload]);

  const persist = useCallback((next: EHealthStore) => {
    saveEHealthStore(next);
    setStore(next);
  }, []);

  const issuePrescription = useCallback(
    (input: CreatePrescriptionInput) => {
      const { store: next, prescription } = createEPrescription(
        loadEHealthStore(),
        input
      );
      persist(next);
      return prescription;
    },
    [persist]
  );

  const editPrescription = useCallback(
    (
      id: string,
      patch: Parameters<typeof updateEPrescription>[2]
    ) => {
      const { store: next, prescription } = updateEPrescription(
        loadEHealthStore(),
        id,
        patch
      );
      persist(next);
      return prescription;
    },
    [persist]
  );

  const annulPrescription = useCallback(
    (id: string, reason: string) => {
      const { store: next, prescription } = cancelEPrescription(
        loadEHealthStore(),
        id,
        reason
      );
      persist(next);
      return prescription;
    },
    [persist]
  );

  const markSmsSent = useCallback(
    (id: string) => {
      return editPrescription(id, {
        smsSentAt: new Date().toISOString(),
      });
    },
    [editPrescription]
  );

  const issueReferral = useCallback(
    (input: CreateReferralInput) => {
      const { store: next, referral } = createEReferral(
        loadEHealthStore(),
        input
      );
      persist(next);
      return referral;
    },
    [persist]
  );

  const editReferral = useCallback(
    (id: string, patch: Parameters<typeof updateEReferral>[2]) => {
      const { store: next, referral } = updateEReferral(
        loadEHealthStore(),
        id,
        patch
      );
      persist(next);
      return referral;
    },
    [persist]
  );

  const annulReferral = useCallback(
    (id: string, reason: string) => {
      const { store: next, referral } = cancelEReferral(
        loadEHealthStore(),
        id,
        reason
      );
      persist(next);
      return referral;
    },
    [persist]
  );

  const prescriptionsForVisit = useCallback(
    (visitId: string) =>
      store.prescriptions
        .filter((p) => p.visitId === visitId)
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [store.prescriptions]
  );

  const referralsForVisit = useCallback(
    (visitId: string) =>
      store.referrals
        .filter((r) => r.visitId === visitId)
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [store.referrals]
  );

  const prescriptionsForPatient = useCallback(
    (patientId: string) =>
      store.prescriptions
        .filter((p) => p.patientId === patientId)
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [store.prescriptions]
  );

  const referralsForPatient = useCallback(
    (patientId: string) =>
      store.referrals
        .filter((r) => r.patientId === patientId)
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [store.referrals]
  );

  const stats = useMemo(
    () => ({
      prescriptions: store.prescriptions.length,
      referrals: store.referrals.length,
      activeRx: store.prescriptions.filter((p) => p.status === "issued")
        .length,
      activeRef: store.referrals.filter((r) => r.status === "issued").length,
    }),
    [store]
  );

  return {
    loading,
    store,
    stats,
    issuePrescription,
    editPrescription,
    annulPrescription,
    markSmsSent,
    issueReferral,
    editReferral,
    annulReferral,
    prescriptionsForVisit,
    referralsForVisit,
    prescriptionsForPatient,
    referralsForPatient,
    allPrescriptions: store.prescriptions as EPrescription[],
    allReferrals: store.referrals as EReferral[],
  };
}

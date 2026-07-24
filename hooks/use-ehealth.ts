"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  cancelEPrescription,
  cancelEReferral,
  canIssueEHealthDocuments,
  canResendEHealthSms,
  createEPrescription,
  createEReferral,
  deleteTemplate,
  EHEALTH_EVENT,
  EHEALTH_STORAGE_KEY,
  loadEHealthStore,
  markPrescriptionSms,
  saveEHealthStore,
  saveTemplate,
  updateEPrescription,
  updateEReferral,
  type CreatePrescriptionInput,
  type CreateReferralInput,
  type EHealthActor,
} from "@/lib/doctor/ehealth-client";
import type {
  EHealthStore,
  EPrescription,
  EPrescriptionItem,
  EPrescriptionKind,
  EPrescriptionTemplate,
  EReferral,
} from "@/lib/doctor/ehealth-types";

export function useEHealth() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const actor: EHealthActor = useMemo(
    () => ({
      userId: session?.user?.id ?? "unknown",
      name: session?.user
        ? `${session.user.firstName} ${session.user.lastName}`
        : "Personel EDM",
      role: String(role ?? ""),
    }),
    [session, role]
  );

  const [store, setStore] = useState<EHealthStore>({
    prescriptions: [],
    referrals: [],
    templates: [],
  });
  const [loading, setLoading] = useState(true);

  const canIssue = canIssueEHealthDocuments(role);
  const canSms = canResendEHealthSms(role);

  const reload = useCallback(() => {
    setStore(loadEHealthStore());
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    function onStorage(e: StorageEvent) {
      if (e.key === EHEALTH_STORAGE_KEY || e.key === "cmkw-doctor-ehealth-v1")
        reload();
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
    (
      input: Omit<CreatePrescriptionInput, "actor"> & {
        templateName?: string;
      }
    ) => {
      const { store: next, prescription } = createEPrescription(
        loadEHealthStore(),
        { ...input, actor }
      );
      persist(next);
      return prescription;
    },
    [persist, actor]
  );

  const editPrescription = useCallback(
    (
      id: string,
      patch: Parameters<typeof updateEPrescription>[2],
      summary = "Zaktualizowano treść e-recepty"
    ) => {
      const { store: next, prescription } = updateEPrescription(
        loadEHealthStore(),
        id,
        patch,
        actor,
        summary
      );
      persist(next);
      return prescription;
    },
    [persist, actor]
  );

  const annulPrescription = useCallback(
    (id: string, reason: string) => {
      const { store: next, prescription } = cancelEPrescription(
        loadEHealthStore(),
        id,
        reason,
        actor
      );
      persist(next);
      return prescription;
    },
    [persist, actor]
  );

  const markSmsSent = useCallback(
    (id: string) => {
      const { store: next, prescription } = markPrescriptionSms(
        loadEHealthStore(),
        id,
        actor
      );
      persist(next);
      return prescription;
    },
    [persist, actor]
  );

  const issueReferral = useCallback(
    (input: Omit<CreateReferralInput, "actor">) => {
      const { store: next, referral } = createEReferral(loadEHealthStore(), {
        ...input,
        actor,
      });
      persist(next);
      return referral;
    },
    [persist, actor]
  );

  const editReferral = useCallback(
    (
      id: string,
      patch: Parameters<typeof updateEReferral>[2],
      summary = "Zaktualizowano e-skierowanie"
    ) => {
      const { store: next, referral } = updateEReferral(
        loadEHealthStore(),
        id,
        patch,
        actor,
        summary
      );
      persist(next);
      return referral;
    },
    [persist, actor]
  );

  const annulReferral = useCallback(
    (id: string, reason: string) => {
      const { store: next, referral } = cancelEReferral(
        loadEHealthStore(),
        id,
        reason,
        actor
      );
      persist(next);
      return referral;
    },
    [persist, actor]
  );

  const createOrUpdateTemplate = useCallback(
    (input: {
      name: string;
      description?: string;
      kind: EPrescriptionKind;
      items: Omit<EPrescriptionItem, "id">[];
      generalNotes?: string;
      id?: string;
    }) => {
      const { store: next, template } = saveTemplate(
        loadEHealthStore(),
        input
      );
      persist(next);
      return template;
    },
    [persist]
  );

  const removeTemplate = useCallback(
    (id: string) => {
      persist(deleteTemplate(loadEHealthStore(), id));
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
      templates: store.templates.length,
    }),
    [store]
  );

  return {
    loading,
    store,
    stats,
    actor,
    canIssue,
    canSms,
    templates: store.templates as EPrescriptionTemplate[],
    issuePrescription,
    editPrescription,
    annulPrescription,
    markSmsSent,
    issueReferral,
    editReferral,
    annulReferral,
    createOrUpdateTemplate,
    removeTemplate,
    prescriptionsForVisit,
    referralsForVisit,
    prescriptionsForPatient,
    referralsForPatient,
    allPrescriptions: store.prescriptions as EPrescription[],
    allReferrals: store.referrals as EReferral[],
  };
}

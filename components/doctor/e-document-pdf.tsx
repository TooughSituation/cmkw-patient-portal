"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import type { EPrescription, EReferral } from "@/lib/doctor/ehealth-types";
import {
  E_PRESCRIPTION_KIND_LABELS,
  E_REFERRAL_URGENCY_LABELS,
} from "@/lib/doctor/ehealth-types";

const brand = "#0849b0";
const brandDeep = "#2b2d81";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: brand,
    paddingBottom: 10,
    marginBottom: 14,
  },
  clinic: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: brandDeep,
  },
  clinicSub: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  docTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: brand,
    marginTop: 8,
  },
  number: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  label: { color: "#64748b", width: "32%" },
  value: { width: "66%", textAlign: "right" },
  section: { marginTop: 12 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: brand,
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  item: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
    backgroundColor: "#f8fafc",
  },
  itemTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 2 },
  muted: { color: "#64748b", fontSize: 8 },
  stamp: {
    marginTop: 28,
    borderWidth: 1.5,
    borderColor: brand,
    borderStyle: "dashed",
    padding: 12,
    width: "45%",
    alignSelf: "flex-end",
  },
  stampTitle: {
    fontSize: 8,
    color: brand,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#94a3b8",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
  },
  badge: {
    fontSize: 8,
    color: "#b91c1c",
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
});

function fmt(iso: string) {
  try {
    return format(parseISO(iso), "d MMMM yyyy, HH:mm", { locale: pl });
  } catch {
    return iso;
  }
}

function maskPeselPdf(pesel: string) {
  if (!pesel || pesel.length < 4) return "—";
  return `******${pesel.slice(-4)}`;
}

function PrescriptionPdfDoc({ rx }: { rx: EPrescription }) {
  return (
    <Document
      title={`e-Recepta ${rx.number}`}
      author="CMKW EDM (mock)"
      subject="e-Recepta mock P1"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.clinic}>Centrum Medyczne Kiryluk i Wenta</Text>
          <Text style={styles.clinicSub}>
            CMKW · Białystok / Hajnówka · Portal Lekarza EDM (dokument mock —
            nie jest dokumentem CeZ/P1)
          </Text>
          <Text style={styles.docTitle}>e-RECEPTA</Text>
          <Text style={styles.number}>{rx.number}</Text>
          <Text style={styles.muted}>
            Kod dostępu: {rx.accessCode} · {E_PRESCRIPTION_KIND_LABELS[rx.kind]}{" "}
            · {fmt(rx.issuedAt)}
          </Text>
          {rx.status === "cancelled" ? (
            <Text style={styles.badge}>ANULOWANA</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pacjent</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Imię i nazwisko</Text>
            <Text style={styles.value}>{rx.patientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PESEL</Text>
            <Text style={styles.value}>{maskPeselPdf(rx.patientPesel)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lekarz wystawiający</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Lekarz</Text>
            <Text style={styles.value}>{rx.doctorName}</Text>
          </View>
          {rx.doctorPwz ? (
            <View style={styles.row}>
              <Text style={styles.label}>PWZ</Text>
              <Text style={styles.value}>{rx.doctorPwz}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pozycje leków</Text>
          {rx.items.map((it, i) => (
            <View key={it.id} style={styles.item} wrap={false}>
              <Text style={styles.itemTitle}>
                {i + 1}. {it.drugName} {it.strength}
              </Text>
              <Text style={styles.muted}>
                {it.inn} · {it.form}
              </Text>
              <Text>Dawkowanie: {it.dosage}</Text>
              <Text>
                Ilość: {it.quantity} · Okres: {it.duration}
                {it.frequency ? ` · Częst.: ${it.frequency}` : ""}
              </Text>
              {it.notes ? <Text>Uwagi: {it.notes}</Text> : null}
            </View>
          ))}
        </View>

        {rx.generalNotes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uwagi ogólne</Text>
            <Text>{rx.generalNotes}</Text>
          </View>
        ) : null}

        <View style={styles.stamp}>
          <Text style={styles.stampTitle}>PIECZĄTKA / PODPIS (MOCK)</Text>
          <Text>{rx.doctorName}</Text>
          {rx.doctorPwz ? <Text>PWZ {rx.doctorPwz}</Text> : null}
          <Text style={styles.muted}>CMKW EDM · nieautoryzowane P1</Text>
        </View>

        <Text style={styles.footer}>
          Wygenerowano w CMKW Patient Portal (mock). Dokument nie stanowi
          oficjalnej e-recepty P1/CeZ. Nr {rx.number} · {fmt(rx.issuedAt)}
        </Text>
      </Page>
    </Document>
  );
}

function ReferralPdfDoc({ refDoc }: { refDoc: EReferral }) {
  return (
    <Document
      title={`e-Skierowanie ${refDoc.number}`}
      author="CMKW EDM (mock)"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.clinic}>Centrum Medyczne Kiryluk i Wenta</Text>
          <Text style={styles.clinicSub}>
            CMKW · e-Skierowanie (dokument mock — nie jest dokumentem CeZ/P1)
          </Text>
          <Text style={styles.docTitle}>e-SKIEROWANIE</Text>
          <Text style={styles.number}>{refDoc.number}</Text>
          <Text style={styles.muted}>
            Kod: {refDoc.accessCode} ·{" "}
            {E_REFERRAL_URGENCY_LABELS[refDoc.urgency]} · {fmt(refDoc.issuedAt)}
          </Text>
          {refDoc.status === "cancelled" ? (
            <Text style={styles.badge}>ANULOWANE</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pacjent</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Imię i nazwisko</Text>
            <Text style={styles.value}>{refDoc.patientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PESEL</Text>
            <Text style={styles.value}>
              {maskPeselPdf(refDoc.patientPesel)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kierujący</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Lekarz</Text>
            <Text style={styles.value}>{refDoc.doctorName}</Text>
          </View>
          {refDoc.doctorPwz ? (
            <View style={styles.row}>
              <Text style={styles.label}>PWZ</Text>
              <Text style={styles.value}>{refDoc.doctorPwz}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badanie / usługa</Text>
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{refDoc.examType}</Text>
            <Text>Kategoria: {refDoc.examCategory}</Text>
            <Text>
              Tryb: {E_REFERRAL_URGENCY_LABELS[refDoc.urgency]}
            </Text>
            {refDoc.targetFacility ? (
              <Text>Ośrodek: {refDoc.targetFacility}</Text>
            ) : null}
            {refDoc.icdCode ? <Text>ICD-10: {refDoc.icdCode}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uzasadnienie</Text>
          <Text>{refDoc.justification}</Text>
        </View>

        <View style={styles.stamp}>
          <Text style={styles.stampTitle}>PIECZĄTKA / PODPIS (MOCK)</Text>
          <Text>{refDoc.doctorName}</Text>
          {refDoc.doctorPwz ? <Text>PWZ {refDoc.doctorPwz}</Text> : null}
          <Text style={styles.muted}>CMKW EDM · nieautoryzowane P1</Text>
        </View>

        <Text style={styles.footer}>
          Wygenerowano w CMKW Patient Portal (mock). Nr {refDoc.number} ·{" "}
          {fmt(refDoc.issuedAt)}
        </Text>
      </Page>
    </Document>
  );
}

async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadPrescriptionPdf(rx: EPrescription) {
  const blob = await pdf(<PrescriptionPdfDoc rx={rx} />).toBlob();
  await downloadBlob(blob, `e-recepta-${rx.number}.pdf`);
}

export async function downloadReferralPdf(refDoc: EReferral) {
  const blob = await pdf(<ReferralPdfDoc refDoc={refDoc} />).toBlob();
  await downloadBlob(blob, `e-skierowanie-${refDoc.number}.pdf`);
}

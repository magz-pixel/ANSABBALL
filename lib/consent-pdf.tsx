import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  CONSENT_INTRO,
  CONSENT_SECTIONS,
  CONSENT_TITLE,
  CONSENT_VERSION,
  relationshipLabel,
} from "@/lib/consent-copy";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica", color: "#111" },
  brand: { fontSize: 14, fontWeight: "bold", color: "#001F3F", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#0066CC", marginBottom: 12 },
  meta: { fontSize: 8, color: "#444", marginBottom: 10, lineHeight: 1.4 },
  intro: { fontSize: 9, marginBottom: 10, lineHeight: 1.4 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#001F3F",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionBody: { fontSize: 8, lineHeight: 1.45, color: "#222" },
  signBlock: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  signRow: { fontSize: 8, marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#888",
    textAlign: "center",
  },
});

export interface ConsentPdfPayload {
  playerName: string;
  signerPrintedName: string;
  signerRelationship: "self" | "parent_guardian" | "other";
  signerRelationshipOther: string | null;
  signedAtISO: string;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function buildConsentPdfDocument(payload: ConsentPdfPayload) {
  const rel = relationshipLabel(
    payload.signerRelationship,
    payload.signerRelationshipOther
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>ANSA Basketball Academy</Text>
        <Text style={styles.subtitle}>{CONSENT_TITLE}</Text>
        <Text style={styles.meta}>
          Version: {CONSENT_VERSION}
          {"\n"}
          Participant: {payload.playerName}
          {"\n"}
          Signed: {formatDate(payload.signedAtISO)}
        </Text>
        <Text style={styles.intro}>{CONSENT_INTRO}</Text>
        {CONSENT_SECTIONS.map((s) => (
          <View key={s.id} wrap={false}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
        <View style={styles.signBlock}>
          <Text style={styles.signRow}>
            <Text style={{ fontWeight: "bold" }}>Signer (printed name): </Text>
            {payload.signerPrintedName}
          </Text>
          <Text style={styles.signRow}>
            <Text style={{ fontWeight: "bold" }}>Relationship to participant: </Text>
            {rel}
          </Text>
        </View>
        <Text style={styles.footer} fixed>
          ANSA Basketball Academy — participation consent · {CONSENT_VERSION}
        </Text>
      </Page>
    </Document>
  );
}

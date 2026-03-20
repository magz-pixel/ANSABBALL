import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PlayerReportPayload } from "@/lib/player-report-types";
import {
  EVALUATION_RUBRIC,
  RATING_SCALE_LABELS,
} from "@/lib/evaluation-rubric";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  brand: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#001F3F",
    marginBottom: 2,
  },
  docTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#001F3F",
    marginTop: 8,
    marginBottom: 4,
  },
  tagline: { fontSize: 8, color: "#0066CC", marginBottom: 10 },
  section: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 10,
    fontWeight: "bold",
    color: "#001F3F",
    borderBottomWidth: 1,
    borderBottomColor: "#0066CC",
    paddingBottom: 2,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 4,
  },
  label: { width: "34%", fontWeight: "bold", color: "#374151" },
  value: { width: "66%", color: "#111" },
  skillRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
  },
  skillName: { flex: 2, color: "#374151", fontSize: 8 },
  skillVal: { flex: 0.6, textAlign: "right", color: "#0066CC", fontWeight: "bold" },
  legend: {
    marginTop: 6,
    padding: 6,
    backgroundColor: "#f8fafc",
    fontSize: 7,
    color: "#444",
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#888",
    textAlign: "center",
  },
  meta: { fontSize: 7, color: "#555", marginBottom: 8 },
  catHeader: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: "bold",
    color: "#001F3F",
  },
});

function PlayerReportDoc({ data }: { data: PlayerReportPayload }) {
  const { player, evaluation } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>ANSA Basketball Academy</Text>
        <Text style={styles.tagline}>Nairobi, Kenya · Confidential</Text>
        <Text style={styles.docTitle}>Player performance evaluation</Text>
        <Text style={styles.meta}>
          Generated {data.generatedAtLabel}
        </Text>

        <Text style={styles.section}>Player</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{player.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Age / School</Text>
          <Text style={styles.value}>
            {player.age ?? "—"} · {player.school ?? "—"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Group / Position</Text>
          <Text style={styles.value}>
            {player.groupName ?? "—"} · {player.position ?? "—"}
          </Text>
        </View>

        {evaluation ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Evaluation date</Text>
              <Text style={styles.value}>{evaluation.evaluatedAt}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Evaluator</Text>
              <Text style={styles.value}>{evaluation.coachName ?? "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Grade / #</Text>
              <Text style={styles.value}>
                {evaluation.grade ?? "—"} · #{evaluation.jerseyNumber ?? "—"}
              </Text>
            </View>
            {(evaluation.dateOfBirth ||
              evaluation.heightCm != null ||
              evaluation.weightKg != null) && (
              <View style={styles.row}>
                <Text style={styles.label}>DOB / H / W</Text>
                <Text style={styles.value}>
                  {evaluation.dateOfBirth ?? "—"} ·{" "}
                  {evaluation.heightCm != null ? `${evaluation.heightCm} cm` : "—"} ·{" "}
                  {evaluation.weightKg != null ? `${evaluation.weightKg} kg` : "—"}
                </Text>
              </View>
            )}

            {evaluation.experienceSummary ? (
              <>
                <Text style={styles.section}>Experience with player</Text>
                <Text style={{ fontSize: 8, color: "#333", marginBottom: 6 }}>
                  {evaluation.experienceSummary}
                </Text>
              </>
            ) : null}

            <Text style={styles.section}>Rating scale (1–5)</Text>
            <View style={styles.legend}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Text key={n} style={{ marginBottom: 2 }}>
                  {n} = {RATING_SCALE_LABELS[n]}
                </Text>
              ))}
            </View>

            <Text style={styles.section}>Category averages</Text>
            {evaluation.categoryAverages.map((c) => (
              <View key={c.id} style={styles.skillRow}>
                <Text style={styles.skillName}>{c.label}</Text>
                <Text style={styles.skillVal}>{c.value.toFixed(1)}</Text>
              </View>
            ))}

            {evaluation.overallStrengths.length > 0 ? (
              <>
                <Text style={styles.section}>Overall strengths</Text>
                <Text style={{ fontSize: 8 }}>
                  {evaluation.overallStrengths.join(", ")}
                </Text>
              </>
            ) : null}
          </>
        ) : (
          <Text style={{ marginTop: 10, color: "#666", fontSize: 9 }}>
            {data.legacyNote ??
              "No formal evaluation on file yet. Ask your coach to submit an evaluation in the dashboard."}
          </Text>
        )}

        <Text style={styles.footer}>
          ANSA Basketball Academy · Staff & linked parents only
        </Text>
      </Page>

      {evaluation && evaluation.detailedLines.length > 0 ? (
        <Page size="A4" style={styles.page}>
          <Text style={styles.brand}>Detailed ratings (1–5)</Text>
          <Text style={styles.meta}>{player.name} · {evaluation.evaluatedAt}</Text>

          {EVALUATION_RUBRIC.map((cat) => {
            const lines = evaluation.detailedLines.filter(
              (l) => l.categoryLabel === cat.label
            );
            if (lines.length === 0) return null;
            return (
              <View key={cat.id} wrap={false}>
                <Text style={styles.catHeader}>{cat.label}</Text>
                {lines.map((l, i) => (
                  <View key={`${l.metricLabel}-${i}`} style={styles.skillRow}>
                    <Text style={styles.skillName}>{l.metricLabel}</Text>
                    <Text style={styles.skillVal}>{l.value}</Text>
                  </View>
                ))}
              </View>
            );
          })}

          {evaluation.commentsRecommendations ? (
            <>
              <Text style={[styles.section, { marginTop: 12 }]}>
                Comments / recommendations
              </Text>
              <Text style={{ fontSize: 8, color: "#333" }}>
                {evaluation.commentsRecommendations}
              </Text>
            </>
          ) : null}

          <Text style={styles.footer}>{data.generatedAtLabel}</Text>
        </Page>
      ) : null}

      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>Attendance</Text>
        <Text style={styles.meta}>Recent sessions</Text>
        {data.attendance.length === 0 ? (
          <Text style={{ color: "#666" }}>No attendance rows in range.</Text>
        ) : (
          data.attendance.map((a) => (
            <View key={a.session_date} style={styles.row}>
              <Text style={styles.label}>{a.session_date}</Text>
              <Text
                style={[
                  styles.value,
                  { color: a.present ? "#059669" : "#b91c1c" },
                ]}
              >
                {a.present ? "Present" : "Absent"}
              </Text>
            </View>
          ))
        )}
        <Text style={[styles.footer, { marginTop: 20 }]}>
          Questions? Contact ANSA staff · {data.generatedAtLabel}
        </Text>
      </Page>
    </Document>
  );
}

export function buildPlayerReportDocument(data: PlayerReportPayload) {
  return <PlayerReportDoc data={data} />;
}

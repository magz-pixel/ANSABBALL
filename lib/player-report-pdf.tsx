import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PlayerReportPayload } from "@/lib/player-report-types";
import { formatSkillLabel } from "@/lib/player-skills";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  brand: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001F3F",
    marginBottom: 2,
  },
  tagline: { fontSize: 9, color: "#0066CC", marginBottom: 16 },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#001F3F",
    marginBottom: 4,
  },
  meta: { fontSize: 8, color: "#555", marginBottom: 14 },
  section: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 11,
    fontWeight: "bold",
    color: "#001F3F",
    borderBottomWidth: 1,
    borderBottomColor: "#0066CC",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 5,
  },
  label: { width: "32%", fontWeight: "bold", color: "#374151" },
  value: { width: "68%", color: "#111" },
  skillRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
  },
  skillName: { flex: 2, color: "#374151" },
  skillVal: { flex: 1, textAlign: "right", color: "#0066CC", fontWeight: "bold" },
  logRow: {
    flexDirection: "column",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  logLine: { fontSize: 8, color: "#333" },
  logNotes: { fontSize: 8, color: "#555", marginTop: 2, fontStyle: "italic" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#888",
    textAlign: "center",
  },
  badge: {
    fontSize: 8,
    marginTop: 2,
    color: "#059669",
  },
});

function PlayerReportDoc({ data }: { data: PlayerReportPayload }) {
  const { player } = data;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>ANSA Basketball Academy</Text>
        <Text style={styles.tagline}>Player progress report · Nairobi, Kenya</Text>

        <Text style={styles.title}>{player.name}</Text>
        <Text style={styles.meta}>
          Generated {data.generatedAtLabel} · Confidential
        </Text>

        <Text style={styles.section}>Profile</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{player.age ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>School</Text>
          <Text style={styles.value}>{player.school ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{player.gender ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Position</Text>
          <Text style={styles.value}>{player.position ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Group</Text>
          <Text style={styles.value}>{player.groupName ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{player.status ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>{player.payment_status ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Joined</Text>
          <Text style={styles.value}>{player.join_date ?? "—"}</Text>
        </View>

        <Text style={styles.section}>Latest skill ratings (0–10)</Text>
        {data.skills.map((s) => (
          <View key={s.skill} style={styles.skillRow}>
            <Text style={styles.skillName}>{formatSkillLabel(s.skill)}</Text>
            <Text style={styles.skillVal}>{s.value}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          ANSA Basketball Academy · This report is for coaches, staff, and linked
          parents only.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>Progress log</Text>
        <Text style={styles.meta}>
          Recent entries (newest first) · {data.progressLogs.length} rows
        </Text>

        {data.progressLogs.length === 0 ? (
          <Text style={{ marginTop: 12, color: "#666" }}>
            No progress logs recorded yet.
          </Text>
        ) : (
          data.progressLogs.map((log, i) => (
            <View key={`${log.date}-${log.skill}-${i}`} style={styles.logRow}>
              <Text style={styles.logLine}>
                {log.date} · {formatSkillLabel(log.skill)} · {log.value}/10
              </Text>
              {log.coach_notes ? (
                <Text style={styles.logNotes}>{log.coach_notes}</Text>
              ) : null}
            </View>
          ))
        )}

        <Text style={[styles.section, { marginTop: 16 }]}>Recent attendance</Text>
        {data.attendance.length === 0 ? (
          <Text style={{ color: "#666" }}>No attendance records in range.</Text>
        ) : (
          data.attendance.map((a) => (
            <View key={a.session_date} style={styles.row}>
              <Text style={styles.label}>{a.session_date}</Text>
              <Text style={[styles.value, a.present ? styles.badge : { color: "#b91c1c" }]}>
                {a.present ? "Present" : "Absent"}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.footer}>
          Questions? Contact ANSA staff · {data.generatedAtLabel}
        </Text>
      </Page>
    </Document>
  );
}

export function buildPlayerReportDocument(data: PlayerReportPayload) {
  return <PlayerReportDoc data={data} />;
}

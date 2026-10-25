import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandHeader } from "../../../src/components/BrandHeader";
import { useWorkspace } from "../../../src/context/WorkspaceContext";
import { api, type AnalysisHistoryItem } from "../../../src/lib/api";
import { businessLabel, colors } from "../../../src/theme";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AnalysisScreen() {
  const { latestAnalysis } = useWorkspace();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    void api.analysis.list().then((items) => {
      if (mounted) setHistory(items);
    }).catch((cause: unknown) => {
      if (mounted) setError(cause instanceof Error ? cause.message : "No se pudo cargar el historial.");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [latestAnalysis?.id]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <BrandHeader eyebrow="Lectura del entorno" title="Análisis" />
      <ScrollView contentContainerStyle={styles.content}>
        {latestAnalysis ? (
          <View style={styles.featured}>
            <Text style={styles.kicker}>ANÁLISIS RECIENTE</Text>
            <Text style={styles.title}>{latestAnalysis.label || "Ubicación analizada"}</Text>
            <Text style={styles.meta}>
              {businessLabel(latestAnalysis.businessType)} · Radio {latestAnalysis.radiusMeters} m
            </Text>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>N/D</Text>
              <Text style={styles.scoreLabel}>Puntaje global no disponible</Text>
            </View>
            <Text style={styles.paragraph}>
              Se consultaron {latestAnalysis.competitors.length} competidores. No hay fuentes conectadas para
              afluencia peatonal, demografía o accesibilidad, por lo que no se genera una recomendación de
              viabilidad.
            </Text>
            <View style={styles.metricRow}>
              {latestAnalysis.metrics.map((metric) => (
                <View key={metric.name} style={styles.metric}>
                  <Text style={styles.metricName}>{metric.name}</Text>
                  <Text style={styles.metricValue}>{metric.value === null ? "N/D" : metric.value}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Competidores cercanos</Text>
            {latestAnalysis.competitors.length ? latestAnalysis.competitors.map((competitor) => (
              <View key={competitor.placeId} style={styles.competitor}>
                <View style={styles.competitorCopy}>
                  <Text numberOfLines={1} style={styles.competitorName}>{competitor.name}</Text>
                  <Text style={styles.competitorMeta}>{competitor.category} · {competitor.distanceMeters} m</Text>
                </View>
                <Text style={styles.rating}>{competitor.rating === null ? "—" : `★ ${competitor.rating}`}</Text>
              </View>
            )) : <Text style={styles.empty}>No se encontraron competidores en el radio consultado.</Text>}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyGlyph}>◫</Text>
            <Text style={styles.sectionTitle}>Aún no hay un análisis abierto</Text>
            <Text style={styles.paragraph}>Selecciona un punto en el mapa y ejecuta un análisis para ver resultados.</Text>
          </View>
        )}

        <Text style={styles.historyHeading}>Historial</Text>
        {loading ? <ActivityIndicator color={colors.teal} style={styles.spinner} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && history.length === 0 ? (
          <Text style={styles.empty}>Todavía no hay análisis guardados.</Text>
        ) : null}
        {history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyDot} />
            <View style={styles.historyCopy}>
              <Text style={styles.historyName}>{item.label || "Ubicación"}</Text>
              <Text style={styles.historyMeta}>
                {businessLabel(item.businessType)} · {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
              <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <Text style={styles.historyScore}>N/D</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, paddingTop: 7 },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  featured: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 17, backgroundColor: colors.white },
  kicker: { color: colors.teal, fontSize: 8, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 8 },
  meta: { color: colors.inkSoft, fontSize: 10, marginTop: 5 },
  scoreBox: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, marginTop: 14, padding: 12, backgroundColor: colors.mint },
  scoreValue: { color: colors.tealDeep, fontSize: 22, fontWeight: "900" },
  scoreLabel: { color: colors.inkSoft, fontSize: 10, fontWeight: "700" },
  paragraph: { color: colors.inkSoft, fontSize: 10, lineHeight: 16, marginTop: 12 },
  metricRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  metric: { flexGrow: 1, minWidth: "45%", borderRadius: 10, padding: 10, backgroundColor: "#f5f8f7" },
  metricName: { color: colors.muted, fontSize: 9 },
  metricValue: { color: colors.ink, fontSize: 13, fontWeight: "800", marginTop: 4 },
  sectionTitle: { color: colors.ink, fontSize: 12, fontWeight: "800", marginTop: 16, marginBottom: 5 },
  competitor: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#edf2f1" },
  competitorCopy: { flex: 1, paddingRight: 8 },
  competitorName: { color: colors.ink, fontSize: 10, fontWeight: "700" },
  competitorMeta: { color: colors.muted, fontSize: 9, marginTop: 3 },
  rating: { color: colors.amber, fontSize: 10, fontWeight: "700" },
  emptyCard: { alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 23, backgroundColor: colors.white },
  emptyGlyph: { color: colors.plum, fontSize: 34 },
  empty: { color: colors.muted, fontSize: 10, lineHeight: 16, paddingVertical: 10 },
  historyHeading: { color: colors.ink, fontSize: 13, fontWeight: "800", marginTop: 21, marginBottom: 9 },
  spinner: { marginVertical: 15 },
  error: { color: colors.danger, fontSize: 10, paddingVertical: 8 },
  historyItem: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 12, marginBottom: 8, backgroundColor: colors.white },
  historyDot: { width: 8, height: 8, borderRadius: 5, backgroundColor: colors.teal },
  historyCopy: { flex: 1 },
  historyName: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  historyMeta: { color: colors.inkSoft, fontSize: 9, marginTop: 3 },
  historyDate: { color: colors.muted, fontSize: 8, marginTop: 3 },
  historyScore: { color: colors.muted, fontSize: 10, fontWeight: "800" },
});

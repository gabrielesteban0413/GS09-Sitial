import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandHeader } from "../../../src/components/BrandHeader";
import { useWorkspace } from "../../../src/context/WorkspaceContext";
import { api, type LocationPin } from "../../../src/lib/api";
import { colors } from "../../../src/theme";

const LAYER_COLORS = ["#318b8e", "#7d3865", "#4e7655", "#c28a39", "#4868a0"];

export default function LayersScreen() {
  const { layers, activeLayerId, setActiveLayerId, refreshLayers, layerError } = useWorkspace();
  const activeLayer = layers.find((layer) => layer.id === activeLayerId) ?? null;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(LAYER_COLORS[0]);
  const [pins, setPins] = useState<LocationPin[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!activeLayerId) return;
    void api.layers.locations(activeLayerId).then((items) => {
      if (mounted) setPins(items);
    }).catch((cause: unknown) => {
      if (mounted) setError(cause instanceof Error ? cause.message : "No se pudieron cargar las ubicaciones.");
    });
    return () => {
      mounted = false;
    };
  }, [activeLayerId]);

  async function createLayer() {
    const layerName = name.trim();
    if (!layerName) return;
    setBusy(true);
    setError("");
    try {
      const created = await api.layers.create({
        name: layerName,
        description: description.trim() || undefined,
        color,
      });
      await refreshLayers();
      setActiveLayerId(created.id);
      setName("");
      setDescription("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear la capa.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteLayer(layerId: string, layerName: string) {
    setBusy(true);
    setError("");
    try {
      await api.layers.remove(layerId);
      const updated = await refreshLayers();
      if (updated[0]) setActiveLayerId(updated[0].id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `No se pudo eliminar "${layerName}".`);
    } finally {
      setBusy(false);
    }
  }

  function confirmDeleteLayer(layerId: string, layerName: string) {
    Alert.alert(
      "Eliminar capa",
      `Se eliminará "${layerName}" y sus ubicaciones guardadas.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => void deleteLayer(layerId, layerName) },
      ],
    );
  }

  async function deletePin(pin: LocationPin) {
    setError("");
    try {
      await api.layers.removeLocation(pin.id);
      setPins((current) => current.filter((item) => item.id !== pin.id));
      await refreshLayers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar la ubicación.");
    }
  }

  function confirmDeletePin(pin: LocationPin) {
    Alert.alert("Quitar ubicación", `¿Quitar "${pin.name}" de esta capa?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Quitar", style: "destructive", onPress: () => void deletePin(pin) },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <BrandHeader eyebrow="Proyectos y sitios" title="Capas" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.createCard}>
          <Text style={styles.cardTitle}>Nueva capa</Text>
          <Text style={styles.cardNote}>Organiza ubicaciones por proyecto, zona o tipo de negocio.</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName}
            placeholder="Nombre del proyecto" placeholderTextColor={colors.muted} maxLength={80} />
          <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription}
            placeholder="Descripción (opcional)" placeholderTextColor={colors.muted} maxLength={500} multiline />
          <View style={styles.colorRow}>
            {LAYER_COLORS.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityState={{ selected: color === item }}
                onPress={() => setColor(item)}
                style={[styles.colorChoice, { backgroundColor: item }, color === item && styles.colorSelected]}
              />
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.createButton, pressed && styles.pressed, (busy || !name.trim()) && styles.disabled]}
            onPress={() => void createLayer()}
            disabled={busy || !name.trim()}
          >
            {busy ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.createText}>Crear capa</Text>}
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Tus proyectos · {layers.length}</Text>
        {layerError ? <Text style={styles.error}>{layerError}</Text> : null}
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        {layers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyMark}>▤</Text>
            <Text style={styles.emptyTitle}>Todavía no hay capas</Text>
            <Text style={styles.cardNote}>Crea una capa y luego guarda puntos desde el mapa.</Text>
          </View>
        ) : layers.map((layer) => (
          <Pressable
            key={layer.id}
            onPress={() => setActiveLayerId(layer.id)}
            style={[styles.layerCard, activeLayerId === layer.id && styles.layerCardActive]}
          >
            <View style={[styles.layerColor, { backgroundColor: layer.color }]} />
            <View style={styles.layerCopy}>
              <Text style={styles.layerName}>{layer.name}</Text>
              <Text style={styles.layerMeta}>{layer._count.locations} ubicaciones{layer.description ? ` · ${layer.description}` : ""}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Eliminar ${layer.name}`}
              hitSlop={8}
              onPress={() => confirmDeleteLayer(layer.id, layer.name)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>×</Text>
            </Pressable>
          </Pressable>
        ))}

        {activeLayer ? (
          <>
            <Text style={styles.sectionTitle}>Ubicaciones en {activeLayer.name}</Text>
            {pins.length === 0 ? (
              <Text style={styles.cardNote}>Todavía no hay puntos guardados en esta capa.</Text>
            ) : pins.map((pin) => (
              <View key={pin.id} style={styles.pinCard}>
                <View style={styles.pinCopy}>
                  <Text style={styles.pinName}>{pin.name}</Text>
                  <Text style={styles.pinMeta}>{pin.address || pin.category}</Text>
                  <Text style={styles.pinCoordinates}>{pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Quitar ${pin.name}`}
                  onPress={() => confirmDeletePin(pin)} style={styles.removePin}>
                  <Text style={styles.removePinText}>Quitar</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, paddingTop: 7 },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  createCard: { padding: 16, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  cardTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  cardNote: { color: colors.inkSoft, fontSize: 10, lineHeight: 15, marginTop: 5, marginBottom: 12 },
  input: { height: 43, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, color: colors.ink, fontSize: 11, marginTop: 8 },
  multiline: { height: 59, paddingTop: 11, textAlignVertical: "top" },
  colorRow: { flexDirection: "row", gap: 11, alignItems: "center", marginTop: 13, marginBottom: 15 },
  colorChoice: { width: 23, height: 23, borderRadius: 12, borderWidth: 1, borderColor: "rgba(21,56,59,0.1)" },
  colorSelected: { borderWidth: 3, borderColor: colors.ink },
  createButton: { minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: colors.tealDeep },
  createText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.5 },
  sectionTitle: { color: colors.ink, fontSize: 13, fontWeight: "800", marginTop: 20, marginBottom: 9 },
  error: { color: colors.danger, backgroundColor: "#fff0f1", borderRadius: 8, padding: 9, fontSize: 10, marginBottom: 8 },
  emptyCard: { alignItems: "center", padding: 20, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.white },
  emptyMark: { color: colors.plum, fontSize: 28 },
  emptyTitle: { color: colors.ink, fontSize: 12, fontWeight: "800", marginTop: 8 },
  layerCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.white, marginBottom: 8 },
  layerCardActive: { borderColor: colors.teal, backgroundColor: "#f1f8f7" },
  layerColor: { width: 10, height: 34, borderRadius: 5 },
  layerCopy: { flex: 1 },
  layerName: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  layerMeta: { color: colors.muted, fontSize: 9, marginTop: 4 },
  deleteButton: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#fff0f1" },
  deleteText: { color: colors.danger, fontSize: 20, lineHeight: 23 },
  pinCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, marginBottom: 7 },
  pinCopy: { flex: 1 },
  pinName: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  pinMeta: { color: colors.inkSoft, fontSize: 9, marginTop: 3 },
  pinCoordinates: { color: colors.muted, fontSize: 8, marginTop: 3 },
  removePin: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: colors.plumSoft },
  removePinText: { color: colors.plum, fontSize: 9, fontWeight: "800" },
});

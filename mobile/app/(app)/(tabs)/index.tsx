import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandHeader } from "../../../src/components/BrandHeader";
import { PulseDot } from "../../../src/components/GeoMotion";
import { useWorkspace } from "../../../src/context/WorkspaceContext";
import { api, type Competitor, type Coordinates, type LocationPin } from "../../../src/lib/api";
import { businessTypes, colors, type BusinessType } from "../../../src/theme";

const INITIAL_COORDINATES: Coordinates = { lat: 4.6768, lng: -74.0483 };
const RADIUS_METERS = 800;
const DEFAULT_REGION: Region = {
  latitude: INITIAL_COORDINATES.lat,
  longitude: INITIAL_COORDINATES.lng,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035,
};

const layerCategory: Record<BusinessType, LocationPin["category"]> = {
  cafe: "cafeteria",
  restaurant: "restaurante",
  bakery: "panaderia",
  pharmacy: "farmacia",
  gym: "gimnasio",
  supermarket: "supermercado",
};

function coordinatesLabel(coordinates: Coordinates): string {
  return `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`;
}

function competitorColor(competitor: Competitor): string {
  if (competitor.threatLevel === "high") return colors.plum;
  if (competitor.threatLevel === "medium") return colors.amber;
  return colors.teal;
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { layers, activeLayerId, setActiveLayerId, refreshLayers, setLatestAnalysis } = useWorkspace();
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [businessType, setBusinessType] = useState<BusinessType>("cafe");
  const [siteName, setSiteName] = useState("");
  const [query, setQuery] = useState("");
  const [address, setAddress] = useState("");
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof api.analysis.create>> | null>(null);
  const [pins, setPins] = useState<LocationPin[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [error, setError] = useState("");
  const [pinError, setPinError] = useState("");

  const activeLayer = useMemo(
    () => layers.find((layer) => layer.id === activeLayerId) ?? null,
    [layers, activeLayerId],
  );

  useEffect(() => {
    if (!activeLayerId) return;
    let mounted = true;
    void api.layers.locations(activeLayerId).then((nextPins) => {
      if (!mounted) return;
      setPins(nextPins);
      setPinError("");
    }).catch((cause: unknown) => {
      if (mounted) setPinError(cause instanceof Error ? cause.message : "No se pudieron cargar las ubicaciones de la capa.");
    });
    return () => {
      mounted = false;
    };
  }, [activeLayerId]);

  function selectCoordinates(next: Coordinates) {
    setCoordinates(next);
    setSiteName(`Ubicación ${coordinatesLabel(next)}`);
    setAddress("");
    setAnalysis(null);
    setLatestAnalysis(null);
    setError("");
  }

  async function searchAddress() {
    const value = query.trim();
    if (!value) return;
    setSearchBusy(true);
    setError("");
    try {
      const result = await api.places.geocode(value);
      selectCoordinates(result.coordinates);
      setAddress(result.formattedAddress);
      mapRef.current?.animateToRegion({
        latitude: result.coordinates.lat,
        longitude: result.coordinates.lng,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }, 550);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo buscar esa dirección.");
    } finally {
      setSearchBusy(false);
    }
  }

  async function analyzeLocation() {
    if (!coordinates) {
      setError("Selecciona primero un punto en el mapa.");
      return;
    }
    setAnalysisBusy(true);
    setError("");
    try {
      const result = await api.analysis.create({
        coordinates,
        businessType,
        radiusMeters: RADIUS_METERS,
        weights: { footTraffic: 35, competition: 25, demographics: 25, accessibility: 15 },
        label: siteName.trim() || coordinatesLabel(coordinates),
      });
      setAnalysis(result);
      setLatestAnalysis(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo completar el análisis.");
      setAnalysis(null);
      setLatestAnalysis(null);
    } finally {
      setAnalysisBusy(false);
    }
  }

  async function saveLocation() {
    if (!coordinates || !activeLayer) {
      setError(activeLayer ? "Selecciona una ubicación en el mapa." : "Crea o selecciona una capa primero.");
      return;
    }
    setSaveBusy(true);
    setError("");
    try {
      await api.layers.addLocation(activeLayer.id, {
        name: siteName.trim() || coordinatesLabel(coordinates),
        address: address || undefined,
        category: layerCategory[businessType],
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
      const [nextPins] = await Promise.all([
        api.layers.locations(activeLayer.id),
        refreshLayers(),
      ]);
      setPins(nextPins);
      setPinError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la ubicación.");
    } finally {
      setSaveBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <BrandHeader eyebrow="Exploración territorial" title="Mapa de oportunidades" />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar dirección o lugar"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          onSubmitEditing={() => void searchAddress()}
        />
        <Pressable style={styles.searchButton} onPress={() => void searchAddress()} disabled={searchBusy}>
          {searchBusy ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.searchButtonText}>Buscar</Text>}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
        {businessTypes.map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setBusinessType(item.value)}
            style={[styles.typeChip, businessType === item.value && styles.typeChipActive]}
          >
            <Text style={[styles.typeText, businessType === item.value && styles.typeTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={StyleSheet.absoluteFill}
          initialRegion={DEFAULT_REGION}
          onPress={(event) => selectCoordinates({
            lat: event.nativeEvent.coordinate.latitude,
            lng: event.nativeEvent.coordinate.longitude,
          })}
          showsCompass
          showsScale
          toolbarEnabled={false}
        >
          {coordinates && (
            <>
              <Marker coordinate={{ latitude: coordinates.lat, longitude: coordinates.lng }} title={siteName || "Ubicación seleccionada"} pinColor={colors.plum} />
              <Circle
                center={{ latitude: coordinates.lat, longitude: coordinates.lng }}
                radius={RADIUS_METERS}
                strokeColor="rgba(49,139,142,0.72)"
                fillColor="rgba(49,139,142,0.10)"
              />
            </>
          )}
          {analysis?.competitors.map((competitor) => (
            <Marker
              key={competitor.placeId}
              coordinate={{ latitude: competitor.coordinates.lat, longitude: competitor.coordinates.lng }}
              title={competitor.name}
              description={`${competitor.distanceMeters} m · ${competitor.category}`}
              pinColor={competitorColor(competitor)}
            />
          ))}
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              title={pin.name}
              description={pin.address ?? pin.category}
              pinColor={activeLayer?.color ?? colors.teal}
            />
          ))}
        </MapView>
        <View pointerEvents="none" style={styles.mapCoordinates}>
          <PulseDot color={colors.teal} size={3} />
          <Text style={styles.mapCoordinatesText}>BOGOTÁ D.C. · 04°39′ N / 74°05′ O</Text>
        </View>
      </View>

      <View style={styles.bottomCard}>
        {layers.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.layerRow}>
            {layers.map((layer) => (
              <Pressable
                key={layer.id}
                onPress={() => setActiveLayerId(layer.id)}
                style={[styles.layerChip, activeLayerId === layer.id && styles.layerChipActive]}
              >
                <View style={[styles.layerDot, { backgroundColor: layer.color }]} />
                <Text numberOfLines={1} style={[styles.layerText, activeLayerId === layer.id && styles.layerTextActive]}>
                  {layer.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.layerHint}>Crea una capa en la pestaña Capas para guardar ubicaciones.</Text>
        )}
        {coordinates ? (
          <>
            <TextInput
              style={styles.siteName}
              value={siteName}
              onChangeText={setSiteName}
              placeholder="Nombre de la ubicación"
              placeholderTextColor={colors.muted}
            />
            <Text style={styles.coordinateLine}>
              {address ? `${address}  ·  ` : ""}{coordinatesLabel(coordinates)}  ·  Radio {RADIUS_METERS} m
            </Text>
          </>
        ) : (
          <Text style={styles.layerHint}>Toca el mapa o busca una dirección para elegir un sitio.</Text>
        )}
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        {pinError ? <Text style={styles.error} accessibilityRole="alert">{pinError}</Text> : null}
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, (!coordinates || !activeLayer || saveBusy) && styles.disabled]}
            onPress={() => void saveLocation()}
            disabled={!coordinates || !activeLayer || saveBusy}
          >
            {saveBusy ? <ActivityIndicator color={colors.tealDeep} size="small" /> : <Text style={styles.secondaryText}>＋ Guardar</Text>}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, (!coordinates || analysisBusy) && styles.disabled]}
            onPress={() => void analyzeLocation()}
            disabled={!coordinates || analysisBusy}
          >
            {analysisBusy ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.primaryText}>Analizar ubicación</Text>}
          </Pressable>
        </View>
        {analysis ? (
          <View style={styles.analysisSummary}>
            <Text style={styles.summaryTitle}>{analysis.competitors.length} competidores consultados</Text>
            <Text style={styles.summaryNote}>Afluencia y demografía no están conectadas; no se calcula un puntaje de viabilidad.</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, paddingTop: 7 },
  searchRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  searchInput: {
    flex: 1, height: 44, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.white, color: colors.ink, fontSize: 12,
  },
  searchButton: { width: 78, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.tealDeep },
  searchButtonText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  typeRow: { paddingHorizontal: 16, gap: 7, paddingBottom: 10 },
  typeChip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 7 },
  typeChipActive: { borderColor: colors.tealDeep, backgroundColor: colors.tealDeep },
  typeText: { color: colors.inkSoft, fontSize: 10, fontWeight: "700" },
  typeTextActive: { color: colors.white },
  mapWrap: { flex: 1, minHeight: 190, overflow: "hidden", backgroundColor: "#dfe9e6" },
  mapCoordinates: { position: "absolute", top: 11, left: 11, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.9)" },
  mapCoordinatesText: { color: colors.tealDeep, fontSize: 7, fontWeight: "800", letterSpacing: 0.8 },
  bottomCard: { paddingHorizontal: 16, paddingTop: 11, paddingBottom: 12, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  layerRow: { gap: 7, paddingBottom: 8 },
  layerChip: { flexDirection: "row", maxWidth: 165, alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  layerChipActive: { borderColor: colors.teal, backgroundColor: colors.mint },
  layerDot: { width: 7, height: 7, borderRadius: 4 },
  layerText: { color: colors.inkSoft, fontSize: 9, fontWeight: "700" },
  layerTextActive: { color: colors.ink },
  layerHint: { color: colors.muted, fontSize: 10, paddingVertical: 6 },
  siteName: { color: colors.ink, fontSize: 12, fontWeight: "700", paddingVertical: 6 },
  coordinateLine: { color: colors.muted, fontSize: 9, marginBottom: 9 },
  error: { color: colors.danger, backgroundColor: "#fff0f1", borderRadius: 8, padding: 8, fontSize: 10, marginVertical: 4 },
  actionRow: { flexDirection: "row", gap: 8 },
  primaryButton: { flex: 1, minHeight: 43, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: colors.tealDeep },
  primaryText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  secondaryButton: { minWidth: 104, minHeight: 43, alignItems: "center", justifyContent: "center", borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.mint },
  secondaryText: { color: colors.tealDeep, fontSize: 11, fontWeight: "800" },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.5 },
  analysisSummary: { marginTop: 9, borderLeftWidth: 2, borderLeftColor: colors.teal, paddingLeft: 9 },
  summaryTitle: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  summaryNote: { color: colors.inkSoft, fontSize: 9, lineHeight: 13, marginTop: 2 },
});

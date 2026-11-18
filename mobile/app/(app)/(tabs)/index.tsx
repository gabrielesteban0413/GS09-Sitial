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
const INFLUENCE_RADII = [300, 500, 800, 1200] as const;
const BUSINESS_GLYPHS: Record<BusinessType, string> = {
  cafe: "CA",
  restaurant: "RE",
  bakery: "PA",
  pharmacy: "FA",
  gym: "GY",
  supermarket: "SU",
};
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
  const [radiusMeters, setRadiusMeters] = useState<number>(800);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [radiusExpanded, setRadiusExpanded] = useState(false);
  const [showInfluence, setShowInfluence] = useState(true);
  const [showCompetition, setShowCompetition] = useState(true);
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
        radiusMeters,
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

      <View style={styles.mapControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: categoriesExpanded }}
          onPress={() => {
            setCategoriesExpanded((expanded) => !expanded);
            setRadiusExpanded(false);
          }}
          style={styles.controlButton}
        >
          <View style={styles.selectedCategoryIcon}>
            <Text style={styles.selectedCategoryGlyph}>{BUSINESS_GLYPHS[businessType]}</Text>
          </View>
          <View style={styles.controlCopy}>
            <Text style={styles.controlEyebrow}>TIPO DE NEGOCIO</Text>
            <Text style={styles.controlTitle}>{businessTypes.find((item) => item.value === businessType)?.label}</Text>
          </View>
          <Text style={styles.controlChevron}>{categoriesExpanded ? "⌃" : "⌄"}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Área de influencia, ${radiusMeters} metros`}
          accessibilityState={{ expanded: radiusExpanded }}
          onPress={() => {
            setRadiusExpanded((expanded) => !expanded);
            setCategoriesExpanded(false);
          }}
          style={styles.radiusControl}
        >
          <View style={styles.radiusIcon}><Text style={styles.radiusGlyph}>◎</Text></View>
          <View style={styles.controlCopy}>
            <Text style={styles.controlEyebrow}>ÁREA DE INFLUENCIA</Text>
            <Text style={styles.controlTitle}>{radiusMeters} m</Text>
          </View>
          <Text style={styles.controlChevron}>{radiusExpanded ? "⌃" : "⌄"}</Text>
        </Pressable>
      </View>
      {categoriesExpanded ? (
        <View style={styles.dropdownPanel}>
          <Text style={styles.dropdownTitle}>Selecciona una categoría</Text>
          <View style={styles.categoryGrid}>
            {businessTypes.map((item) => {
              const selected = businessType === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setBusinessType(item.value);
                    setCategoriesExpanded(false);
                    setAnalysis(null);
                    setLatestAnalysis(null);
                  }}
                  style={styles.categoryOption}
                >
                  <View style={[styles.categoryCircle, selected && styles.categoryCircleSelected]}>
                    <Text style={[styles.categoryGlyph, selected && styles.categoryGlyphSelected]}>
                      {BUSINESS_GLYPHS[item.value]}
                    </Text>
                  </View>
                  <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
      {radiusExpanded ? (
        <View style={styles.dropdownPanel}>
          <Text style={styles.dropdownTitle}>Radio para consultar competidores</Text>
          <View style={styles.radiusOptions}>
            {INFLUENCE_RADII.map((radius) => {
              const selected = radiusMeters === radius;
              return (
                <Pressable
                  key={radius}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setRadiusMeters(radius);
                    setRadiusExpanded(false);
                    setAnalysis(null);
                    setLatestAnalysis(null);
                  }}
                  style={[styles.radiusOption, selected && styles.radiusOptionSelected]}
                >
                  <Text style={[styles.radiusOptionValue, selected && styles.radiusOptionTextSelected]}>{radius}</Text>
                  <Text style={[styles.radiusOptionUnit, selected && styles.radiusOptionTextSelected]}>m</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.radiusNote}>Radio de búsqueda circular; no es una isócrona vial ni mide afluencia peatonal.</Text>
        </View>
      ) : null}

      <View style={styles.mapLayerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ checked: showInfluence }}
          onPress={() => setShowInfluence((visible) => !visible)}
          style={[styles.mapLayerButton, showInfluence && styles.mapLayerButtonActive]}
        >
          <Text style={[styles.mapLayerGlyph, showInfluence && styles.mapLayerGlyphActive]}>◎</Text>
          <Text style={[styles.mapLayerText, showInfluence && styles.mapLayerTextActive]}>Influencia · {radiusMeters} m</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ checked: showCompetition }}
          onPress={() => setShowCompetition((visible) => !visible)}
          style={[styles.mapLayerButton, showCompetition && styles.competitionButtonActive]}
        >
          <View style={[styles.competitionDot, showCompetition && styles.competitionDotActive]} />
          <Text style={[styles.mapLayerText, showCompetition && styles.mapLayerTextActive]}>
            Competencia{analysis ? ` · ${analysis.competitors.length}` : ""}
          </Text>
        </Pressable>
      </View>

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
              {showInfluence ? (
                <Circle
                  center={{ latitude: coordinates.lat, longitude: coordinates.lng }}
                  radius={radiusMeters}
                  strokeColor="rgba(49,139,142,0.82)"
                  fillColor="rgba(49,139,142,0.12)"
                />
              ) : null}
            </>
          )}
          {showCompetition && analysis?.competitors.map((competitor) => (
            <Marker
              key={competitor.placeId}
              coordinate={{ latitude: competitor.coordinates.lat, longitude: competitor.coordinates.lng }}
              title={competitor.name}
              description={`${competitor.distanceMeters} m · ${competitor.category}`}
              pinColor={competitorColor(competitor)}
            >
              <View style={[styles.competitorMarker, { backgroundColor: competitorColor(competitor) }]}>
                <Text style={styles.competitorMarkerText}>C</Text>
              </View>
            </Marker>
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
        {coordinates ? (
          <View pointerEvents="none" style={styles.mapLegend}>
            <View style={styles.legendLine}>
              <View style={styles.legendInfluenceMark} />
              <Text style={styles.legendText}>Radio de influencia</Text>
            </View>
            <View style={styles.legendLine}>
              <View style={styles.legendCompetitorMark} />
              <Text style={styles.legendText}>
                {analysis ? `${analysis.competitors.length} competidores` : "Pulsa Analizar para buscar competencia"}
              </Text>
            </View>
          </View>
        ) : null}
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
              {address ? `${address}  ·  ` : ""}{coordinatesLabel(coordinates)}  ·  Radio {radiusMeters} m
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
  mapControls: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 9 },
  mapLayerRow: { flexDirection: "row", gap: 7, paddingHorizontal: 16, paddingBottom: 8 },
  mapLayerButton: {
    flexDirection: "row", minHeight: 33, alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  mapLayerButtonActive: { borderColor: "#8cc9c2", backgroundColor: colors.mint },
  competitionButtonActive: { borderColor: "#d8c5d3", backgroundColor: colors.plumSoft },
  mapLayerGlyph: { color: colors.muted, fontSize: 17, fontWeight: "800", lineHeight: 19 },
  mapLayerGlyphActive: { color: colors.tealDeep },
  mapLayerText: { color: colors.inkSoft, fontSize: 9, fontWeight: "700" },
  mapLayerTextActive: { color: colors.ink },
  competitionDot: { width: 8, height: 8, borderWidth: 2, borderColor: colors.muted, borderRadius: 4 },
  competitionDotActive: { borderColor: colors.plum, backgroundColor: colors.plum },
  controlButton: {
    flex: 1.2,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  radiusControl: {
    flex: 0.8,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 9,
    backgroundColor: colors.white,
  },
  selectedCategoryIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.mint, borderWidth: 1, borderColor: "#cfe6e1",
  },
  selectedCategoryGlyph: { color: colors.tealDeep, fontSize: 17, fontWeight: "800" },
  radiusIcon: {
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.plumSoft,
  },
  radiusGlyph: { color: colors.plum, fontSize: 21, fontWeight: "700", lineHeight: 24 },
  controlCopy: { flex: 1 },
  controlEyebrow: { color: colors.muted, fontSize: 7, fontWeight: "800", letterSpacing: 0.7 },
  controlTitle: { color: colors.ink, fontSize: 11, fontWeight: "800", marginTop: 3 },
  controlChevron: { color: colors.tealDeep, fontSize: 17, fontWeight: "800", paddingHorizontal: 1 },
  dropdownPanel: {
    marginHorizontal: 16,
    marginBottom: 9,
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownTitle: { color: colors.inkSoft, fontSize: 9, fontWeight: "800", marginBottom: 9 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", rowGap: 9 },
  categoryOption: { width: "31%", alignItems: "center", gap: 4 },
  categoryCircle: {
    width: 43, height: 43, borderRadius: 22, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.paper,
  },
  categoryCircleSelected: {
    borderColor: colors.tealDeep, backgroundColor: colors.tealDeep,
    shadowColor: colors.tealDeep, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3,
  },
  categoryGlyph: { color: colors.inkSoft, fontSize: 19, fontWeight: "800" },
  categoryGlyphSelected: { color: colors.white },
  categoryLabel: { color: colors.inkSoft, fontSize: 8, fontWeight: "700", textAlign: "center" },
  categoryLabelSelected: { color: colors.tealDeep },
  radiusOptions: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 2 },
  radiusOption: {
    width: 51, height: 51, borderRadius: 26, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.paper,
  },
  radiusOptionSelected: { borderColor: colors.plum, backgroundColor: colors.plum },
  radiusOptionValue: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  radiusOptionUnit: { color: colors.muted, fontSize: 8, fontWeight: "700", marginTop: -1 },
  radiusOptionTextSelected: { color: colors.white },
  radiusNote: { color: colors.muted, fontSize: 8, lineHeight: 12, marginTop: 8 },
  mapWrap: { flex: 1, minHeight: 190, overflow: "hidden", backgroundColor: "#dfe9e6" },
  mapCoordinates: { position: "absolute", top: 11, left: 11, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.9)" },
  mapCoordinatesText: { color: colors.tealDeep, fontSize: 7, fontWeight: "800", letterSpacing: 0.8 },
  mapLegend: {
    position: "absolute", right: 9, bottom: 9, gap: 5, borderWidth: 1, borderColor: "rgba(220,232,230,0.9)",
    borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: "rgba(255,255,255,0.94)",
  },
  legendLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendInfluenceMark: { width: 9, height: 9, borderWidth: 1, borderColor: colors.teal, borderRadius: 5, backgroundColor: "rgba(49,139,142,0.2)" },
  legendCompetitorMark: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.plum },
  legendText: { maxWidth: 155, color: colors.inkSoft, fontSize: 8, fontWeight: "700" },
  competitorMarker: {
    width: 24, height: 24, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: colors.white, borderRadius: 12,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.28, shadowRadius: 3, elevation: 4,
  },
  competitorMarkerText: { color: colors.white, fontSize: 10, fontWeight: "900" },
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

import { Redirect, router } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OrbitRing, PulseDot } from "../src/components/GeoMotion";
import { useAuth } from "../src/context/AuthContext";
import { colors } from "../src/theme";

export default function IndexScreen() {
  const { user, isLoading, sessionError } = useAuth();
  if (user) return <Redirect href="/(app)/(tabs)" />;
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topbar}>
          <View style={styles.brand}>
            <Image source={require("../assets/sitial-logo.png")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandName}>SITIAL</Text>
          </View>
          <View style={styles.live}><PulseDot color={colors.success} size={4} /><Text style={styles.liveText}>GEO INTELLIGENCE</Text></View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroGrid} />
          <View style={styles.heroOrb} />
          <OrbitRing size={212} color="rgba(184,226,220,0.28)" style={styles.orbitOne} />
          <OrbitRing size={132} color="rgba(208,162,199,0.34)" style={styles.orbitTwo} />
          <Text style={styles.coordinates}>04°39′ N  /  74°05′ O     ·     BOGOTÁ, COLOMBIA</Text>
          <Text style={styles.heroTitle}>El lugar{`\n`}lo cambia <Text style={styles.heroAccent}>todo.</Text></Text>
          <Text style={styles.heroBody}>
            Explora el territorio, entiende la competencia y encuentra el punto de partida de tu próximo negocio.
          </Text>
          <View style={styles.heroRule}><View style={styles.heroRuleAccent} /></View>
          <Text style={styles.heroCaption}>INTELIGENCIA DE UBICACIÓN PARA RETAIL</Text>
          <View style={styles.heroMarker}><View style={styles.markerCore} /><View style={styles.markerRing} /></View>
        </View>

        {sessionError ? (
          <View style={styles.connectionNotice}>
            <Text style={styles.connectionTitle}>No se pudo restaurar la sesión</Text>
            <Text style={styles.connectionBody}>{sessionError}</Text>
          </View>
        ) : null}

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>TERRITORIO, CON CONTEXTO</Text>
          <Text style={styles.sectionTitle}>Una mejor lectura del entorno.</Text>
          <Text style={styles.sectionBody}>
            Analiza lugares reales y organiza tus opciones. Sitial reporta los datos disponibles sin inventar afluencia ni viabilidad.
          </Text>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Text style={[styles.featureNumber, styles.teal]}>01</Text>
            <Text style={styles.featureTitle}>Explora</Text>
            <Text style={styles.featureBody}>Busca direcciones o elige un punto en el mapa.</Text>
          </View>
          <View style={[styles.featureCard, styles.plumCard]}>
            <Text style={[styles.featureNumber, styles.plum]}>02</Text>
            <Text style={styles.featureTitle}>Compara</Text>
            <Text style={styles.featureBody}>Consulta competidores en el radio seleccionado.</Text>
          </View>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Empieza por el mapa.</Text>
          <Text style={styles.ctaBody}>Ingresa para abrir tu espacio de exploración territorial.</Text>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.primaryButtonText}>Iniciar sesión  →</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.secondaryButtonText}>Crear una cuenta</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>SITIAL  ·  04°39′ N / 74°05′ O</Text>
          <Text style={styles.footerNote}>MAPA · COMPETENCIA · CAPAS</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper },
  content: { paddingHorizontal: 17, paddingBottom: 20 },
  topbar: { height: 59, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 7 },
  logo: { width: 34, height: 34, borderRadius: 10 },
  brandName: { color: colors.ink, fontSize: 14, fontWeight: "900", letterSpacing: 1.9 },
  live: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: "#e7f2ef" },
  liveText: { color: colors.tealDeep, fontSize: 7, fontWeight: "800", letterSpacing: 0.65 },
  hero: { minHeight: 356, overflow: "hidden", justifyContent: "center", borderRadius: 22, paddingHorizontal: 21, paddingVertical: 25, backgroundColor: colors.ink },
  heroGrid: { position: "absolute", width: 470, height: 470, top: -75, right: -260, borderWidth: 1, borderColor: "rgba(154,213,205,0.15)", transform: [{ rotate: "34deg" }] },
  heroOrb: { position: "absolute", width: 220, height: 220, top: -85, right: -48, borderRadius: 110, backgroundColor: "rgba(125,56,101,0.24)" },
  orbitOne: { right: -20, top: 38 },
  orbitTwo: { right: 56, top: 78 },
  coordinates: { color: "#a5d8d1", fontSize: 7, fontWeight: "800", letterSpacing: 0.8 },
  heroTitle: { color: colors.white, fontSize: 41, fontWeight: "900", lineHeight: 43, letterSpacing: -1.5, marginTop: 31 },
  heroAccent: { color: "#a8dcd4" },
  heroBody: { maxWidth: 270, color: "#d1dfdc", fontSize: 12, lineHeight: 19, marginTop: 12 },
  heroRule: { width: 66, height: 2, backgroundColor: "rgba(255,255,255,0.18)", marginTop: 20 },
  heroRuleAccent: { width: 28, height: 2, backgroundColor: "#bc83af" },
  heroCaption: { color: "#abcac5", fontSize: 7, fontWeight: "800", letterSpacing: 1.15, marginTop: 10 },
  heroMarker: { position: "absolute", right: 31, bottom: 46, width: 25, height: 25, alignItems: "center", justifyContent: "center" },
  markerCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#d7b1cf" },
  markerRing: { ...StyleSheet.absoluteFill, borderWidth: 1, borderColor: "rgba(215,177,207,0.55)", borderRadius: 13 },
  connectionNotice: { padding: 12, borderWidth: 1, borderColor: "#ead6d9", borderRadius: 13, marginTop: 12, backgroundColor: "#fff8f8" },
  connectionTitle: { color: colors.danger, fontSize: 10, fontWeight: "800" },
  connectionBody: { color: colors.inkSoft, fontSize: 9, lineHeight: 14, marginTop: 4 },
  intro: { paddingTop: 24, paddingBottom: 13 },
  eyebrow: { color: colors.teal, fontSize: 8, fontWeight: "900", letterSpacing: 1.6 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: "900", letterSpacing: -0.5, marginTop: 7 },
  sectionBody: { color: colors.inkSoft, fontSize: 10, lineHeight: 16, marginTop: 6 },
  featureGrid: { flexDirection: "row", gap: 9 },
  featureCard: { flex: 1, minHeight: 118, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12, backgroundColor: colors.white },
  plumCard: { backgroundColor: "#fbf7fa", borderColor: "#ecdeea" },
  featureNumber: { fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  teal: { color: colors.teal },
  plum: { color: colors.plum },
  featureTitle: { color: colors.ink, fontSize: 12, fontWeight: "900", marginTop: 9 },
  featureBody: { color: colors.inkSoft, fontSize: 9, lineHeight: 14, marginTop: 4 },
  cta: { borderRadius: 17, padding: 16, marginTop: 12, backgroundColor: "#eaf3f1" },
  ctaTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  ctaBody: { color: colors.inkSoft, fontSize: 10, lineHeight: 15, marginTop: 4 },
  primaryButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 11, marginTop: 14, backgroundColor: colors.tealDeep },
  primaryButtonText: { color: colors.white, fontSize: 11, fontWeight: "900" },
  secondaryButton: { minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: 11, borderWidth: 1, borderColor: "#cbdcda", marginTop: 7, backgroundColor: colors.white },
  secondaryButtonText: { color: colors.plum, fontSize: 10, fontWeight: "800" },
  pressed: { opacity: 0.82 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16 },
  footerBrand: { color: colors.muted, fontSize: 7, fontWeight: "800", letterSpacing: 0.6 },
  footerNote: { color: colors.teal, fontSize: 6, fontWeight: "800", letterSpacing: 0.6 },
});

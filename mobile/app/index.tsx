import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GeoDrift, OrbitRing, PulseDot } from "../src/components/GeoMotion";
import { useAuth } from "../src/context/AuthContext";
import { colors } from "../src/theme";

let startupSplashShown = false;

export default function IndexScreen() {
  const { user, isLoading, sessionError } = useAuth();
  const [minimumSplashElapsed, setMinimumSplashElapsed] = useState(startupSplashShown);

  useEffect(() => {
    if (startupSplashShown) return;

    const timeout = setTimeout(() => {
      startupSplashShown = true;
      setMinimumSplashElapsed(true);
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading || !minimumSplashElapsed) {
    return (
      <View style={styles.loading}>
        <ImageBackground
          source={require("../assets/auth-hero.jpg")}
          resizeMode="cover"
          style={styles.splash}
        >
          <View style={styles.splashShade} />
          <View style={styles.splashGrid} />
          <OrbitRing size={280} color="rgba(255,255,255,0.27)" style={styles.splashOrbitOuter} />
          <OrbitRing size={190} color="rgba(153,224,214,0.46)" style={styles.splashOrbitInner} />
          <GeoDrift style={styles.splashPointOne} duration={2200} distance={8}>
            <PulseDot color="#b5e8dc" size={6} />
          </GeoDrift>
          <GeoDrift style={styles.splashPointTwo} duration={3100} distance={11}>
            <PulseDot color="#f3cce8" size={5} />
          </GeoDrift>
          <View style={styles.splashBrand}>
            <Image source={require("../assets/sitial-logo.png")} style={styles.splashLogo} resizeMode="contain" />
            <Text style={styles.splashTagline}>INTELIGENCIA DE UBICACIÓN</Text>
          </View>
          <View style={styles.splashFooter}>
            <View style={styles.splashSignal}><PulseDot color="#b5e8dc" size={4} /><Text style={styles.splashStatus}>CONECTANDO CON TU TERRITORIO</Text></View>
            <Text style={styles.splashCoordinates}>04°39′ N · 74°05′ O</Text>
          </View>
        </ImageBackground>
      </View>
    );
  }
  if (user) return <Redirect href="/(app)/(tabs)" />;
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

        <ImageBackground
          source={require("../assets/hero-bg.jpg")}
          style={styles.hero}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroShade} />
          <View style={styles.heroGlow} />
          <View style={styles.heroGrid} />
          <OrbitRing size={248} color="rgba(184,226,220,0.28)" style={styles.orbitOne} />
          <OrbitRing size={158} color="rgba(208,162,199,0.4)" style={styles.orbitTwo} />
          <GeoDrift style={styles.heroPointOne} duration={2700} distance={5}>
            <PulseDot color="#b3e7dc" size={6} />
          </GeoDrift>
          <GeoDrift style={styles.heroPointTwo} duration={3400} distance={7}>
            <PulseDot color="#e7c5df" size={5} />
          </GeoDrift>
          <View style={styles.heroTopline}>
            <View style={styles.liveOnDark}>
              <PulseDot color="#a7ded2" size={4} />
              <Text style={styles.liveOnDarkText}>MAPA ACTIVO · BOGOTÁ</Text>
            </View>
            <Text style={styles.heroSerial}>GEO / 01</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.coordinates}>04°39′ N  /  74°05′ O</Text>
            <Text style={styles.heroTitle}>El lugar{`\n`}lo cambia <Text style={styles.heroAccent}>todo.</Text></Text>
            <Text style={styles.heroBody}>
              Explora el territorio y entiende lo que ocurre alrededor de cada ubicación.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.heroButtonText}>Explorar el mapa</Text>
              <Text style={styles.heroButtonArrow}>↗</Text>
            </Pressable>
          </View>
          <GeoDrift style={styles.mapCallout} duration={3100} distance={5}>
            <View style={styles.mapCalloutIcon}><PulseDot color={colors.white} size={5} /></View>
            <View style={styles.mapCalloutText}>
              <Text style={styles.mapCalloutTitle}>ZONA EXPLORADA</Text>
              <Text style={styles.mapCalloutCoords}>4°39′ N · 74°05′ O</Text>
            </View>
          </GeoDrift>
          <View style={styles.heroFoot}>
            <Text style={styles.heroCaption}>INTELIGENCIA DE UBICACIÓN PARA RETAIL</Text>
            <View style={styles.heroSignal}>
              <View style={[styles.heroSignalDot, styles.heroSignalActive]} />
              <View style={styles.heroSignalDot} />
              <View style={styles.heroSignalDot} />
            </View>
          </View>
        </ImageBackground>

        {sessionError ? (
          <View style={styles.connectionNotice}>
            <Text style={styles.connectionTitle}>No se pudo restaurar la sesión</Text>
            <Text style={styles.connectionBody}>{sessionError}</Text>
          </View>
        ) : null}

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>TERRITORIO, CON CONTEXTO</Text>
          <Text style={styles.sectionTitle}>Decisiones con los pies en el mapa.</Text>
          <Text style={styles.sectionBody}>
            Cada zona tiene su propia historia. Explora lugares, consulta negocios cercanos y compara tus alternativas con información clara.
          </Text>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureTop}><Text style={[styles.featureNumber, styles.teal]}>01 / EXPLORACIÓN</Text><Text style={styles.featureIcon}>⌖</Text></View>
            <Text style={styles.featureTitle}>Empieza por el lugar.</Text>
            <Text style={styles.featureBody}>Busca una dirección o marca el punto exacto que quieres estudiar.</Text>
          </View>
          <View style={[styles.featureCard, styles.plumCard]}>
            <View style={styles.featureTop}><Text style={[styles.featureNumber, styles.plum]}>02 / CONTEXTO</Text><Text style={[styles.featureIcon, styles.featureIconPlum]}>◎</Text></View>
            <Text style={styles.featureTitle}>Lee lo que te rodea.</Text>
            <Text style={styles.featureBody}>Consulta competidores encontrados en el radio que elijas.</Text>
          </View>
        </View>

        <ImageBackground
          source={require("../assets/analysis-bg.jpg")}
          imageStyle={styles.insightImage}
          style={styles.insight}
          resizeMode="cover"
        >
          <View style={styles.insightShade} />
          <View style={styles.insightHeader}>
            <Text style={styles.insightKicker}>SITIAL / MÉTODO</Text>
            <Text style={styles.insightIndex}>03 — 04</Text>
          </View>
          <View style={styles.insightGraphic}>
            <OrbitRing size={128} color="rgba(255,255,255,0.4)" style={styles.insightOrbitOuter} />
            <OrbitRing size={84} color="rgba(255,255,255,0.25)" style={styles.insightOrbitInner} />
            <View style={styles.insightPin}><PulseDot color={colors.white} size={7} /></View>
            <View style={styles.insightLine} />
          </View>
          <Text style={styles.insightTitle}>Datos claros.{`\n`}Sin promesas inventadas.</Text>
          <Text style={styles.insightBody}>
            Mostramos los establecimientos consultados. Si una fuente —como afluencia o demografía— no está conectada, lo decimos.
          </Text>
          <View style={styles.insightFooter}>
            <View style={styles.insightStatus}><PulseDot color="#9fe0c7" size={4} /><Text style={styles.insightStatusText}>LECTURA TRANSPARENTE</Text></View>
            <Text style={styles.insightCoords}>BOGOTÁ · CO</Text>
          </View>
        </ImageBackground>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureTop}><Text style={[styles.featureNumber, styles.teal]}>03 / ORGANIZACIÓN</Text><Text style={styles.featureIcon}>▤</Text></View>
            <Text style={styles.featureTitle}>Tus sitios, en capas.</Text>
            <Text style={styles.featureBody}>Agrupa ubicaciones por proyecto y vuelve a ellas desde tu perfil.</Text>
          </View>
          <View style={[styles.featureCard, styles.plumCard]}>
            <View style={styles.featureTop}><Text style={[styles.featureNumber, styles.plum]}>04 / MOVILIDAD</Text><Text style={[styles.featureIcon, styles.featureIconPlum]}>↗</Text></View>
            <Text style={styles.featureTitle}>Explora donde estés.</Text>
            <Text style={styles.featureBody}>Lleva tu análisis contigo en el mapa móvil de Sitial.</Text>
          </View>
        </View>

        <View style={styles.cta}>
          <View style={styles.ctaMark}><Image source={require("../assets/sitial-logo.png")} style={styles.ctaLogo} resizeMode="cover" /></View>
          <Text style={styles.ctaKicker}>TU SIGUIENTE DECISIÓN COMIENZA AQUÍ</Text>
          <Text style={styles.ctaTitle}>Empieza por el mapa.</Text>
          <Text style={styles.ctaBody}>Inicia sesión para explorar ubicaciones y organizar tus opciones.</Text>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.primaryButtonText}>Entrar a mi espacio</Text>
            <Text style={styles.primaryButtonArrow}>→</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.secondaryButtonText}>Crear cuenta nueva</Text>
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
  loading: { flex: 1, backgroundColor: colors.ink },
  splash: { flex: 1, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: colors.ink },
  splashShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(17,38,49,0.62)" },
  splashGrid: {
    position: "absolute", width: 620, height: 620, borderWidth: 1, borderColor: "rgba(231,247,244,0.13)",
    transform: [{ rotate: "38deg" }],
  },
  splashOrbitOuter: { top: "23%", left: "50%", marginLeft: -140 },
  splashOrbitInner: { top: "28%", left: "50%", marginLeft: -95 },
  splashPointOne: { position: "absolute", top: "28%", left: "24%" },
  splashPointTwo: { position: "absolute", top: "36%", right: "21%" },
  splashBrand: { alignItems: "center", justifyContent: "center", padding: 24 },
  splashLogo: {
    width: 82, height: 82, borderRadius: 24, borderWidth: 2, borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  splashTagline: { color: "#c5e7e1", fontSize: 8, fontWeight: "800", letterSpacing: 1.8, marginTop: 13 },
  splashFooter: { position: "absolute", right: 22, bottom: 35, left: 22, gap: 12, alignItems: "center" },
  splashSignal: { flexDirection: "row", alignItems: "center", gap: 7 },
  splashStatus: { color: "#e4f2ef", fontSize: 8, fontWeight: "800", letterSpacing: 1.1 },
  splashCoordinates: { color: "rgba(226,242,239,0.68)", fontSize: 8, fontWeight: "700", letterSpacing: 1.5 },
  content: { paddingHorizontal: 17, paddingBottom: 20 },
  topbar: { height: 59, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 7 },
  logo: { width: 34, height: 34, borderRadius: 10 },
  brandName: { color: colors.ink, fontSize: 14, fontWeight: "900", letterSpacing: 1.9 },
  live: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: "#e7f2ef" },
  liveText: { color: colors.tealDeep, fontSize: 7, fontWeight: "800", letterSpacing: 0.65 },
  hero: { minHeight: 480, overflow: "hidden", justifyContent: "space-between", borderRadius: 25, paddingHorizontal: 21, paddingVertical: 20, backgroundColor: colors.ink, borderWidth: 1, borderColor: "rgba(255,255,255,0.75)", shadowColor: colors.ink, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.22, shadowRadius: 25, elevation: 9 },
  heroImage: { borderRadius: 24 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(13,43,51,0.7)" },
  heroGlow: { position: "absolute", width: 310, height: 310, top: -115, right: -112, borderRadius: 155, backgroundColor: "rgba(125,56,101,0.38)" },
  heroGrid: { position: "absolute", width: 470, height: 470, top: -70, right: -230, borderWidth: 1, borderColor: "rgba(190,231,223,0.18)", transform: [{ rotate: "34deg" }] },
  orbitOne: { right: -96, top: 58 },
  orbitTwo: { right: -50, top: 104 },
  heroPointOne: { position: "absolute", top: "30%", right: "42%" },
  heroPointTwo: { position: "absolute", top: "59%", right: "9%" },
  heroTopline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  liveOnDark: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "rgba(220,245,239,0.26)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: "rgba(17,54,60,0.5)" },
  liveOnDarkText: { color: "#d9efea", fontSize: 7, fontWeight: "800", letterSpacing: 0.75 },
  heroSerial: { color: "rgba(224,244,240,0.7)", fontSize: 8, fontWeight: "800", letterSpacing: 1.2 },
  heroCopy: { zIndex: 2, paddingBottom: 29 },
  coordinates: { color: "#b7e1d8", fontSize: 8, fontWeight: "800", letterSpacing: 1.3 },
  heroTitle: { color: colors.white, fontSize: 43, fontWeight: "900", lineHeight: 45, letterSpacing: -1.6, marginTop: 15 },
  heroAccent: { color: "#a8dcd4" },
  heroBody: { maxWidth: 280, color: "#e0e9e6", fontSize: 12, lineHeight: 19, marginTop: 11 },
  heroButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", alignSelf: "flex-start", minWidth: 178, minHeight: 46, borderRadius: 13, paddingHorizontal: 15, marginTop: 20, backgroundColor: "#ffffff", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 13, elevation: 6 },
  heroButtonText: { color: colors.ink, fontSize: 11, fontWeight: "900" },
  heroButtonArrow: { color: colors.plum, fontSize: 17, fontWeight: "800" },
  mapCallout: { position: "absolute", right: 13, top: "41%", zIndex: 2, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.55)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "rgba(248,251,250,0.92)" },
  mapCalloutIcon: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: colors.tealDeep },
  mapCalloutText: { gap: 3 },
  mapCalloutTitle: { color: colors.inkSoft, fontSize: 6, fontWeight: "900", letterSpacing: 0.8 },
  mapCalloutCoords: { color: colors.tealDeep, fontSize: 8, fontWeight: "800" },
  heroFoot: { position: "absolute", bottom: 17, left: 21, right: 21, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroCaption: { color: "#c4d9d5", fontSize: 6, fontWeight: "800", letterSpacing: 0.95 },
  heroSignal: { flexDirection: "row", gap: 4 },
  heroSignalDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.45)" },
  heroSignalActive: { width: 14, backgroundColor: "#b6e5dc" },
  connectionNotice: { padding: 12, borderWidth: 1, borderColor: "#ead6d9", borderRadius: 13, marginTop: 12, backgroundColor: "#fff8f8" },
  connectionTitle: { color: colors.danger, fontSize: 10, fontWeight: "800" },
  connectionBody: { color: colors.inkSoft, fontSize: 9, lineHeight: 14, marginTop: 4 },
  intro: { paddingTop: 30, paddingBottom: 15 },
  eyebrow: { color: colors.teal, fontSize: 8, fontWeight: "900", letterSpacing: 1.65 },
  sectionTitle: { color: colors.ink, fontSize: 22, fontWeight: "900", letterSpacing: -0.6, marginTop: 8 },
  sectionBody: { color: colors.inkSoft, fontSize: 11, lineHeight: 18, marginTop: 7 },
  featureGrid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  featureCard: { flex: 1, minHeight: 147, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 13, backgroundColor: colors.white, shadowColor: colors.ink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  plumCard: { backgroundColor: "#fcf8fb", borderColor: "#ecdeea" },
  featureTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  featureIcon: { color: colors.teal, fontSize: 19, fontWeight: "500" },
  featureIconPlum: { color: colors.plum },
  featureNumber: { fontSize: 7, fontWeight: "900", letterSpacing: 0.6 },
  teal: { color: colors.teal },
  plum: { color: colors.plum },
  featureTitle: { color: colors.ink, fontSize: 12, fontWeight: "900", marginTop: 14 },
  featureBody: { color: colors.inkSoft, fontSize: 9, lineHeight: 15, marginTop: 5 },
  insight: { minHeight: 330, overflow: "hidden", justifyContent: "flex-end", borderRadius: 19, padding: 17, marginVertical: 9, backgroundColor: colors.plum },
  insightImage: { borderRadius: 19 },
  insightShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(42,20,47,0.65)" },
  insightHeader: { position: "absolute", top: 16, left: 17, right: 17, flexDirection: "row", justifyContent: "space-between" },
  insightKicker: { color: "#efcfe5", fontSize: 7, fontWeight: "900", letterSpacing: 1.2 },
  insightIndex: { color: "rgba(255,255,255,0.72)", fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  insightGraphic: { position: "absolute", top: 54, right: 27, width: 132, height: 132, alignItems: "center", justifyContent: "center" },
  insightOrbitOuter: {},
  insightOrbitInner: {},
  insightPin: { width: 31, height: 31, alignItems: "center", justifyContent: "center", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.75)", backgroundColor: "rgba(72,151,152,0.9)" },
  insightLine: { position: "absolute", top: 64, left: -12, width: 158, height: 1, backgroundColor: "rgba(255,255,255,0.27)", transform: [{ rotate: "-28deg" }] },
  insightTitle: { color: colors.white, fontSize: 25, fontWeight: "900", lineHeight: 28, letterSpacing: -0.55 },
  insightBody: { maxWidth: 290, color: "#f0e7ee", fontSize: 10, lineHeight: 16, marginTop: 9 },
  insightFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)", paddingTop: 10, marginTop: 15 },
  insightStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  insightStatusText: { color: "#d3eee4", fontSize: 6, fontWeight: "900", letterSpacing: 0.85 },
  insightCoords: { color: "rgba(255,255,255,0.72)", fontSize: 7, fontWeight: "800", letterSpacing: 0.7 },
  cta: { alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: "#d4e6e2", borderRadius: 19, paddingHorizontal: 18, paddingVertical: 20, marginTop: 7, backgroundColor: "#edf6f4", shadowColor: colors.ink, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 3 },
  ctaMark: { width: 51, height: 51, overflow: "hidden", borderWidth: 2, borderColor: colors.white, borderRadius: 17, marginBottom: 12, backgroundColor: colors.ink },
  ctaLogo: { width: "100%", height: "100%" },
  ctaKicker: { color: colors.plum, fontSize: 7, fontWeight: "900", letterSpacing: 1.15, textAlign: "center" },
  ctaTitle: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: 6, textAlign: "center" },
  ctaBody: { maxWidth: 290, color: colors.inkSoft, fontSize: 10, lineHeight: 15, marginTop: 5, textAlign: "center" },
  primaryButton: { flexDirection: "row", minHeight: 49, alignItems: "center", justifyContent: "center", gap: 16, alignSelf: "stretch", borderRadius: 13, paddingHorizontal: 15, marginTop: 16, backgroundColor: colors.tealDeep, shadowColor: colors.tealDeep, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 11, elevation: 5 },
  primaryButtonText: { color: colors.white, fontSize: 11, fontWeight: "900" },
  primaryButtonArrow: { color: "#b4e2d9", fontSize: 16, fontWeight: "800" },
  secondaryButton: { minHeight: 45, alignItems: "center", justifyContent: "center", alignSelf: "stretch", borderRadius: 13, borderWidth: 1, borderColor: "#cfddda", marginTop: 9, backgroundColor: "rgba(255,255,255,0.85)" },
  secondaryButtonText: { color: colors.plum, fontSize: 10, fontWeight: "900" },
  pressed: { opacity: 0.82 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16 },
  footerBrand: { color: colors.muted, fontSize: 7, fontWeight: "800", letterSpacing: 0.6 },
  footerNote: { color: colors.teal, fontSize: 6, fontWeight: "800", letterSpacing: 0.6 },
});

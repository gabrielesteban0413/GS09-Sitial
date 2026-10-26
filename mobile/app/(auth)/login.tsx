import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { OrbitRing } from "../../src/components/GeoMotion";
import { colors } from "../../src/theme";

export default function LoginScreen() {
  const { login, sessionError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(sessionError ?? "");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ImageBackground
            source={require("../../assets/auth-hero.jpg")}
            style={styles.visual}
            imageStyle={styles.visualImage}
            resizeMode="cover"
          >
            <View style={styles.visualShade} />
            <View style={styles.grid} />
            <OrbitRing size={155} color="rgba(183,231,222,0.24)" style={styles.orbit} />
            <Text style={styles.coordinate}>04°39′ N  /  74°05′ O</Text>
            <Text style={styles.visualTitle}>Decide con{`\n`}el territorio.</Text>
            <Text style={styles.visualNote}>Inteligencia de ubicación para negocios reales.</Text>
          </ImageBackground>
          <View style={styles.card}>
            <Text style={styles.kicker}>ACCESO A TU ESPACIO</Text>
            <Text style={styles.heading}>Bienvenido</Text>
            <Text style={styles.description}>Ingresa para explorar y analizar tus ubicaciones.</Text>
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              onSubmitEditing={() => void submit()}
            />
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && styles.pressed, busy && styles.disabled]}
              onPress={() => void submit()}
              disabled={busy || !email.trim() || !password}
            >
              {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
            </Pressable>
            <Text style={styles.footer}>
              ¿Aún no tienes cuenta?{" "}
              <Link href="/(auth)/register" style={styles.link}>Crear cuenta</Link>
            </Text>
            <Text style={styles.note}>MAPA · COMPETENCIA · CAPAS</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 18 },
  visual: {
    minHeight: 225,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    backgroundColor: colors.tealDeep,
  },
  visualImage: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  visualShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(12,48,55,0.61)" },
  grid: {
    position: "absolute",
    width: 310,
    height: 310,
    top: -174,
    right: -66,
    borderWidth: 1,
    borderColor: "rgba(183,231,222,0.2)",
    transform: [{ rotate: "35deg" }],
  },
  orbit: { top: -43, right: 31 },
  coordinate: { color: "#9ed3cc", fontSize: 9, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 },
  visualTitle: { color: colors.white, fontSize: 33, fontWeight: "900", lineHeight: 35, letterSpacing: -0.6 },
  visualNote: { color: "#c3ddda", fontSize: 11, marginTop: 9 },
  card: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kicker: { color: colors.teal, fontSize: 9, fontWeight: "800", letterSpacing: 1.6 },
  heading: { color: colors.ink, fontSize: 25, fontWeight: "800", marginTop: 8 },
  description: { color: colors.inkSoft, fontSize: 12, lineHeight: 19, marginTop: 5, marginBottom: 20 },
  label: { color: colors.ink, fontSize: 11, fontWeight: "700", marginTop: 12, marginBottom: 7 },
  input: {
    minHeight: 47,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    paddingHorizontal: 13,
    color: colors.ink,
    backgroundColor: "#fbfdfd",
    fontSize: 13,
  },
  button: {
    minHeight: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginTop: 21,
    backgroundColor: colors.tealDeep,
    shadowColor: colors.tealDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 11,
    elevation: 5,
  },
  pressed: { opacity: 0.84 },
  disabled: { opacity: 0.55 },
  buttonText: { color: colors.white, fontSize: 13, fontWeight: "800" },
  error: { color: colors.danger, backgroundColor: "#fff1f1", padding: 11, borderRadius: 9, fontSize: 11 },
  footer: { color: colors.inkSoft, textAlign: "center", fontSize: 11, marginTop: 18 },
  link: { color: colors.plum, fontWeight: "800" },
  note: { color: colors.muted, textAlign: "center", fontSize: 8, letterSpacing: 1.4, marginTop: 25 },
});

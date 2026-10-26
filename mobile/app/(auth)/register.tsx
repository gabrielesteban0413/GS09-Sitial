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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      await register(email.trim(), password, fullName.trim());
      router.replace("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ImageBackground
            source={require("../../assets/analysis-bg.jpg")}
            style={styles.visual}
            imageStyle={styles.visualImage}
            resizeMode="cover"
          >
            <View style={styles.visualShade} />
            <OrbitRing size={215} color="rgba(255,255,255,0.2)" style={styles.orbit} />
            <Text style={styles.coordinate}>COORDENADAS DE TU PRÓXIMO PROYECTO</Text>
            <Text style={styles.visualTitle}>El lugar{`\n`}lo cambia todo.</Text>
          </ImageBackground>
          <View style={styles.card}>
            <Text style={styles.kicker}>NUEVA CUENTA</Text>
            <Text style={styles.heading}>Empieza con Sitial</Text>
            <Text style={styles.description}>Crea tu espacio de exploración comercial.</Text>
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName}
              placeholder="Tu nombre" placeholderTextColor={colors.muted} autoComplete="name" />
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              placeholder="tu@correo.com" placeholderTextColor={colors.muted} keyboardType="email-address"
              autoCapitalize="none" autoComplete="email" />
            <Text style={styles.label}>Contraseña</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword}
              placeholder="Crea una contraseña" placeholderTextColor={colors.muted} secureTextEntry
              autoComplete="new-password" />
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && styles.pressed, busy && styles.disabled]}
              onPress={() => void submit()}
              disabled={busy || !fullName.trim() || !email.trim() || !password}
            >
              {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
            </Pressable>
            <Text style={styles.footer}>
              ¿Ya tienes cuenta?{" "}
              <Link href="/(auth)/login" style={styles.link}>Iniciar sesión</Link>
            </Text>
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
    minHeight: 210,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    backgroundColor: colors.plum,
  },
  visualImage: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  visualShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(70,27,62,0.58)" },
  orbit: { right: -22, top: -106 },
  coordinate: { color: "#ead2e3", fontSize: 8, fontWeight: "700", letterSpacing: 1.4, marginBottom: 13 },
  visualTitle: { color: colors.white, fontSize: 33, fontWeight: "900", lineHeight: 35, letterSpacing: -0.6 },
  card: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kicker: { color: colors.plum, fontSize: 9, fontWeight: "800", letterSpacing: 1.6 },
  heading: { color: colors.ink, fontSize: 24, fontWeight: "800", marginTop: 8 },
  description: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 13 },
  label: { color: colors.ink, fontSize: 11, fontWeight: "700", marginTop: 11, marginBottom: 7 },
  input: {
    minHeight: 46,
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
    marginTop: 20,
    backgroundColor: colors.plum,
    shadowColor: colors.plum,
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
});

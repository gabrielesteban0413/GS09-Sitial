import { useState } from "react";
import {
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
import { useAuth } from "../../../src/context/AuthContext";
import { colors } from "../../../src/theme";

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function saveProfile() {
    const nameChanged = fullName.trim() !== user?.fullName;
    const passwordChanged = Boolean(currentPassword || newPassword);
    if (!nameChanged && !passwordChanged) {
      setError("No hay cambios para guardar.");
      return;
    }
    if (passwordChanged && (!currentPassword || !newPassword)) {
      setError("Para cambiar la contraseña completa ambos campos.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const savedName = fullName.trim();
      await updateUser({
        ...(nameChanged ? { fullName: savedName } : {}),
        ...(passwordChanged ? { currentPassword, newPassword } : {}),
      });
      setFullName(savedName);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Perfil actualizado", "Los cambios de tu cuenta se guardaron correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron guardar los cambios.");
    } finally {
      setBusy(false);
    }
  }

  function confirmLogout() {
    Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => void logout() },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <BrandHeader eyebrow="Cuenta y seguridad" title="Perfil" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.identity}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.fullName.trim().charAt(0).toUpperCase() || "S"}</Text></View>
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{user?.fullName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.status}>●  Cuenta activa</Text>
          </View>
          <Text style={styles.coordinates}>04°39′ N</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos de cuenta</Text>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName}
            placeholder="Nombre completo" placeholderTextColor={colors.muted} />
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.input, styles.readOnly]}><Text style={styles.readOnlyText}>{user?.email}</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seguridad</Text>
          <Text style={styles.label}>Contraseña actual</Text>
          <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword}
            secureTextEntry placeholder="Necesaria para cambiar la contraseña" placeholderTextColor={colors.muted} />
          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword}
            secureTextEntry placeholder="Deja vacío si no quieres cambiarla" placeholderTextColor={colors.muted} />
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.paymentKicker}>PAGOS Y SUSCRIPCIÓN</Text>
          <Text style={styles.cardTitle}>Sin pagos conectados</Text>
          <Text style={styles.paymentText}>
            Esta cuenta todavía no tiene un proveedor de pagos o plan de suscripción vinculado.
          </Text>
        </View>

        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, busy && styles.disabled]}
          onPress={() => void saveProfile()}
          disabled={busy}
        >
          <Text style={styles.saveText}>{busy ? "Guardando…" : "Guardar cambios"}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]} onPress={confirmLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
        <Text style={styles.footer}>SITIAL MOBILE · EXPLORACIÓN COMERCIAL</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, paddingTop: 7 },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  identity: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 17, padding: 16, backgroundColor: colors.ink },
  avatar: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "#d8efeb" },
  avatarText: { color: colors.tealDeep, fontSize: 19, fontWeight: "900" },
  identityCopy: { flex: 1 },
  name: { color: colors.white, fontSize: 13, fontWeight: "800" },
  email: { color: "#bdd2d0", fontSize: 9, marginTop: 3 },
  status: { color: "#9ce1c7", fontSize: 8, marginTop: 5 },
  coordinates: { color: "#8bbdb7", fontSize: 8, fontWeight: "700" },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 15, padding: 15, marginTop: 12, backgroundColor: colors.white },
  cardTitle: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  label: { color: colors.inkSoft, fontSize: 9, fontWeight: "700", marginTop: 13, marginBottom: 6 },
  input: { minHeight: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 11, color: colors.ink, fontSize: 10, backgroundColor: "#fcfdfd" },
  readOnly: { justifyContent: "center", backgroundColor: "#f3f7f6" },
  readOnlyText: { color: colors.muted, fontSize: 10 },
  paymentCard: { borderWidth: 1, borderColor: "#eadbea", borderRadius: 15, padding: 15, marginTop: 12, backgroundColor: colors.plumSoft },
  paymentKicker: { color: colors.plum, fontSize: 8, fontWeight: "800", letterSpacing: 1.2, marginBottom: 7 },
  paymentText: { color: colors.inkSoft, fontSize: 9, lineHeight: 14, marginTop: 5 },
  error: { color: colors.danger, backgroundColor: "#fff0f1", borderRadius: 8, padding: 9, fontSize: 10, marginTop: 10 },
  saveButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: colors.tealDeep, marginTop: 14 },
  saveText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  logoutButton: { minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 11, borderWidth: 1, borderColor: "#ead6d9", backgroundColor: "#fff8f8", marginTop: 8 },
  logoutText: { color: colors.danger, fontSize: 10, fontWeight: "800" },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.55 },
  footer: { color: colors.muted, textAlign: "center", fontSize: 8, letterSpacing: 1.2, marginTop: 20 },
});

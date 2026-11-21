import { Image, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "expo-router/drawer";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

export function SitialDrawerContent(props: DrawerContentComponentProps) {
  const { user } = useAuth();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.brand}>
        <View style={styles.brandMark}><Text style={styles.brandGlyph}>⌖</Text></View>
        <View>
          <Text style={styles.brandName}>SITIAL</Text>
          <Text style={styles.brandCaption}>INTELIGENCIA TERRITORIAL</Text>
        </View>
      </View>

      <View style={styles.account}>
        <View style={styles.avatar}>
          {user?.avatarUrl
            ? <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            : <Text style={styles.avatarText}>{user?.fullName.trim().charAt(0).toUpperCase() || "S"}</Text>}
        </View>
        <View style={styles.accountCopy}>
          <Text numberOfLines={1} style={styles.accountName}>{user?.fullName || "Tu espacio"}</Text>
          <Text numberOfLines={1} style={styles.accountEmail}>{user?.email || "Cuenta Sitial"}</Text>
        </View>
        <Ionicons name="ellipse" size={8} color={colors.success} />
      </View>

      <Text style={styles.sectionLabel}>ESPACIO DE TRABAJO</Text>
      <DrawerItemList {...props} />

      <View style={styles.footer}>
        <Ionicons name="location-outline" size={15} color="#bce4de" />
        <Text style={styles.footerText}>Decisiones conectadas al territorio</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingTop: 18, paddingBottom: 18, backgroundColor: colors.ink },
  brand: { flexDirection: "row", alignItems: "center", gap: 11, marginHorizontal: 21, marginBottom: 25 },
  brandMark: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.teal },
  brandGlyph: { color: colors.white, fontSize: 26, lineHeight: 31 },
  brandName: { color: colors.white, fontSize: 17, fontWeight: "900", letterSpacing: 1.5 },
  brandCaption: { color: "#a7c7c3", fontSize: 7, fontWeight: "800", letterSpacing: 1, marginTop: 2 },
  account: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 15, marginBottom: 24, padding: 12, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.08)" },
  avatar: { width: 38, height: 38, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 19, backgroundColor: "#d8efeb" },
  avatarImage: { width: 38, height: 38 },
  avatarText: { color: colors.tealDeep, fontSize: 16, fontWeight: "900" },
  accountCopy: { flex: 1 },
  accountName: { color: colors.white, fontSize: 11, fontWeight: "800" },
  accountEmail: { color: "#b7cbc9", fontSize: 8, marginTop: 3 },
  sectionLabel: { color: "#86a5a2", fontSize: 8, fontWeight: "900", letterSpacing: 1.2, marginHorizontal: 23, marginBottom: 5 },
  footer: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: "auto", paddingHorizontal: 21, paddingTop: 17, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  footerText: { color: "#b7cbc9", fontSize: 9, fontWeight: "600" },
});

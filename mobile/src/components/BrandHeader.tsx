import { Text, View, StyleSheet } from "react-native";
import { PulseDot } from "./GeoMotion";
import { colors } from "../theme";

export function BrandHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>⌖</Text>
      </View>
      <View style={styles.titleGroup}>
        <Text style={styles.brand}>SITIAL  /  {eyebrow.toUpperCase()}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.signal}><PulseDot color={colors.success} size={5} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 15,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  logoText: { color: "#bce4de", fontSize: 27, lineHeight: 31, fontWeight: "300" },
  titleGroup: { flex: 1 },
  brand: { color: colors.teal, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 20, fontWeight: "800", marginTop: 2 },
  signal: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mint,
  },
});

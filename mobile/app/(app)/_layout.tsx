import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SitialDrawerContent } from "../../src/components/SitialDrawerContent";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/theme";

export default function PrivateLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }
  if (!user) return <Redirect href="/(auth)/login" />;
  return (
    <Drawer
      drawerContent={(props) => <SitialDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        swipeEdgeWidth: 44,
        overlayColor: "rgba(9, 27, 29, 0.52)",
        drawerStyle: { width: 300, backgroundColor: colors.ink },
        drawerActiveTintColor: "#bce4de",
        drawerInactiveTintColor: "#b7cbc9",
        drawerActiveBackgroundColor: "rgba(188, 228, 222, 0.12)",
        drawerLabelStyle: { fontSize: 11, fontWeight: "700", marginLeft: -12 },
        drawerItemStyle: { borderRadius: 11, marginHorizontal: 12, marginVertical: 2 },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Mapa de oportunidades",
          title: "Mapa",
          drawerIcon: ({ color, size }) => <Ionicons name="map-outline" style={{ color }} size={size} />,
        }}
      />
      <Drawer.Screen
        name="analysis"
        options={{
          drawerLabel: "Análisis",
          title: "Análisis",
          drawerIcon: ({ color, size }) => <Ionicons name="analytics-outline" style={{ color }} size={size} />,
        }}
      />
      <Drawer.Screen
        name="layers"
        options={{
          drawerLabel: "Capas y proyectos",
          title: "Capas",
          drawerIcon: ({ color, size }) => <Ionicons name="layers-outline" style={{ color }} size={size} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: "Perfil",
          title: "Perfil",
          drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" style={{ color }} size={size} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper },
});

import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../../src/theme";

const glyphs: Record<string, string> = {
  index: "⌖",
  analysis: "◫",
  layers: "▤",
  profile: "◎",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tealDeep,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 64,
          paddingTop: 7,
          paddingBottom: 7,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: "700" },
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 20, lineHeight: 22 }}>{glyphs[route.name]}</Text>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Mapa" }} />
      <Tabs.Screen name="analysis" options={{ title: "Análisis" }} />
      <Tabs.Screen name="layers" options={{ title: "Capas" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}

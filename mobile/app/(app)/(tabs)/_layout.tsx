import { Tabs } from "expo-router";
import { Text, View } from "react-native";
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
          height: 69,
          paddingTop: 6,
          paddingBottom: 8,
          borderTopColor: "#e3ecea",
          borderTopWidth: 1,
          backgroundColor: colors.white,
          elevation: 12,
          shadowColor: colors.ink,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: "800" },
        tabBarIcon: ({ color, focused }) => (
          <View
            style={{
              width: 34,
              height: 27,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              backgroundColor: focused ? colors.mint : "transparent",
            }}
          >
            <Text style={{ color, fontSize: 19, lineHeight: 22 }}>{glyphs[route.name]}</Text>
          </View>
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

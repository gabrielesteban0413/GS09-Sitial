import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/theme";

export default function AuthLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }
  if (user) return <Redirect href="/(app)/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper },
});

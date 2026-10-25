import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { WorkspaceProvider } from "../src/context/WorkspaceContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#f4f8f7" } }} />
        </WorkspaceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

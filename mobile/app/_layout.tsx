import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { WorkspaceProvider } from "../src/context/WorkspaceContext";

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 450, fade: true });

export default function RootLayout() {
  useEffect(() => {
    const timeout = setTimeout(() => SplashScreen.hide(), 250);
    return () => clearTimeout(timeout);
  }, []);

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

import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const androidMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const iosMapsApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY;
  const plugins: NonNullable<ExpoConfig["plugins"]> = [...(config.plugins ?? [])];
  plugins.push([
    "expo-splash-screen",
    {
      backgroundColor: "#713869",
      image: "./assets/splash-auth-hero.png",
      imageWidth: 380,
      resizeMode: "cover",
      enableFullScreenImage_legacy: true,
    },
  ]);
  if (androidMapsApiKey || iosMapsApiKey) {
    plugins.push([
      "react-native-maps",
      {
        ...(androidMapsApiKey ? { androidGoogleMapsApiKey: androidMapsApiKey } : {}),
        ...(iosMapsApiKey ? { iosGoogleMapsApiKey: iosMapsApiKey } : {}),
      },
    ]);
  }

  return {
    ...config,
    name: "Sitial",
    slug: "sitial-mobile",
    scheme: "sitial",
    ios: {
      ...config.ios,
      bundleIdentifier: "com.sitial.mobile",
    },
    android: {
      ...config.android,
      package: "com.sitial.mobile",
    },
    plugins,
  };
};

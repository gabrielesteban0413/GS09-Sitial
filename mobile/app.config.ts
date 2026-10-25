import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const androidMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const iosMapsApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY;
  const plugins: NonNullable<ExpoConfig["plugins"]> = [...(config.plugins ?? [])];
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

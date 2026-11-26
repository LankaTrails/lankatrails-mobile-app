import type { ConfigContext, ExpoConfig } from "expo/config";

// Expo CLI loads .env before evaluating this file; EAS builds read the same names from eas.json / EAS env.
const env = process.env;
const googleMapsApiKey = env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
// Accept "name" or "name://" in .env; the config wants the bare scheme
const scheme = (env.EXPO_PUBLIC_SCHEME || "lankatrailsmobileapp").replace(/:\/\/$/, "");

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "LankaTrails",
  slug: "lankatrails-mobile-app",
  owner: "pkmst",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/logo.png",
  scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.pkmst.lankatrails",
    buildNumber: "1.0.0",
    config: {
      googleMapsApiKey,
    },
    infoPlist: {
      NSCameraUsageDescription: "This app uses the camera to allow photo uploads.",
      NSLocationWhenInUseUsageDescription: "LankaTrails needs location access to suggest nearby trails.",
      NSPhotoLibraryUsageDescription: "This app needs photo library access for profile pictures and trip images.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.pkmst.lankatrails",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/images/logo.png",
      backgroundColor: "#ffffff",
    },
    permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    config: {
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/logo.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "LankaTrails needs location access to suggest nearby trails and services.",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/logo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-web-browser",
    ["@stripe/stripe-react-native", { enableGooglePay: false }],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "d75fdd3e-e9d5-4ef7-a67b-7dac7117dd25",
    },
    // Readable at runtime through expo-constants (see utils/config.ts)
    apiUrl: env.EXPO_PUBLIC_API_URL,
    backendUrl: env.EXPO_PUBLIC_URL,
    stripePublishableKey: env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
});

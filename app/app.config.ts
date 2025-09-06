import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const baseConfig: ExpoConfig = {
    name: "Mapvoyage",
    slug: "mapvoyage",
    version: "0.13.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "eu.bruceroettgers.mapvoyage",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: "eu.bruceroettgers.mapvoyage",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon-colour.png",
        monochromeImage: "./assets/images/adaptive-icon-mono.png",
        backgroundColor: "#388659",
      },
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#388659",
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Show current location on map.",
        },
      ],
      "@maplibre/maplibre-react-native",
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "app",
          organization: "bcye",
        },
      ],
    ],
    experiments: {
      reactCompiler: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "fe4d6236-c3f4-432e-b7c8-0576787c58be",
      },
    },
    owner: "mapvoyage-org",
  };

  if (process.env.VARIANT === "development") {
    baseConfig.android!.package = "eu.bruceroettgers.mapvoyage.dev";
    baseConfig.ios!.bundleIdentifier = "eu.bruceroettgers.mapvoyage.dev";
    baseConfig.name = "Mapvoyage (Dev)";
  }

  return baseConfig;
};

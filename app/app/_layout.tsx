import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import "@/global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { init as initSentry } from "@sentry/react-native";
import { Stack } from "expo-router";
import { hide, preventAutoHideAsync } from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Linking } from "react-native";

// See https://docs.expo.dev/versions/latest/sdk/splash-screen/#usage for explanation on how this works
preventAutoHideAsync();

export default function Layout() {
  const [privacyConsent, setPrivacyConsent] = useState<boolean | null>(null);

  // App is restarted if this is change, so we can have it local
  const [sentryConsent, setSentryConsent] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("privacyConsent").then((v) => setPrivacyConsent(!!v));
    AsyncStorage.getItem("sentryConsent").then((v) =>
      setSentryConsent(!!parseInt(v ?? "0")),
    );
  }, []);

  useEffect(() => {
    if (sentryConsent) {
      console.log("Sentry consent given");
      initSentry({
        dsn: "https://d10c9861a757ad983925f6f01d4dde59@o4509253037850624.ingest.de.sentry.io/4509253068718160",

        beforeBreadcrumb(breadcrumb, hint) {
          // ensure no PII is sent via http breadcrumbs (path & query encodes PII)
          // IP storage is disabled server-side
          if (
            breadcrumb.category === "xhr" ||
            breadcrumb.category === "http" ||
            breadcrumb.category === "fetch"
          ) {
            if (breadcrumb.data?.url) {
              try {
                // Parse the URL to get just the origin
                const url = new URL(breadcrumb.data.url);
                breadcrumb.data.url = url.origin;
                return breadcrumb;
              } catch {
                console.error("url parsing failed for beforeBreadcrumb");
              }
            }

            // should we not be able to parse correctly, return null to be on the safe side
            return null;
          } else {
            return breadcrumb;
          }
        },

        enabled: !__DEV__,
      });
    }
  }, [sentryConsent]);

  if (!privacyConsent) {
    return (
      <GluestackUIProvider mode="light">
        <Box
          onLayout={hide}
          className="flex-1  justify-center items-center p-8"
        >
          <Heading size="2xl">Welcome to Mapvoyage</Heading>
          <Text className="m-4">
            By using this app you agree to our{" "}
            <Text
              underline
              onPress={() =>
                Linking.openURL("https://docs.mapvoyage.app/privacy.html")
              }
            >
              privacy policy
            </Text>
            . Data is only processed by European cloud providers.
          </Text>
          <Text className="m-4">
            If you allow for bug reporting, they will be processed on European
            servers by Sentry, an American company.
          </Text>
          <Button
            className="mt-8"
            onPress={() => {
              setPrivacyConsent(true);
              setSentryConsent(true);
              AsyncStorage.setItem("privacyConsent", "1");
              AsyncStorage.setItem("sentryConsent", "1");
            }}
          >
            <ButtonText>Allow Error Reports & Continue</ButtonText>
          </Button>
          <Button
            className="mt-4"
            onPress={() => {
              setPrivacyConsent(true);
              setSentryConsent(false);
              AsyncStorage.setItem("privacyConsent", "1");
              AsyncStorage.setItem("sentryConsent", "0");
            }}
          >
            <ButtonText>Disallow Error Reports & Continue</ButtonText>
          </Button>
        </Box>
      </GluestackUIProvider>
    );
  } else {
    return (
      <GluestackUIProvider mode="light">
        <Box onLayout={hide} className="flex-1">
          <Stack screenOptions={{ headerShown: false }} />
        </Box>
      </GluestackUIProvider>
    );
  }
}

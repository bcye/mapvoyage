import { Stack } from "expo-router";
import { hide, preventAutoHideAsync } from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { Button, Text, View } from "react-native-ui-lib";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import { PRIMARY_COLOR } from "@/utils/theme";
import { init as initSentry, wrap as wrapSentry } from "@sentry/react-native";

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
  });

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
              } catch (e) {
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
      <View
        onLayout={hide}
        padding-32
        style={{ justifyContent: "center", height: "100%" }}
      >
        <Text text40BL>Welcome to Mapvoyage</Text>
        <Text text70 marginT-8>
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
        <Text text70 marginT-8>
          If you allow for bug reporting, they will be processed on European
          servers by Sentry, an American company.
        </Text>

        <Button
          label="Allow Error Reports & Continue"
          backgroundColor={PRIMARY_COLOR}
          marginT-16
          onPress={() => {
            setPrivacyConsent(true);
            setSentryConsent(true);
            AsyncStorage.setItem("privacyConsent", "1");
            AsyncStorage.setItem("sentryConsent", "1");
          }}
        />
        <Button
          label="Disallow Error Reports & Continue"
          backgroundColor={PRIMARY_COLOR}
          marginT-8
          onPress={() => {
            setPrivacyConsent(true);
            setSentryConsent(false);
            AsyncStorage.setItem("privacyConsent", "1");
            AsyncStorage.setItem("sentryConsent", "0");
          }}
        />
      </View>
    );
  } else {
    return (
      <View onLayout={hide}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </View>
    );
  }
}

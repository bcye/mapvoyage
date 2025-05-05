import { ScrollRefProvider } from "@/utils/scroll-ref-context";
import { Region, useMapStore } from "@/utils/store";
import { trpc } from "@/utils/trpc";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  Camera,
  MapView,
  MarkerView,
  UserLocation,
  VectorSource,
} from "@maplibre/maplibre-react-native";
import { init as initSentry, wrap as wrapSentry } from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TouchableOpacity } from "react-native-ui-lib";

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

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${process.env.EXPO_PUBLIC_TRPC_BASE_URL}`,
    }),
  ],
});

/**
 * Root layout component that wraps the application with data providers and renders the main interface.
 *
 * This component provides the TRPC and QueryClient contexts for state and data management, and embeds a MapLayout that displays the map along with a bottom sheet containing the navigation stack.
 */

export default wrapSentry(function RootLayout() {
  const [fullscreen, setFullscreen] = useState(false);

  const stack = (
    <Stack
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPress={() => setFullscreen(!fullscreen)}>
            <MaterialCommunityIcons
              name={fullscreen ? "fullscreen-exit" : "fullscreen"}
              size={28}
              color="inherit"
            />
          </TouchableOpacity>
        ),
      }}
    />
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ScrollRefProvider>
          {!fullscreen ? <MapLayout>{stack}</MapLayout> : stack}
        </ScrollRefProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
});

const snapPoints = ["20%", "40%", "50%"];

/**
 * Renders a layout that integrates a full-screen map view with an overlaying bottom sheet.
 *
 * The component displays a map using MapTiler styles along with user location tracking and map tile sources.
 * It listens for the map's idle event to update the global map region state via the useMapStore hook.
 * The layout is wrapped in a gesture handler view to support touch interactions, and the supplied children
 * are rendered within the bottom sheet.
 *
 * @param children - The content to display inside the bottom sheet.
 * @returns A React element representing the combined map and bottom sheet layout.
 */
function MapLayout({ children }: { children: React.ReactNode }) {
  const { setRegion, markers } = useMapStore();
  const router = useRouter();

  function onIdle(state: Region) {
    console.log("Idle");
    setRegion(state);
  }

  console.log("markers", markers);

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        style={styles.map}
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
        onRegionDidChange={onIdle}
        regionDidChangeDebounceTime={200}
      >
        <UserLocation />
        <Camera />
        <VectorSource
          id="maptiler"
          url={`https://api.maptiler.com/tiles/v3/tiles.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
        />
        {markers.map((m, idx) =>
          m.long && m.lat ? (
            <MarkerView coordinate={[m.long, m.lat]} key={m.id}>
              <TouchableOpacity
                onPress={() => {
                  router.navigate(m.link + "?scrollTo=" + m.id);
                }}
                style={{ position: "relative", width: 22 }}
              >
                <Fontisto
                  name="map-marker"
                  size={28}
                  color={"red"}
                  style={{ zIndex: 1 }}
                />
                <Text
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 2,
                    textAlign: "center",
                    color: "white",
                    fontSize: 12,
                    fontWeight: "bold",
                    zIndex: 2,
                  }}
                >
                  {idx + 1}
                </Text>
              </TouchableOpacity>
            </MarkerView>
          ) : null,
        )}
      </MapView>
      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
      >
        {children}
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

import { useMapStore } from "@/utils/store";
import { trpc } from "@/utils/trpc";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  Camera,
  LocationPuck,
  MapState,
  MapView,
  VectorSource,
  setAccessToken,
} from "@rnmapbox/maps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <MapLayout>
          <Stack screenOptions={{}} />
        </MapLayout>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// set a stub access token as were using maptiler
setAccessToken?.("adsfwads");

const snapPoints = ["20%", "40%", "100%"];

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
  const { setRegion } = useMapStore();

  function onIdle(state: MapState) {
    setRegion(state.properties);
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
        onMapIdle={onIdle}
      >
        <Camera followUserLocation={true} />
        <LocationPuck visible={true} />
        <VectorSource
          id="maptiler"
          url={`https://api.maptiler.com/tiles/v3/tiles.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
        />
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

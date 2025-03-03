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

// The map is inside the layout component, such that the stack is inside the bottom sheet.

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

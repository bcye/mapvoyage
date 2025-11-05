import { Pressable } from "@/components/ui/pressable";
import { FullScreenProvider } from "@/hooks/use-is-fullscreen";
import useMoveTo, { CameraRefContext } from "@/hooks/use-move-to";
import { ScrollRefProvider, useBottomSheetRef } from "@/hooks/use-scroll-ref";
import { IconName } from "@/utils/icon.types";
import { Region, useMapStore } from "@/utils/store";
import { PRIMARY_COLOR } from "@/utils/theme";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  Camera,
  CameraRef,
  MapView,
  MarkerView,
  UserLocation,
  VectorSource,
} from "@maplibre/maplibre-react-native";
import {
  getCurrentPositionAsync,
  getLastKnownPositionAsync,
  LocationAccuracy,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { Stack, useRouter } from "expo-router";
import { MutableRefObject, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Card } from "@/components/ui/card";

/**
 * Root layout component that wraps the application with data providers and renders the main interface.
 *
 * This component provides the TRPC and QueryClient contexts for state and data management, and embeds a MapLayout that displays the map along with a bottom sheet containing the navigation stack.
 */
export default function RootLayout() {
  const [fullscreen, setFullscreen] = useState(false);

  const stack = (
    <Stack
      screenOptions={{
        headerRight: () => (
          <Pressable onPressIn={() => setFullscreen(!fullscreen)}>
            <MaterialCommunityIcons
              name={fullscreen ? "fullscreen-exit" : "fullscreen"}
              size={28}
              color="inherit"
            />
          </Pressable>
        ),
      }}
    />
  );

  return (
    <FullScreenProvider fullscreen={fullscreen}>
      <ScrollRefProvider>
        {!fullscreen ? <MapLayout>{stack}</MapLayout> : stack}
      </ScrollRefProvider>
    </FullScreenProvider>
  );
}

const snapPoints = ["20%", "40%", "50%"];
const initialSnapIndex = 1;

function getSheetPosition(snapIndex: number) {
  return (
    Dimensions.get("window").height *
    (parseInt(snapPoints[snapIndex].slice(0, 2)) / 100)
  );
}

/**
 * Renders a layout that integrates a full-screen map view with an overlaying bottom sheet.
 *
 * The component dis  console.log(query);
plays a map using MapTiler styles along with user location tracking and map tile sources.
 * It listens for the map's idle event to update the global map region state via the useMapStore hook.
 * The layout is wrapped in a gesture handler view to support touch interactions, and the supplied children
 * are rendered within the bottom sheet.
 *
 * @param children - The content to display inside the bottom sheet.
 * @returns A React element representing the combined map and bottom sheet layout.
 */
function MapLayout({ children }: { children: React.ReactNode }) {
  const { markers } = useMapStore();
  const router = useRouter();
  const bottomSheetRef = useBottomSheetRef();
  const [sheetHeight, setSheetHeight] = useState(() =>
    getSheetPosition(initialSnapIndex),
  );

  function onIdle(region: Region) {
    // we cant recenter if we override it here before the cameraRef is available.
    // so just skip it on the initial call
    cameraRef.current?.setCamera({});
  }

  function onSheetPositionChange(snapIndex: number) {
    setSheetHeight(getSheetPosition(snapIndex));
  }

  const cameraRef: MutableRefObject<null | CameraRef> = useRef(null);

  return (
    <CameraRefContext.Provider
      value={(lng, lat, zoom) => {
        cameraRef.current?.setCamera({
          centerCoordinate: [lng, lat],
          zoomLevel: zoom,
          animationDuration: 300,
        });
      }}
    >
      <GestureHandlerRootView style={styles.container}>
        <MapView
          style={styles.map}
          mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
          onRegionDidChange={onIdle}
          regionDidChangeDebounceTime={200}
          attributionPosition={{
            left: 8,
            top: 8,
          }}
        >
          {/* place labels pop in at 14 causing performance drop */}
          <Camera ref={cameraRef} maxZoomLevel={13.99} />
          <UserLocation />
          <VectorSource
            id="maptiler"
            url={`https://api.maptiler.com/tiles/v3/tiles.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
          />
          {markers.map((m, idx) =>
            m.long && m.lat ? (
              <MarkerView coordinate={[m.long, m.lat]} key={m.id}>
                <Pressable
                  onPressIn={() => {
                    router.setParams({ scrollTo: `${m.lat},${m.long}` });
                    router.navigate(m.link);
                  }}
                  className="relative w-6 z-50"
                >
                  <Fontisto
                    name="map-marker"
                    size={28}
                    color={m.type == "normal" ? "red" : PRIMARY_COLOR}
                    style={{ zIndex: 10 }}
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
                      zIndex: 20,
                    }}
                  >
                    {idx + 1}
                  </Text>
                </Pressable>
              </MarkerView>
            ) : null,
          )}
        </MapView>
        <GeolocateControl
          position={{
            top: 13,
            right: 13,
          }}
        />
        <BottomSheet
          index={initialSnapIndex}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          ref={bottomSheetRef}
          onChange={onSheetPositionChange}
        >
          {children}
        </BottomSheet>
      </GestureHandlerRootView>
    </CameraRefContext.Provider>
  );
}

type Position = Partial<{
  left: number;
  top: number;
  right: number;
  bottom: number;
}>;

function MapControl({
  position,
  onPress,
  icon,
  color,
}: {
  icon: IconName;
  position: Position;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Card
      className="w-12 h-12 rounded-lg absolute flex-1 p-0"
      style={{
        ...position,
      }}
    >
      <Pressable
        onPress={onPress}
        className="justify-center items-center flex-1"
      >
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </Pressable>
    </Card>
  );
}

function GeolocateControl({ position }: { position: Position }) {
  const moveTo = useMoveTo();
  async function onGeolocate() {
    const { granted } = await requestForegroundPermissionsAsync();
    if (!granted) return;

    let location = await getLastKnownPositionAsync();
    if (!location)
      location = await getCurrentPositionAsync({
        accuracy: LocationAccuracy.Low,
      });

    moveTo(location.coords.longitude, location.coords.latitude, 13);
  }

  return (
    <MapControl
      position={position}
      icon="crosshairs-gps"
      onPress={onGeolocate}
    />
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

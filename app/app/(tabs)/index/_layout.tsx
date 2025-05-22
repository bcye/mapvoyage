import { CurrentIdContext } from "@/hooks/use-current-id";
import { FullScreenProvider } from "@/hooks/use-is-fullscreen";
import { CameraRefContext } from "@/hooks/use-move-to";
import { ScrollRefProvider, useBottomSheetRef } from "@/hooks/use-scroll-ref";
import { Bbox } from "@/types/maptiler";
import { IconName } from "@/utils/icon.types";
import { Region, useMapStore } from "@/utils/store";
import { trpc } from "@/utils/trpc";
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
import {
  MutableRefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dimensions, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Card, TouchableOpacity } from "react-native-ui-lib";
import { useDebounce } from "use-debounce";

/**
 * Root layout component that wraps the application with data providers and renders the main interface.
 *
 * This component provides the TRPC and QueryClient contexts for state and data management, and embeds a MapLayout that displays the map along with a bottom sheet containing the navigation stack.
 */
export default function RootLayout() {
  const [fullscreen, setFullscreen] = useState(false);

  const { region } = useMapStore();
  const [dRegion] = useDebounce(region, 200);

  const query = useMemo(() => {
    if (dRegion) {
      const [lng, lat] = dRegion.geometry.coordinates;
      // construct a bounding box from the visible bounds
      const [ne, sw] = dRegion.properties.visibleBounds;
      const bbox: Bbox = [sw[0], sw[1], ne[0], ne[1]];
      return {
        bbox,
        latLng: [lat, lng] as [number, number],
      };
    } else return undefined;
  }, [dRegion]);
  // @ts-ignore query is not run when undefined so ok
  const idQuery = trpc.getPage.useQuery(query, {
    enabled: !!query,
  });

  const stack = (
    <Stack
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPressIn={() => setFullscreen(!fullscreen)}>
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
    <CurrentIdContext.Provider value={idQuery.data ?? null}>
      <FullScreenProvider fullscreen={fullscreen}>
        <ScrollRefProvider>
          {!fullscreen ? <MapLayout>{stack}</MapLayout> : stack}
        </ScrollRefProvider>
      </FullScreenProvider>
    </CurrentIdContext.Provider>
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
  const { setRegion, markers, region } = useMapStore();
  const router = useRouter();
  const bottomSheetRef = useBottomSheetRef();
  const [sheetHeight, setSheetHeight] = useState(() =>
    getSheetPosition(initialSnapIndex),
  );

  function onIdle(region: Region) {
    // we cant recenter if we override it here before the cameraRef is available.
    // so just skip it on the initial call
    cameraRef.current?.setCamera({});
    setRegion(region);
  }

  useLayoutEffect(function recenterOnRegion() {
    if (region) {
      // kind of a hack, the camera is not immediately available and when it is region will already be overriden via onIdle
      // so we wait for a frame and then move back to the region
      requestAnimationFrame(() => {
        cameraRef.current?.setCamera({
          centerCoordinate: region.geometry.coordinates,
          zoomLevel: region.properties.zoomLevel,
          animationDuration: 0,
        });
      });
    }
  }, []);

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
          <Camera ref={cameraRef} />
          <UserLocation />
          <VectorSource
            id="maptiler"
            url={`https://api.maptiler.com/tiles/v3/tiles.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
          />
          {markers.map((m, idx) =>
            m.long && m.lat ? (
              <MarkerView coordinate={[m.long, m.lat]} key={m.id}>
                <TouchableOpacity
                  onPressIn={() => {
                    console.log("navigating");
                    router.navigate(m.link + "?scrollTo=" + m.id);
                  }}
                  style={{ position: "relative", width: 22, zIndex: 1000 }}
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
        <GeolocateControl
          position={{
            bottom: sheetHeight + 4,
            right: 13,
          }}
          cameraRef={cameraRef}
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
      width={32}
      height={32}
      borderRadius={8}
      style={{
        position: "absolute",
        ...position,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </Card>
  );
}

function GeolocateControl({
  cameraRef,
  position,
}: {
  cameraRef: MutableRefObject<CameraRef | null>;
  position: Position;
}) {
  async function onGeolocate() {
    const { granted } = await requestForegroundPermissionsAsync();
    if (!granted) return;

    let location = await getLastKnownPositionAsync();
    if (!location)
      location = await getCurrentPositionAsync({
        accuracy: LocationAccuracy.Low,
      });

    cameraRef.current?.setCamera({
      centerCoordinate: [location.coords.longitude, location.coords.latitude],
      zoomLevel: 13,
      animationDuration: 300,
    });
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

import Infobox from "@/components/infobox";
import {
  Camera,
  LocationPuck,
  MapState,
  MapView,
  VectorSource,
  setAccessToken,
} from "@rnmapbox/maps";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// set a stub access token as were using maptiler
setAccessToken?.("adsfwads");

export default function Index() {
  const [region, setRegion] = useState<MapState["properties"] | null>(null);

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
      {region && <Infobox region={region} />}
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

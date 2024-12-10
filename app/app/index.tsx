import Infobox from "@/components/infobox";
import { Region } from "@/types/geo";
import { LocationPuck, MapView, VectorSource } from "@rnmapbox/maps";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function Index() {
  const [region, setRegion] = useState<Region | null>(null);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        regionDidChangeDebounceTime={500}
        onRegionDidChange={setRegion}
      >
        <LocationPuck />
        <VectorSource
          url={`https://api.maptiler.com/maps/streets-v2/tiles.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY!}`}
        ></VectorSource>
      </MapView>
      {region && <Infobox region={region} />}
    </View>
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

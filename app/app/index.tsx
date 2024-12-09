import Infobox from "@/components/infobox";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Region } from "react-native-maps";

export default function Index() {
  const [region, setRegion] = useState<Region | null>(null);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onRegionChangeComplete={(region) => setRegion(region)}
      />
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

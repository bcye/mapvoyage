import Infobox from "@/components/infobox";
import { useMapStore } from "@/utils/store";
import { View } from "react-native";

export default function Index() {
  const { region } = useMapStore();

  return region ? <Infobox region={region} /> : <View />;
}

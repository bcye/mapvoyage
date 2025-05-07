import Infobox from "@/components/infobox";
import { useMapStore } from "@/utils/store";
import { View } from "react-native";

/**
 * Renders the main index component.
 *
 * Retrieves the current region from the map store and conditionally displays an Infobox with the region details.
 * If no region is available, it returns an empty view.
 *
 * @returns A React element representing either the Infobox with region information or an empty view.
 */
export default function Index() {
  const { region } = useMapStore();

  return region ? <Infobox region={region} /> : <View />;
}

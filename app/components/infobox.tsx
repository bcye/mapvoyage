import { trpc } from "@/utils/trpc";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { MapState } from "@rnmapbox/maps";
import { Bbox } from "@server/types/maptiler";
import { useMemo } from "react";
import { Text } from "react-native";
import { useDebounce } from "use-debounce";

const snapPoints = ["20%", "40%", "100%"];

export default function Infobox({
  region,
}: {
  region: MapState["properties"];
}) {
  const [dRegion] = useDebounce(region, 200);
  const [lng, lat] = dRegion.center;
  // construct a bounding box from the visible bounds
  const { ne, sw } = dRegion.bounds;
  const bbox: Bbox = [sw[0], sw[1], ne[0], ne[1]];

  const query = useMemo(
    () => ({
      bbox,
      latLng: [lat, lng] as [number, number],
    }),
    [dRegion.center, dRegion.bounds],
  );
  const wikiQuery = trpc.getPage.useQuery(query);
  console.log(wikiQuery);

  return (
    <BottomSheet index={1} snapPoints={snapPoints} enableDynamicSizing={false}>
      <BottomSheetScrollView>
        <Text>{wikiQuery.data?.title ?? "Loading"}</Text>
        <Text>{wikiQuery.data?.wikitext ?? "Loading"}</Text>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

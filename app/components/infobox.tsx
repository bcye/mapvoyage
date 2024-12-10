import { Region } from "@/types/geo";
import { trpc } from "@/utils/trpc";
import { MapState } from "@rnmapbox/maps";
import { Bbox } from "@server/types/maptiler";
import { useMemo } from "react";
import { useDebounce } from "use-debounce";

export default function Infobox({
  region,
}: {
  region: MapState["properties"];
}) {
  const [dRegion] = useDebounce(region, 1000);
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

  return null;
}

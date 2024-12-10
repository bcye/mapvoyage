import { Region } from "@/types/geo";
import { trpc } from "@/utils/trpc";
import { Bbox } from "@server/types/maptiler";
import { useMemo } from "react";
import { useDebounce } from "use-debounce";

export default function Infobox({ region }: { region: Region }) {
  const [lng, lat] = region.geometry.coordinates;
  // construct a bounding box from the visible bounds
  const [ne, sw] = region.properties.visibleBounds;
  const bbox: Bbox = [sw[0], sw[1], ne[0], ne[1]];

  const query = useMemo(
    () => ({
      bbox,
      latLng: [lat, lng] as [number, number],
    }),
    [region],
  );
  const wikiQuery = trpc.getPage.useQuery(query);

  console.log(wikiQuery);

  return null;
}

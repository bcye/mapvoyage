import { trpc } from "@/utils/trpc";
import { Bbox } from "@server/types/maptiler";
import { useEffect, useMemo } from "react";
import { Region } from "react-native-maps";
import { useDebounce } from "use-debounce";

export default function Infobox({ region }: { region: Region }) {
  const [dRegion] = useDebounce(region, 200);
  const query = useMemo(
    () => ({
      bbox: [
        dRegion.longitude - dRegion.longitudeDelta,
        dRegion.latitude - dRegion.latitudeDelta,
        dRegion.longitude + dRegion.longitudeDelta,
        dRegion.latitude + dRegion.latitudeDelta,
      ] as Bbox,
      latLng: [dRegion.latitude, dRegion.longitude] as [number, number],
    }),
    [dRegion],
  );
  const wikiQuery = trpc.getPage.useQuery(query);

  console.log(wikiQuery);

  return null;
}

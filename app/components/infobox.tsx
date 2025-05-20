import PageRootView from "@/app/(tabs)/index/page/[pageId]/_page-root-view";
import useWikiQuery from "@/hooks/use-wiki-query";
import { Bbox } from "@/types/maptiler";
import { Region } from "@/utils/store";
import { trpc } from "@/utils/trpc";
import { Stack } from "expo-router";
import React, { useMemo } from "react";
import { View } from "react-native-ui-lib";
import { useDebounce } from "use-debounce";
/**
 * Displays an information bx using the provided map region.
 *
 * The Infobox component debounces the region data, constructs a bounding box and coordinate pair from the region's
 * center and bounds, and uses these values to fetch page details via a TRPC query. While the query is in progress,
 * a skeleton view is displayed. Once the data is successfully retrieved, the component sets the screen title to the
 * page's title and renders multiple Infocard components for sections like "Understand", "History", "See", "Eat", and "Drink".
 *
 * @param region - The map region properties, including the center coordinates and visible bounds.
 */
export default function Infobox({ region }: { region: Region }) {
  const [dRegion] = useDebounce(region, 200);
  const [lng, lat] = dRegion.geometry.coordinates;
  // construct a bounding box from the visible bounds
  const [ne, sw] = dRegion.properties.visibleBounds;
  const bbox: Bbox = [sw[0], sw[1], ne[0], ne[1]];

  const query = useMemo(
    () => ({
      bbox,
      latLng: [lat, lng] as [number, number],
    }),
    [lat, lng, ne, sw],
  );
  const idQuery = trpc.getPage.useQuery(query);
  const wikiQuery = useWikiQuery(idQuery.data);

  return (
    <View padding-8 flex>
      <Stack.Screen
        options={{ title: wikiQuery.data?.properties.title ?? "Loading" }}
      />
      <PageRootView pageQuery={wikiQuery} id={idQuery.data} />
    </View>
  );
}

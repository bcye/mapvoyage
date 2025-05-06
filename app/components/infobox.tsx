import useWikiQuery from "@/hooks/use-wiki-query";
import { Bbox } from "@/types/maptiler";
import { NodeType } from "@/types/nodes";
import { Region } from "@/utils/store";
import { trpc } from "@/utils/trpc";
import { Link, Stack } from "expo-router";
import React, { useMemo } from "react";
import { Card, GridList, SkeletonView, View } from "react-native-ui-lib";
import { useDebounce } from "use-debounce";
/**
 * Displays an information box using the provided map region.
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
      <SkeletonView
        template={SkeletonView.templates.LIST_ITEM}
        showContent={wikiQuery.isSuccess}
        renderContent={() =>
          !!wikiQuery.data && (
            <GridList
              data={wikiQuery.data.children.filter(
                (c) => c.type === NodeType.Section,
              )}
              numColumns={2}
              itemSpacing={8}
              renderItem={({ item }) => (
                <Infocard
                  title={item.properties.title}
                  pageId={idQuery.data!}
                />
              )}
            />
          )
        }
      />
    </View>
  );
}

/**
 * Renders a clickable infocard that links to a specific page section.
 *
 * This component creates a card-based link that navigates to a dynamic route structured as "/page/[pageId]/section/[title]".
 * The card displays the provided title, offering a concise navigational element within the app.
 *
 * @param title - The title displayed on the card and used as part of the destination route.
 * @param pageId - The identifier for the page, used to construct the dynamic navigation route.
 */
function Infocard({ title, pageId }: { title: string; pageId: string }) {
  return (
    <Link
      asChild
      href={{
        pathname: "/page/[pageId]/section/[title]",
        params: { pageId, title },
      }}
    >
      <Card flex padding-12 height={48}>
        <Card.Section content={[{ text: title, text60: true, grey10: true }]} />
      </Card>
    </Link>
  );
}

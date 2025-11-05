import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading/index";
import { Text } from "@/components/ui/text";
import { useIsFullscreen } from "@/hooks/use-is-fullscreen";
import { getCityAtom } from "@/utils/bookmarks";
import { MapMarker, MarkerType, useMapStore } from "@/utils/store";
import { NodeType, RootNode } from "@bcye/structured-wikivoyage-types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { UseQueryResult } from "@tanstack/react-query";
import { Link, Route, Stack } from "expo-router";
import { useAtomValue } from "jotai/react";
import { filter, map, split, splitEvery } from "ramda";
import { useEffect } from "react";
import { ScrollView } from "react-native";

function PageContent({
  pageQuery,
  id,
}: {
  pageQuery: UseQueryResult<RootNode, Error>;
  id: string;
}) {
  const bookmarks = useAtomValue(getCityAtom(id));
  const registerMarker = useMapStore((s) => s.registerMarker);
  const deregisterMarker = useMapStore((s) => s.deregisterMarker);

  useEffect(
    function registerBookmarks() {
      const markers: MapMarker[] = [];
      for (const [bId, bookmark] of Object.entries(bookmarks)) {
        const [lat, long] = map(parseFloat, split(",", bId));
        const marker: MapMarker = {
          id: bId,
          // somehow broken else
          link: `/main/explore/page/${id}/section/${bookmark.section}` as Route,
          lat,
          long,
          type: MarkerType.Bookmark,
        };
        markers.push(marker);
        registerMarker(marker);
      }

      return () => {
        for (const marker of markers) {
          deregisterMarker(marker);
        }
      };
    },
    [bookmarks, id, registerMarker, deregisterMarker],
  );

  return map(
    ([item1, item2]) => (
      <Box
        className="flex-1 flex-row gap-2 mb-2"
        key={item1.properties.title + item2?.properties.title}
      >
        <Infocard title={item1.properties.title} pageId={id!} />
        {item2 && <Infocard title={item2.properties.title} pageId={id!} />}
      </Box>
    ),
    splitEvery(
      2,
      filter((c) => c.type === NodeType.Section, pageQuery.data!.children),
    ),
  );
}

export default function PageRootView({
  pageQuery,
  id,
}: {
  pageQuery: UseQueryResult<RootNode, Error>;
  id: string | null;
}) {
  const isFullscreen = useIsFullscreen();

  return (
    <Box className="p-2 flex-1">
      <Stack.Screen
        options={{ title: pageQuery.data?.properties.title ?? "Loading" }}
      />
      {pageQuery.error ? (
        <Text className="text-sm color-red-700">
          A network error occured and the place information could not be loaded.
        </Text>
      ) : pageQuery.data && id ? (
        !isFullscreen ? (
          <BottomSheetScrollView>
            <PageContent id={id} pageQuery={pageQuery} />
          </BottomSheetScrollView>
        ) : (
          <ScrollView>
            <PageContent id={id} pageQuery={pageQuery} />
          </ScrollView>
        )
      ) : null}
    </Box>
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
    <Card className="flex-1 py-2 px-3">
      <Link
        asChild
        href={{
          pathname: "/main/explore/page/[pageId]/section/[title]",
          params: { pageId, title },
        }}
      >
        <Heading size="xl">{title}</Heading>
      </Link>
    </Card>
  );
}

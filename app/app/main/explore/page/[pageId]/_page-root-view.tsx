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
import { Card, SkeletonView, Text, View } from "react-native-ui-lib";

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
      <View
        flex
        row
        gap-8
        marginB-8
        key={item1.properties.title + item2?.properties.title}
      >
        <Infocard title={item1.properties.title} pageId={id!} />
        {item2 && <Infocard title={item2.properties.title} pageId={id!} />}
      </View>
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
    <View padding-8 flex>
      <Stack.Screen
        options={{ title: pageQuery.data?.properties.title ?? "Loading" }}
      />
      <SkeletonView
        template={SkeletonView.templates.LIST_ITEM}
        showContent={pageQuery.isSuccess}
        renderContent={() =>
          pageQuery.error ? (
            <Text color="red" text60>
              A network error occured and the place information could not be
              loaded.
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
          ) : null
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
        pathname: "/main/explore/page/[pageId]/section/[title]",
        params: { pageId, title },
      }}
    >
      <Card flex padding-12 height={48}>
        <Card.Section content={[{ text: title, text60: true, grey10: true }]} />
      </Card>
    </Link>
  );
}

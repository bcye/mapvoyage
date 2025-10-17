import { getCityAtom } from "@/utils/bookmarks";
import { MapMarker, MarkerType, useMapStore } from "@/utils/store";
import { NodeType, RootNode } from "@bcye/structured-wikivoyage-types";
import { UseQueryResult } from "@tanstack/react-query";
import { Link, Route } from "expo-router";
import { useAtomValue } from "jotai/react";
import { filter, map, split, splitEvery } from "ramda";
import { useEffect } from "react";
import { Card, View } from "react-native-ui-lib";

/**
 * Shared page content component that displays section cards and registers bookmark markers.
 */
export function PageContent({
  pageQuery,
  id,
  basePath,
}: {
  pageQuery: UseQueryResult<RootNode, Error>;
  id: string;
  basePath: string;
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
          link: `${basePath}/${id}/section/${bookmark.section}` as Route,
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
    [bookmarks, id, registerMarker, deregisterMarker, basePath],
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
        <Infocard
          title={item1.properties.title}
          pageId={id!}
          basePath={basePath}
        />
        {item2 && (
          <Infocard
            title={item2.properties.title}
            pageId={id!}
            basePath={basePath}
          />
        )}
      </View>
    ),
    splitEvery(
      2,
      filter((c) => c.type === NodeType.Section, pageQuery.data!.children),
    ),
  );
}

/**
 * Renders a clickable infocard that links to a specific page section.
 */
function Infocard({
  title,
  pageId,
  basePath,
}: {
  title: string;
  pageId: string;
  basePath: string;
}) {
  return (
    <Link
      asChild
      href={{
        pathname: `${basePath}/[pageId]/section/[title]`,
        params: { pageId, title },
      }}
    >
      <Card flex padding-12 height={48}>
        <Card.Section content={[{ text: title, text60: true, grey10: true }]} />
      </Card>
    </Link>
  );
}

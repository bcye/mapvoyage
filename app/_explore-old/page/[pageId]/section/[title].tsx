import WikiContent from "@/components/render-node";
import useBackOnMapMove from "@/hooks/use-back-on-map-move";
import { useIsFullscreen } from "@/hooks/use-is-fullscreen";
import { useScrollRef } from "@/hooks/use-scroll-ref";
import useWikiQuery from "@/hooks/use-wiki-query";
import { citiesAtom, getCityAtom } from "@/utils/bookmarks";
import { NodeType, SectionNode } from "@bcye/structured-wikivoyage-types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAtom } from "jotai/react";
import { append, assoc, dissoc } from "ramda";
import { useCallback } from "react";
import { ScrollView } from "react-native";
import { SkeletonView, View } from "react-native-ui-lib";
import { toast } from "sonner-native";

/**
 * Renders a specific section of a Wikipedia page in Markdown format.
 *
 * The component retrieves the page title and ID from local search parameters, fetches the page's wikitext
 * via a TRPC query, and then extracts and converts the designated section—identified by the title—to Markdown.
 * It slices off the section header from the converted Markdown and displays a skeleton view while the content loads.
 */
export default function Section() {
  const { title, pageId } = useLocalSearchParams();
  const wikiQuery = useWikiQuery(pageId as string);
  const section = wikiQuery.data?.children.find(
    (c) => c.type === NodeType.Section && c.properties.title === title,
  ) as SectionNode | undefined;
  const ref = useScrollRef();
  const isFullscreen = useIsFullscreen();
  const [bookmarks, setBookmarks] = useAtom(getCityAtom(pageId as string));
  const [cities, setCities] = useAtom(citiesAtom);
  const pageTitle = wikiQuery.data?.properties.title;

  const isBookmarked = useCallback(
    function isBookmarked(id: string) {
      return !!bookmarks[id];
    },
    [bookmarks],
  );

  const toggleBookmarked = useCallback(
    function toggleBookmarked(id: string) {
      if (id == ",") {
        toast.error(
          "This listing doesn't have a location and can't be bookmarked. Add one on en.wikivoyage.org",
        );
        return;
      }

      if (isBookmarked(id)) {
        setBookmarks(dissoc(id, bookmarks));
      } else {
        if (!cities.find((c) => c.qid === pageId)) {
          setCities(
            append({ qid: pageId as string, name: pageTitle! }, cities),
          );
        }
        // no valid lat-lng
        setBookmarks(
          assoc(
            id,
            { section: title, properties: section!.properties },
            bookmarks,
          ),
        );
      }
    },
    [
      bookmarks,
      setBookmarks,
      section,
      isBookmarked,
      pageTitle,
      cities,
      setCities,
      pageId,
      title,
    ],
  );

  useBackOnMapMove(wikiQuery.isSuccess);

  if (!section) return null;

  return (
    <View padding-8 flex>
      <Stack.Screen options={{ title: section.properties.title }} />
      <SkeletonView
        template={SkeletonView.templates.TEXT_CONTENT}
        showContent={wikiQuery.isSuccess}
        renderContent={() =>
          !isFullscreen ? (
            <BottomSheetScrollView ref={ref}>
              <WikiContent
                node={section}
                root={true}
                isBookmarked={isBookmarked}
                toggleBookmarked={toggleBookmarked}
              />
            </BottomSheetScrollView>
          ) : (
            <ScrollView>
              <WikiContent
                node={section}
                root={true}
                isBookmarked={isBookmarked}
                toggleBookmarked={toggleBookmarked}
              />
            </ScrollView>
          )
        }
      />
    </View>
  );
}

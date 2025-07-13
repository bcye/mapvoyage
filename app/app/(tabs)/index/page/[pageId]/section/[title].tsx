import WikiContent from "@/components/render-node";
import useWikiQuery from "@/hooks/use-wiki-query";
import { useIsFullscreen } from "@/hooks/use-is-fullscreen";
import { useScrollRef } from "@/hooks/use-scroll-ref";
import { NodeType, SectionNode } from "@bcye/structured-wikivoyage-types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { SkeletonView, View } from "react-native-ui-lib";
import useBackOnMapMove from "@/hooks/use-back-on-map-move";
import { citiesAtom, getCityAtom } from "@/utils/bookmarks";
import { useAtom } from "jotai/react";
import { useCallback } from "react";

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

  const isBookmarked = useCallback(function isBookmarked(id: string) { return bookmarks.some(b => b.id === id) }, [bookmarks]);
  const toggleBookmarked = useCallback(function toggleBookmarked(id: string) {
    if (isBookmarked(id)) {
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } else {
      if (!cities.find(c => c.qid === pageId)) {
        setCities([...cities, { qid: pageId as string, name: pageTitle! }])
      }
      setBookmarks([...bookmarks, { id, section: title, properties: section!.properties }]);
    }
  }, [bookmarks, setBookmarks, pageTitle, section, isBookmarked, pageTitle, cities, setCities]);

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
              <WikiContent node={section} root={true} isBookmarked={isBookmarked} toggleBookmarked={toggleBookmarked} />
            </BottomSheetScrollView>
          ) : (
            <ScrollView>
              <WikiContent node={section} root={true} isBookmarked={isBookmarked} toggleBookmarked={toggleBookmarked} />
            </ScrollView>
          )
        }
      />
    </View>
  );
}

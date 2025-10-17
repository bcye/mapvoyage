import WikiContent from "@/components/render-node";
import { useScrollRef } from "@/hooks/use-scroll-ref";
import useWikiQuery from "@/hooks/use-wiki-query";
import { citiesAtom, getCityAtom } from "@/utils/bookmarks";
import { NodeType, SectionNode } from "@bcye/structured-wikivoyage-types";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAtom } from "jotai/react";
import { append, assoc, dissoc } from "ramda";
import { useCallback } from "react";
import { ScrollView } from "react-native";
import { SkeletonView, View } from "react-native-ui-lib";
import { toast } from "sonner-native";

/**
 * Renders a specific section of a Wikipedia page in fullscreen mode.
 * This is used for pages without geographic data.
 */
export default function FullscreenSection() {
  const { title, pageId } = useLocalSearchParams();
  const wikiQuery = useWikiQuery(pageId as string);
  const section = wikiQuery.data?.children.find(
    (c) => c.type === NodeType.Section && c.properties.title === title,
  ) as SectionNode | undefined;
  const ref = useScrollRef();
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

  if (!section) return null;

  return (
    <View padding-8 flex>
      <Stack.Screen options={{ title: section.properties.title }} />
      <SkeletonView
        template={SkeletonView.templates.TEXT_CONTENT}
        showContent={wikiQuery.isSuccess}
        renderContent={() => (
          <ScrollView ref={ref}>
            <WikiContent
              node={section}
              root={true}
              isBookmarked={isBookmarked}
              toggleBookmarked={toggleBookmarked}
            />
          </ScrollView>
        )}
      />
    </View>
  );
}

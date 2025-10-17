import WikiContent from "@/components/render-node";
import { useScrollRef } from "@/hooks/use-scroll-ref";
import useWikiQuery from "@/hooks/use-wiki-query";
import { NodeType, SectionNode } from "@bcye/structured-wikivoyage-types";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollContainer } from "../../../_shared/scroll-container";
import { useSectionBookmarks } from "../../../_shared/use-section-bookmarks";
import { SkeletonView, View } from "react-native-ui-lib";

/**
 * Renders a specific section of a Wikipedia page.
 */
export default function Section() {
  const { title, pageId } = useLocalSearchParams();
  const wikiQuery = useWikiQuery(pageId as string);
  const section = wikiQuery.data?.children.find(
    (c) => c.type === NodeType.Section && c.properties.title === title,
  ) as SectionNode | undefined;
  const ref = useScrollRef();
  const pageTitle = wikiQuery.data?.properties.title;

  const { isBookmarked, toggleBookmarked } = useSectionBookmarks(
    pageId as string,
    title,
    section,
    pageTitle,
  );

  if (!section) return null;

  return (
    <View padding-8 flex>
      <Stack.Screen options={{ title: section.properties.title }} />
      <SkeletonView
        template={SkeletonView.templates.TEXT_CONTENT}
        showContent={wikiQuery.isSuccess}
        renderContent={() => (
          <ScrollContainer scrollRef={ref}>
            <WikiContent
              node={section}
              root={true}
              isBookmarked={isBookmarked}
              toggleBookmarked={toggleBookmarked}
            />
          </ScrollContainer>
        )}
      />
    </View>
  );
}

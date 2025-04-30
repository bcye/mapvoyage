import WikiContent from "@/components/render-node";
import useWikiQuery from "@/hooks/use-wiki-query";
import { useScrollRef } from "@/utils/scroll-ref-context";
import { NodeType, SectionNode } from "@bcye/structured-wikivoyage-types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Stack, useLocalSearchParams } from "expo-router";
import { SkeletonView, View } from "react-native-ui-lib";

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
  if (!section) return null;

  return (
    <View padding-8 flex>
      <Stack.Screen options={{ title: section.properties.title }} />
      <SkeletonView
        template={SkeletonView.templates.TEXT_CONTENT}
        showContent={wikiQuery.isSuccess}
        renderContent={() => (
          <BottomSheetScrollView ref={ref}>
            <WikiContent node={section} root={true} />
          </BottomSheetScrollView>
        )}
      />
    </View>
  );
}

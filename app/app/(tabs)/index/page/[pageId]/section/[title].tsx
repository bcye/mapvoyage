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
              <WikiContent node={section} root={true} />
            </BottomSheetScrollView>
          ) : (
            <ScrollView>
              <WikiContent node={section} root={true} />
            </ScrollView>
          )
        }
      />
    </View>
  );
}

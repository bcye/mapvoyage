import WikiContent from "@/components/render-node";
import useWikiQuery from "@/hooks/use-wiki-query";
import { NodeType, SectionNode } from "@bcye/structured-wikivoyage-types";
import { useMapStore } from "@/utils/store";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
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
  /* const wikiQuery = useQuery({
    queryKey: ["wikitext", pageId],
    queryFn: () =>
      fetch(`https://mapvoyage.b-cdn.net/en/${pageId}.wiki.txt`).then((r) =>
        r.text(),
      ),
  }); */
  const wikiQuery = useWikiQuery(pageId as string);
  const section = wikiQuery.data?.children.find(
    (c) => c.type === NodeType.Section && c.properties.title === title,
  ) as SectionNode | undefined;
  const ref = useRef(null);
  const setRef = useMapStore((s) => s.setContentScrollRef);
  useEffect(() => {
    setRef(ref);
    return () => {
      setRef(null);
    };
  }, []);
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

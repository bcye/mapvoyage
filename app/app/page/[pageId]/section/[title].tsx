import { trpc } from "@/utils/trpc";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import Markdown from "react-native-markdown-display";
import { SkeletonView, View } from "react-native-ui-lib";
import mdPlugin from "wtf-plugin-markdown";
import wtf from "wtf_wikipedia";

wtf.extend(mdPlugin);

/**
 * Renders a specific section of a Wikipedia page in Markdown format.
 *
 * The component retrieves the page title and ID from local search parameters, fetches the page's wikitext
 * via a TRPC query, and then extracts and converts the designated section—identified by the title—to Markdown.
 * It slices off the section header from the converted Markdown and displays a skeleton view while the content loads.
 */
export default function Section() {
  const { title, pageId } = useLocalSearchParams();
  const wikiQuery = useQuery({
    queryKey: ["wikitext", pageId],
    queryFn: () =>
      fetch(`https://mapvoyage.b-cdn.net/en/${pageId}.wiki.txt`).then((r) =>
        r.text(),
      ),
  });
  const sectionWikitext = useMemo(
    () => (wikiQuery.data ? wtf(wikiQuery.data).section(title) : null),
    [wikiQuery.data, title],
  );

  const displayMarkdown = useMemo<string | null>(() => {
    if (sectionWikitext) {
      //@ts-ignore ts files seem to not work
      const md: string = sectionWikitext.markdown();

      // we dont want to redundantly display the section title
      const firstNL = md.indexOf("\n");
      return md.slice(firstNL + 1);
    } else return null;
  }, [sectionWikitext]);

  return (
    <View padding-8 flex>
      <Stack.Screen options={{ title }} />
      <SkeletonView
        template={SkeletonView.templates.TEXT_CONTENT}
        showContent={wikiQuery.isSuccess}
        renderContent={() =>
          !!displayMarkdown && (
            <BottomSheetScrollView>
              <Markdown>{displayMarkdown}</Markdown>
            </BottomSheetScrollView>
          )
        }
      />
    </View>
  );
}

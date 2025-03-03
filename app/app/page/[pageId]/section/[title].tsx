import { trpc } from "@/utils/trpc";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView, ScrollView } from "react-native";
import { View, Text, SkeletonView } from "react-native-ui-lib";
import Markdown from "react-native-markdown-display";
import { useMemo } from "react";
import wtf from "wtf_wikipedia";
import mdPlugin from "wtf-plugin-markdown";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

wtf.extend(mdPlugin);

export default function Section() {
  const { title, pageId } = useLocalSearchParams();
  const wikiQuery = trpc.getWikitext.useQuery({ pageId: parseInt(pageId) });
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
          !!displayMarkdown && <Markdown>{displayMarkdown}</Markdown>
        }
      />
    </View>
  );
}

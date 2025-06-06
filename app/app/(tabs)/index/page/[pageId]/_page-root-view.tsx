import { useIsFullscreen } from "@/hooks/use-is-fullscreen";
import { useMapStore } from "@/utils/store";
import { NodeType, RootNode } from "@bcye/structured-wikivoyage-types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { UseQueryResult } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { filter, map, splitEvery } from "ramda";
import { useEffect } from "react";
import { ScrollView } from "react-native";
import { Card, SkeletonView, View } from "react-native-ui-lib";
import { Text } from "react-native-ui-lib";

export default function PageRootView({
  pageQuery,
  id,
}: {
  pageQuery: UseQueryResult<RootNode, Error>;
  id: string | null;
}) {
  const isFullscreen = useIsFullscreen();

  const getData = () =>
    map(
      ([item1, item2]) => (
        <View
          flex
          row
          gap-8
          marginB-8
          key={item1.properties.title + item2?.properties.title}
        >
          <Infocard title={item1.properties.title} pageId={id!} />
          {item2 && <Infocard title={item2.properties.title} pageId={id!} />}
        </View>
      ),
      splitEvery(
        2,
        filter((c) => c.type === NodeType.Section, pageQuery.data!.children),
      ),
    );

  return (
    <View padding-8 flex>
      <Stack.Screen
        options={{ title: pageQuery.data?.properties.title ?? "Loading" }}
      />
      <SkeletonView
        template={SkeletonView.templates.LIST_ITEM}
        showContent={pageQuery.isSuccess}
        renderContent={() =>
          pageQuery.error ? (
            <Text color="red" text60>
              A network error occured and the place information could not be
              loaded.
            </Text>
          ) : pageQuery.data && id ? (
            !isFullscreen ? (
              <BottomSheetScrollView>{getData()}</BottomSheetScrollView>
            ) : (
              <ScrollView>{getData()}</ScrollView>
            )
          ) : null
        }
      />
    </View>
  );
}

/**
 * Renders a clickable infocard that links to a specific page section.
 *
 * This component creates a card-based link that navigates to a dynamic route structured as "/page/[pageId]/section/[title]".
 * The card displays the provided title, offering a concise navigational element within the app.
 *
 * @param title - The title displayed on the card and used as part of the destination route.
 * @param pageId - The identifier for the page, used to construct the dynamic navigation route.
 */
function Infocard({ title, pageId }: { title: string; pageId: string }) {
  return (
    <Link
      asChild
      href={{
        pathname: "/page/[pageId]/section/[title]",
        params: { pageId, title },
      }}
    >
      <Card flex padding-12 height={48}>
        <Card.Section content={[{ text: title, text60: true, grey10: true }]} />
      </Card>
    </Link>
  );
}

import { RootNode } from "@bcye/structured-wikivoyage-types";
import { UseQueryResult } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { PageContent } from "../../_shared/page-content";
import { ScrollContainer } from "../../_shared/scroll-container";
import { SkeletonView, Text, View } from "react-native-ui-lib";

export default function PageRootView({
  pageQuery,
  id,
}: {
  pageQuery: UseQueryResult<RootNode, Error>;
  id: string | null;
}) {
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
            <ScrollContainer>
              <PageContent
                id={id}
                pageQuery={pageQuery}
                basePath="/main/explore/page"
              />
            </ScrollContainer>
          ) : null
        }
      />
    </View>
  );
}

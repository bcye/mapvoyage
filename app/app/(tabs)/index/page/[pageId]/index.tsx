import useWikiQuery from "@/hooks/use-wiki-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import PageRootView from "./_page-root-view";
import useBackOnMapMove from "@/hooks/use-back-on-map-move";

export default function Page() {
  let { pageId } = useLocalSearchParams();
  pageId = typeof pageId === "string" ? pageId : pageId[0];
  const pageQuery = useWikiQuery(pageId);

  useBackOnMapMove();

  return <PageRootView pageQuery={pageQuery} id={pageId} />;
}

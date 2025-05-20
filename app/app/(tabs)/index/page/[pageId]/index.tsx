import useWikiQuery from "@/hooks/use-wiki-query";
import { useLocalSearchParams } from "expo-router";
import PageRootView from "./_page-root-view";

export default function Page() {
  let { pageId } = useLocalSearchParams();
  pageId = typeof pageId === "string" ? pageId : pageId[0];
  const pageQuery = useWikiQuery(pageId);

  return <PageRootView pageQuery={pageQuery} id={pageId} />;
}

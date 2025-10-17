import useWikiQuery from "@/hooks/use-wiki-query";
import { useLocalSearchParams } from "expo-router";
import PageRootView from "./_page-root-view";

/**
 * Fullscreen page view for pages without geographic data.
 * This route displays page content without the map layout.
 */
export default function FullscreenPage() {
  let { pageId } = useLocalSearchParams();
  pageId = typeof pageId === "string" ? pageId : pageId[0];
  const pageQuery = useWikiQuery(pageId);

  return <PageRootView pageQuery={pageQuery} id={pageId} />;
}

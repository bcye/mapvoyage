import useBackOnMapMove from "@/hooks/use-back-on-map-move";
import useMoveTo from "@/hooks/use-move-to";
import useWikiQuery from "@/hooks/use-wiki-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import PageRootView from "./_page-root-view";

export default function Page() {
  let { pageId } = useLocalSearchParams();
  pageId = typeof pageId === "string" ? pageId : pageId[0];
  const pageQuery = useWikiQuery(pageId);
  const moveTo = useMoveTo();

  useEffect(() => {
    if (pageQuery.data) {
      moveTo(
        // @ts-ignore NEEDS FIXING WHEN GEO REVISED
        parseFloat(pageQuery.data.properties.geo["2"]),
        // @ts-ignore NEEDS FIXING WHEN GEO REVISED
        parseFloat(pageQuery.data.properties.geo["1"]),
        // @ts-ignore NEEDS FIXING WHEN GEO REVISED
        parseFloat(pageQuery.data.properties.geo?.zoom),
      );
    }
  }, [pageQuery.data, moveTo]);

  useBackOnMapMove(pageQuery.isSuccess);

  return <PageRootView pageQuery={pageQuery} id={pageId} />;
}

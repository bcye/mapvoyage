import useWikiQuery from "@/hooks/use-wiki-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import PageRootView from "./_page-root-view";
import useBackOnMapMove from "@/hooks/use-back-on-map-move";
import { useMapStore } from "@/utils/store";
import { useEffect } from "react";
import useMoveTo from "@/hooks/use-move-to";

export default function Page() {
  let { pageId } = useLocalSearchParams();
  pageId = typeof pageId === "string" ? pageId : pageId[0];
  const pageQuery = useWikiQuery(pageId);
  const { setRegion, region } = useMapStore();
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
  }, [pageQuery.data]);

  useBackOnMapMove(pageQuery.isSuccess);

  return <PageRootView pageQuery={pageQuery} id={pageId} />;
}

import useMoveTo from "@/hooks/use-move-to";
import useWikiQuery from "@/hooks/use-wiki-query";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import PageRootView from "./_page-root-view";

export default function Page() {
  let { pageId } = useLocalSearchParams();
  pageId = typeof pageId === "string" ? pageId : pageId[0];
  const pageQuery = useWikiQuery(pageId);
  const moveTo = useMoveTo();

  useEffect(() => {
    if (pageQuery.data) {
      const hasGeo =
        pageQuery.data.properties.geo &&
        pageQuery.data.properties.geo["1"] &&
        pageQuery.data.properties.geo["2"];

      if (hasGeo) {
        moveTo(
          // @ts-ignore NEEDS FIXING WHEN GEO REVISED
          parseFloat(pageQuery.data.properties.geo["2"]),
          // @ts-ignore NEEDS FIXING WHEN GEO REVISED
          parseFloat(pageQuery.data.properties.geo["1"]),
          // @ts-ignore NEEDS FIXING WHEN GEO REVISED
          parseFloat(pageQuery.data.properties.geo?.zoom ?? "13"),
        );
      }
    }
  }, [pageQuery.data, moveTo]);

  // Redirect to fullscreen route if page has no geo data
  if (pageQuery.data) {
    const hasGeo =
      pageQuery.data.properties.geo &&
      pageQuery.data.properties.geo["1"] &&
      pageQuery.data.properties.geo["2"];

    if (!hasGeo) {
      return <Redirect href={`/main/explore/page-fullscreen/${pageId}`} />;
    }
  }

  return <PageRootView pageQuery={pageQuery} id={pageId} />;
}

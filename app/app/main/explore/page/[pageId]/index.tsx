import useMoveTo from "@/hooks/use-move-to";
import useWikiQuery from "@/hooks/use-wiki-query";
import { useSetFullscreen } from "@/hooks/use-is-fullscreen";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import PageRootView from "./_page-root-view";

export default function Page() {
  let { pageId } = useLocalSearchParams();
  pageId = typeof pageId === "string" ? pageId : pageId[0];
  const pageQuery = useWikiQuery(pageId);
  const moveTo = useMoveTo();
  const setFullscreen = useSetFullscreen();

  useEffect(() => {
    if (pageQuery.data) {
      const hasGeo =
        pageQuery.data.properties.geo &&
        pageQuery.data.properties.geo["1"] &&
        pageQuery.data.properties.geo["2"];

      if (hasGeo) {
        // Page has geo data, zoom to coordinates
        moveTo(
          // @ts-ignore NEEDS FIXING WHEN GEO REVISED
          parseFloat(pageQuery.data.properties.geo["2"]),
          // @ts-ignore NEEDS FIXING WHEN GEO REVISED
          parseFloat(pageQuery.data.properties.geo["1"]),
          // @ts-ignore NEEDS FIXING WHEN GEO REVISED
          parseFloat(pageQuery.data.properties.geo?.zoom ?? "13"),
        );
      } else {
        // Page has no geo data, open in fullscreen mode
        setFullscreen(true);
      }
    }
  }, [pageQuery.data, moveTo, setFullscreen]);

  return <PageRootView pageQuery={pageQuery} id={pageId} />;
}

import useCurrentId from "@/hooks/use-current-id";
import useWikiQuery from "@/hooks/use-wiki-query";
import { Stack, usePathname } from "expo-router";
import { View } from "react-native-ui-lib";
import PageRootView from "./page/[pageId]/_page-root-view";

/**
 * Renders the main index component.
 *
 * Retrieves the current region from the map store and conditionally displays an Infobox with the region details.
 * If no region is available, it returns an empty view.
 *
 * @returns A React element representing either the Infobox with region information or an empty view.
 */
export default function Index() {
  const id = useCurrentId();
  const wikiQuery = useWikiQuery(id ? id : undefined);

  return <PageRootView pageQuery={wikiQuery} id={id} />;
}

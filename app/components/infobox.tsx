import { trpc } from "@/utils/trpc";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { MapState } from "@rnmapbox/maps";
import { Bbox } from "@server/types/maptiler";
import React from "react";
import { useMemo } from "react";
import {
  GridList,
  GridView,
  Icon,
  SkeletonView,
  Text,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";
import { useDebounce } from "use-debounce";
import { Link } from "expo-router";

const snapPoints = ["20%", "40%", "100%"];

export default function Infobox({
  region,
}: {
  region: MapState["properties"];
}) {
  const [dRegion] = useDebounce(region, 200);
  const [lng, lat] = dRegion.center;
  // construct a bounding box from the visible bounds
  const { ne, sw } = dRegion.bounds;
  const bbox: Bbox = [sw[0], sw[1], ne[0], ne[1]];

  const query = useMemo(
    () => ({
      bbox,
      latLng: [lat, lng] as [number, number],
    }),
    [dRegion.center, dRegion.bounds],
  );
  const wikiQuery = trpc.getPage.useQuery(query);

  return (
    <BottomSheet index={1} snapPoints={snapPoints} enableDynamicSizing={false}>
      <BottomSheetScrollView>
        <View padding-8>
          <Text text40M center>
            {wikiQuery.data?.title ?? "Loading"}
          </Text>
          {!wikiQuery.data ? (
            <SkeletonView
              template={SkeletonView.templates.TEXT_CONTENT}
              showContent={wikiQuery.isLoading}
            />
          ) : (
            <>
              <View flex row gap-8 marginT-12>
                <Infocard pageId={wikiQuery.data.pageId} title="Understand" />
                <Infocard pageId={wikiQuery.data.pageId} title="History" />
              </View>
              <View flex row gap-8 marginT-8>
                <Infocard pageId={wikiQuery.data.pageId} title="See" />
                <Infocard pageId={wikiQuery.data.pageId} title="Eat" />
                <Infocard pageId={wikiQuery.data.pageId} title="Drink" />
              </View>
            </>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function Infocard({
  title,
  icon,
  pageId,
}: {
  title: string;
  icon?: string;
  pageId: string;
}) {
  return (
    <Link
      asChild
      href={{
        pathname: "/page/[pageId]/section/[title]",
        params: { pageId, title },
      }}
    >
      <TouchableOpacity bg-$backgroundNeutralMedium padding-8 br30 flex>
        {icon && <Icon source={icon} />}
        <Text text60L>{title}</Text>
      </TouchableOpacity>
    </Link>
  );
}

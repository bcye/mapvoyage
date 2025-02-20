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
  View,
} from "react-native-ui-lib";
import { useDebounce } from "use-debounce";

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
          {false ? (
            <SkeletonView
              template={SkeletonView.templates.TEXT_CONTENT}
              showContent={wikiQuery.isLoading}
            />
          ) : (
            <>
              <View flex row gap-4 marginT-12>
                <Infocard title="Understand" />
                <Infocard title="History" />
              </View>
              <View flex row gap-4 marginT-12>
                <Infocard title="See" />
                <Infocard title="Eat" />
                <Infocard title="Drink" />
              </View>
            </>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function Infocard({ title, icon }: { title: string; icon?: string }) {
  return (
    <View bg-$backgroundNeutralMedium padding-6 br30 flex height={50}>
      {icon && <Icon source={icon} />}
      <Text text60L>{title}</Text>
    </View>
  );
}

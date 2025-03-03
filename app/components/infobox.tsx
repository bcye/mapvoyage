import { trpc } from "@/utils/trpc";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { MapState } from "@rnmapbox/maps";
import { Bbox } from "@server/types/maptiler";
import { Link, Stack } from "expo-router";
import React, { useMemo } from "react";
import {
  Card,
  Icon,
  SkeletonView,
  Text,
  TouchableOpacity,
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

  console.log(!!wikiQuery.data, wikiQuery.data);

  return (
    <View padding-8 flex>
      <Stack.Screen options={{ title: wikiQuery.data?.title ?? "Loading" }} />
      <SkeletonView
        template={SkeletonView.templates.TEXT_CONTENT}
        showContent={wikiQuery.isSuccess}
        renderContent={() =>
          !!wikiQuery.data && (
            <View flex>
              <View row gap-8 marginT-12>
                <Infocard pageId={wikiQuery.data.pageId} title="Understand" />
                <Infocard pageId={wikiQuery.data.pageId} title="History" />
              </View>
              <View row gap-8 marginT-8>
                <Infocard pageId={wikiQuery.data.pageId} title="See" />
                <Infocard pageId={wikiQuery.data.pageId} title="Eat" />
                <Infocard pageId={wikiQuery.data.pageId} title="Drink" />
              </View>
            </View>
          )
        }
      />
    </View>
  );
}

function Infocard({ title, pageId }: { title: string; pageId: string }) {
  return (
    <Link
      asChild
      href={{
        pathname: "/page/[pageId]/section/[title]",
        params: { pageId, title },
      }}
    >
      <Card flex padding-12 height={48}>
        <Card.Section content={[{ text: title, text60: true, grey10: true }]} />
      </Card>
    </Link>
  );
}

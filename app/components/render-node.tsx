import {
  ListingNode,
  MarkerNode,
  NodeType,
  TemplateNode,
  WikiNode,
} from "@/types/nodes";
import {
  Fragment,
  MutableRefObject,
  Ref,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from "react";
import Markdown from "react-native-markdown-display";
import { Card, Text, TouchableOpacity, View } from "react-native-ui-lib";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Linking,
  UIManager,
  View as RView,
  findNodeHandle,
} from "react-native";
import { useMapStore } from "@/utils/store";
import { useLocalSearchParams, usePathname } from "expo-router";
import { useBottomSheetRef, useScrollRef } from "@/hooks/use-scroll-ref";
export default function WikiContent({
  node,
  root = false,
}: {
  node: WikiNode;
  root?: boolean;
}) {
  switch (node.type) {
    case NodeType.Section:
      return (
        <Fragment>
          {!root && node.properties.title && (
            <Markdown
              children={
                "".padStart(node.properties.level, "#") +
                " " +
                node.properties.title
              }
            />
          )}
          {node.children.map((c, idx) => (
            <WikiContent
              key={node.properties.title + idx.toString()}
              node={c}
            />
          ))}
        </Fragment>
      );
    case NodeType.Text:
      if (!node.properties.markdown) return null;
      return <Markdown children={node.properties.markdown} />;
    case NodeType.Root:
      return (
        <Fragment>
          {node.children.map((c, idx) => (
            <WikiContent key={idx} node={c} />
          ))}
        </Fragment>
      );
    case NodeType.See:
    case NodeType.Do:
    case NodeType.Drink:
    case NodeType.Eat:
    case NodeType.Buy:
    case NodeType.Sleep:
    case NodeType.Listing:
      return <Listing listing={node} />;
    case NodeType.Template:
      // @ts-ignore
      if (node.properties.name == "marker") return <Go node={node} />;
    default:
      console.log("not implemented", node.type, node.properties);
      return null;
  }
}

function Go({
  node: {
    properties: { params },
  },
}: {
  node: TemplateNode & { params: { long: string; lat: string; name: string } };
}) {
  return (
    <Card flex paddingV-4 paddingH-8 marginV-4>
      <Text text70BL>{params.name}</Text>
    </Card>
  );
}

function Listing({ listing: { properties } }: { listing: ListingNode }) {
  function openMap() {
    Linking.openURL("geo:" + properties.lat + "," + properties.long);
  }

  function openEmail() {
    Linking.openURL("mailto:" + properties.email);
  }

  const ref = useRef<RView>(null);
  const idx = useRegisterOnMap(properties.lat, properties.long, ref);

  return (
    <Card flex paddingV-4 paddingH-8 marginV-4>
      <Text text70BL>
        {idx + 1}: {properties.name}
      </Text>
      {!!properties.content && <Text>{properties.content}</Text>}
      <View
        ref={ref}
        marginT-8
        paddingT-8
        style={{ borderTopColor: "grey", borderTopWidth: 0.5 }}
      >
          <TouchableOpacity marginH-4 onPress={openMap}>
            <Text grey20 style={{ alignItems: "center" }}>
              <MaterialCommunityIcons name="map-marker-radius" size={20} />{" "}
              <Text blue10>
              {properties.address || [properties.lat, properties.long].join(", ")}
                {!!properties.directions &&
                    "(" +
                    properties.directions +
                    ")"}
              </Text>
            </Text>
          </TouchableOpacity>
        {!!properties.email && (
          <TouchableOpacity marginH-4 onPress={openEmail}>
            <Text grey20 style={{ alignItems: "center" }}>
              <MaterialCommunityIcons name="email" size={20} />{" "}
              <Text blue10>{properties.email}</Text>
            </Text>
          </TouchableOpacity>
        )}
        {!!properties.price && (
          <Text marginH-4 grey20 style={{ alignItems: "center" }}>
            <MaterialCommunityIcons name="card" size={20} /> {properties.price}
          </Text>
        )}
        {!!properties.hours && (
          <Text marginH-4 grey20 style={{ alignItems: "center" }}>
            <MaterialCommunityIcons name="clock" size={20} /> {properties.hours}
          </Text>
        )}
      </View>
    </Card>
  );
}

function useRegisterOnMap(
  lat: string,
  long: string,
  ref: MutableRefObject<RView | null>,
) {
  const coordsId = `${lat},${long}`;
  const registerCard = useMapStore((s) => s.registerMarker);
  const deregisterCard = useMapStore((s) => s.deregisterMarker);
  const markerIdx = useMapStore((s) => s.markers.findIndex((m) => m.id == coordsId));
  const scrollRef = useScrollRef();
  const bottomSheetRef = useBottomSheetRef();
  const path = usePathname();
  const { scrollTo } = useLocalSearchParams();

  useEffect(() => {
    const marker = {
      id: coordsId,
      lat: parseFloat(lat),
      long: parseFloat(long),
      link: path,
    };
    registerCard(marker);

    return () => {
      deregisterCard(marker);
    };
  }, [coordsId]);

  useEffect(() => {
    if (scrollTo == coordsId && scrollRef?.current && ref?.current) {
      ref.current!.measureLayout(
        scrollRef.current,
        (x, y) => {
          bottomSheetRef?.current?.expand();
          requestAnimationFrame(() => {
            scrollRef.current.scrollTo({ x: 0, y: y - 130, animated: true });
          });
        },
        () => {
          /* failure, noop */
        },
      );
    }
  }, [scrollTo, coordsId]);

  return markerIdx;
}

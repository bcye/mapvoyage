import { useBottomSheetRef, useScrollRef } from "@/hooks/use-scroll-ref";
import { ListingNode, NodeType, TemplateNode, WikiNode } from "@/types/nodes";
import { MarkerType, useMapStore } from "@/utils/store";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, usePathname } from "expo-router";
import { Fragment, MutableRefObject, useEffect, useRef } from "react";
import { Linking, View as RView } from "react-native";
import Markdown from "react-native-markdown-display";
import { Card, Text, TouchableOpacity, View } from "react-native-ui-lib";
import { HStack } from "./ui/hstack";
import { Pressable } from "./ui/pressable";
import openGeo from "@/utils/open-geo";
import { toast } from "sonner-native";
export default function WikiContent({
  node,
  root = false,
  isBookmarked,
  toggleBookmarked,
}: {
  node: WikiNode;
  root?: boolean;
  isBookmarked: (id: string) => boolean;
  toggleBookmarked: (id: string) => void;
}) {
  switch (node.type) {
    case NodeType.Section:
      return (
        <Fragment>
          {!root && node.properties.title && (
            <Markdown>
              {"".padStart(node.properties.level, "#") +
                " " +
                node.properties.title}
            </Markdown>
          )}
          {node.children.map((c, idx) => (
            <WikiContent
              key={node.properties.title + idx.toString()}
              node={c}
              isBookmarked={isBookmarked}
              toggleBookmarked={toggleBookmarked}
            />
          ))}
        </Fragment>
      );
    case NodeType.Text:
      if (!node.properties.markdown) return null;
      return <Markdown>{node.properties.markdown}</Markdown>;
    case NodeType.Root:
      return (
        <Fragment>
          {node.children.map((c, idx) => (
            <WikiContent
              key={idx}
              node={c}
              isBookmarked={isBookmarked}
              toggleBookmarked={toggleBookmarked}
            />
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
      return (
        <Listing
          listing={node}
          isBookmarked={isBookmarked}
          toggleBookmarked={toggleBookmarked}
        />
      );
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

function Listing({
  listing: { properties },
  isBookmarked,
  toggleBookmarked,
}: {
  listing: ListingNode;
  isBookmarked: (id: string) => boolean;
  toggleBookmarked: (id: string) => void;
}) {
  function openMap() {
    const query = `${properties.lat},${properties.long}`;
    if (query == ",") {
      toast.error("Invalid location, cannot be opened");
      return;
    }

    openGeo(query);
  }

  function openEmail() {
    Linking.openURL("mailto:" + properties.email);
  }

  const ref = useRef<RView>(null);
  const idx = useRegisterOnMap(
    properties.lat!,
    properties.long!,
    ref,
    isBookmarked,
  );

  return (
    <Card flex paddingV-4 paddingH-8 marginV-4>
      <HStack className="items-center mb-2">
        <Text text70BL flexG>
          {idx + 1}: {properties.name}
        </Text>
        <Pressable
          onPress={() =>
            toggleBookmarked(`${properties.lat},${properties.long}`)
          }
          className="flex"
        >
          <MaterialCommunityIcons
            name={
              isBookmarked(`${properties.lat},${properties.long}`)
                ? "bookmark"
                : "bookmark-outline"
            }
            size={18}
            color={
              isBookmarked(`${properties.lat},${properties.long}`)
                ? "primary"
                : "grey"
            }
          />
        </Pressable>
      </HStack>
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
              {properties.address ||
                [properties.lat, properties.long].join(", ")}
              {!!properties.directions && "(" + properties.directions + ")"}
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
  isBookmarked: (id: string) => boolean,
) {
  const coordsId = `${lat},${long}`;
  const registerCard = useMapStore((s) => s.registerMarker);
  const deregisterCard = useMapStore((s) => s.deregisterMarker);
  const markerIdx = useMapStore((s) =>
    s.markers.findIndex((m) => m.id == coordsId),
  );
  const scrollRef = useScrollRef();
  const bottomSheetRef = useBottomSheetRef();
  const path = usePathname();
  const { scrollTo } = useLocalSearchParams();

  useEffect(() => {
    // bookmarked items are registered elsewhere
    if (isBookmarked(coordsId)) return;

    const marker = {
      id: coordsId,
      lat: parseFloat(lat),
      long: parseFloat(long),
      link: path,
      type: MarkerType.Normal,
    };
    registerCard(marker);

    return () => {
      deregisterCard(marker);
    };
  }, [coordsId, isBookmarked, deregisterCard, lat, long, path, registerCard]);

  useEffect(() => {
    if (scrollTo == coordsId && scrollRef?.current && ref?.current) {
      ref.current!.measureLayout(
        // @ts-ignore this stuff is very weird
        scrollRef.current,
        (x, y) => {
          bottomSheetRef?.current?.expand();
          requestAnimationFrame(() => {
            // @ts-ignore
            scrollRef.current.scrollTo({ x: 0, y: y - 130, animated: true });
          });
        },
        () => {
          /* failure, noop */
        },
      );
    }
  }, [scrollTo, coordsId, bottomSheetRef, ref, scrollRef]);

  return markerIdx;
}

import { ListingNode, NodeType, WikiNode } from "@/types/nodes";
import { Fragment } from "react";
import Markdown from "react-native-markdown-display";
import { Card, Text, TouchableOpacity, View } from "react-native-ui-lib";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Linking } from "react-native";
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
    default:
      console.log("not implemented", node.type, node.properties);
      return null;
  }
}

function Listing({ listing: { properties } }: { listing: ListingNode }) {
  function openMap() {
    Linking.openURL("geo:" + properties.lat + "," + properties.long);
  }

  function openEmail() {
    Linking.openURL("mailto:" + properties.email);
  }

  console.log(properties);
  return (
    <Card flex paddingV-4 paddingH-8 marginV-4>
      <Text text70BL>{properties.name}</Text>
      {!!properties.content && <Text>{properties.content}</Text>}
      <View
        marginT-8
        paddingT-8
        style={{ borderTopColor: "grey", borderTopWidth: 0.5 }}
      >
        {!!(properties.address || properties.directions) && (
          <TouchableOpacity marginH-4 onPress={openMap}>
            <Text grey20 style={{ alignItems: "center" }}>
              <MaterialCommunityIcons name="map-marker-radius" size={20} />{" "}
              <Text blue10>
                {properties.address}
                {!!properties.directions &&
                  (properties.address ? " " : "") +
                    "(" +
                    properties.directions +
                    ")"}
              </Text>
            </Text>
          </TouchableOpacity>
        )}
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

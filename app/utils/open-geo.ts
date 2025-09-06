import { Linking, Platform } from "react-native";

export default function openGeo(query: string) {
  if (Platform.OS === "ios") {
    return Linking.openURL(`http://maps.apple.com/?q=${query}`);
  } else {
    return Linking.openURL(`geo:${query}`);
  }
}

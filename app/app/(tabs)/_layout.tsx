import { PRIMARY_COLOR } from "@/utils/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { wrap as wrapSentry } from "@sentry/react-native";

const TAB_ICON_SIZE = 24;

export default wrapSentry(function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY_COLOR,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              size={TAB_ICON_SIZE}
              name="map-legend"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              size={TAB_ICON_SIZE}
              name="bookmark-multiple"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              size={TAB_ICON_SIZE}
              name="cog"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
});

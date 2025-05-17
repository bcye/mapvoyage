import { PRIMARY_COLOR } from "@/utils/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { wrap as wrapSentry } from "@sentry/react-native";
import { IconName } from "@/utils/icon.types";

const TAB_ICON_SIZE = 24;

function getTabBarIcon(name: string, iconName: IconName) {
  return ({ color }: { color: string }) => (
    <MaterialCommunityIcons
      size={TAB_ICON_SIZE}
      name={iconName}
      color={color}
    />
  );
}

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
          tabBarIcon: getTabBarIcon("Explore", "map-legend"),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: getTabBarIcon("Search", "magnify"),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: getTabBarIcon("Bookmarks", "bookmark-multiple"),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: getTabBarIcon("Settings", "cog"),
        }}
      />
    </Tabs>
  );
});

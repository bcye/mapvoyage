import { PRIMARY_COLOR } from "@/utils/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { wrap as wrapSentry } from "@sentry/react-native";
import { IconName } from "@/utils/icon.types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { httpBatchLink } from "@trpc/client";
import { Toaster } from "sonner-native";

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

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${process.env.EXPO_PUBLIC_TRPC_BASE_URL}`,
    }),
  ],
});

export default wrapSentry(function TabLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
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
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: getTabBarIcon("Settings", "cog"),
              headerShown: true,
            }}
          />
        </Tabs>
        <Toaster />
      </QueryClientProvider>
    </trpc.Provider>
  );
});

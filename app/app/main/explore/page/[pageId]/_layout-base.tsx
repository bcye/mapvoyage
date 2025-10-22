import { ScrollRefProvider } from "@/hooks/use-scroll-ref";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, Stack, usePathname } from "expo-router";
import { ComponentType, ReactNode } from "react";

export function withFullscreenLayout(
  LayoutComp: ComponentType<{ children: ReactNode }>,
  isFullscreen: boolean,
) {
  function RootLayout() {
    const pathname = usePathname();
    const navigationName = isFullscreen
      ? pathname.replace("fullscreen", "map")
      : pathname.replace("map", "fullscreen");

    const stack = (
      <Stack
        screenOptions={{
          headerRight: () => (
            // @ts-ignore Can't be dynamically inferred
            <Link asChild href={navigationName}>
              <MaterialCommunityIcons
                name={isFullscreen ? "fullscreen-exit" : "fullscreen"}
                size={28}
                color="inherit"
              />
            </Link>
          ),
        }}
      />
    );

    return (
      <ScrollRefProvider>
        <LayoutComp>{stack}</LayoutComp>
      </ScrollRefProvider>
    );
  }

  return RootLayout;
}

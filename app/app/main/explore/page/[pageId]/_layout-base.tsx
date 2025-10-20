import { ScrollRefProvider } from "@/hooks/use-scroll-ref";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, Stack } from "expo-router";
import { ComponentType, ReactNode } from "react";

export function withFullscreenLayout(
  LayoutComp: ComponentType<{ children: ReactNode }>,
  isFullscreen: boolean,
) {
  function RootLayout() {
    const stack = (
      <Stack
        screenOptions={{
          headerRight: () => (
            <Link asChild href={isFullscreen ? "./map" : "./fullscreen"}>
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

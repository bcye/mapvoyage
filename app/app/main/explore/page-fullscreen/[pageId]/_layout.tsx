import { FullScreenProvider } from "@/hooks/use-is-fullscreen";
import { ScrollRefProvider } from "@/hooks/use-scroll-ref";
import { Stack } from "expo-router";

/**
 * Layout for fullscreen page view (no map).
 * Used for pages that don't have geographic coordinates.
 */
export default function FullscreenPageLayout() {
  return (
    <FullScreenProvider fullscreen={true}>
      <ScrollRefProvider>
        <Stack />
      </ScrollRefProvider>
    </FullScreenProvider>
  );
}

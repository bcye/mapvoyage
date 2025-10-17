import { useIsFullscreen } from "@/hooks/use-is-fullscreen";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { ReactNode } from "react";
import { ScrollView } from "react-native";

/**
 * Shared scroll container that uses BottomSheetScrollView when not fullscreen,
 * and regular ScrollView when fullscreen.
 */
export function ScrollContainer({
  children,
  scrollRef,
}: {
  children: ReactNode;
  scrollRef?: React.Ref<any>;
}) {
  const isFullscreen = useIsFullscreen();

  if (isFullscreen) {
    return <ScrollView ref={scrollRef}>{children}</ScrollView>;
  }

  return (
    <BottomSheetScrollView ref={scrollRef}>{children}</BottomSheetScrollView>
  );
}
